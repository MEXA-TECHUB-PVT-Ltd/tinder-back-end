
const { pool } = require("../../config/db.config");
const { use } = require("../../routes/Swipes/swipeRoute");
const schedule = require('node-schedule');
const fs = require('fs');
const moment = require('moment-timezone');
const pakistanTime = moment().tz('Asia/Karachi');

exports.viewCards = async (req, res) => {
    try {
        let user_id = req.query.user_id;
        const radius = parseInt(req.query.radius) || 10;
        const limit = parseInt(req.query.limit) || 10; // Default to 10 matches per page
        let page = parseInt(req.query.page) // Default to the first page
        let latitude = req.query.latitude
        let longitude = req.query.longitude
        if (!user_id || !radius || !limit || !page || !latitude || !longitude) {
            return (
                res.json({
                    message: "user_id , radius , limit , latitude, longitude and page must be provided",
                    status: false
                })
            )
        }

        const gender = req.query.gender;
        const start_age = req.query.start_age;
        const end_age = req.query.end_age;
        const common_interest = req.query.common_interest;
        const recently_online = req.query.recently_online;

        if (start_age || end_age) {
            if (start_age && end_age) {
            }
            else {
                return (
                    res.json({
                        message: "start_age and end_age must be provided if you want to apply age filter , otherwise dont provide any of them",
                        status: false
                    })
                )
            }
        }


        user_id = parseInt(user_id)
        latitude = parseFloat(latitude);
        longitude = parseFloat(longitude);


        if (page < 1) {
            return (res.json({ message: "page must be greater than 0", status: false }))
        }

        let offset = (page - 1) * limit;

        const excludeProfileIds = await getSwipedProfileIds(user_id, 'right');
        const potentialMatches = await getPotentialMatches(latitude, longitude, user_id, excludeProfileIds, limit, offset, radius, start_age, end_age, gender, common_interest, recently_online);
        if (potentialMatches) {
            res.json({
                message: "Fetched Successfully",
                status: true,
                potentialMatches: potentialMatches
            })
        }
        else {
            res.json({
                message: "Could not fetch",
                status: false
            })
        }
    }
    catch (err) {
        res.json({
            message: "Error Occurred",
            status: false,
            error: err.message
        })
    }
}

exports.swipe = async (req, res) => {
    const client = await pool.connect();
    try {
        const user_id = req.body.user_id;  
        const swiped_user_id = req.body.swiped_user_id; 
        const swipe_direction = req.body.swipe_direction; 
        const likeType = req.body.likeType;
        let liked;
        let superLiked;

        let result;
        let match_found;

        if (!user_id || !swipe_direction || !swiped_user_id) {
            return (res.json({ message: "user_id , swiped_user_id and swipe_direction must be provided", status: false }))
        }

        if (swipe_direction == 'right') {
            if (!likeType) {
                return (
                    res.json({
                        message: "like type must be required if swipe_direction is right",
                        status: false
                    })
                )
            }
            if (likeType == 'like' || likeType == 'superLike') { } else { return (res.json({ message: "like type must be only 'like' OR 'superLike'", status: false })) }


        }
        if (swipe_direction == 'left' || swipe_direction == 'right') { } else { return (res.json({ message: "swipe direction must be left or right", status: false })) }

        if (likeType == 'like') {
            liked = true;
            superLiked = false
        }
        else if (likeType == 'superLike') {
            superLiked = true
            liked = true
        }
        else if (!likeType) {
            liked = false,
                superLiked = false
        }
        const checkAlreadySwipeQuery = 'SELECT * FROM swipes WHERE user_id = $1 AND swiped_user_id = $2';
        const checkResult = await pool.query(checkAlreadySwipeQuery, [user_id, swiped_user_id]);


        if (checkResult.rowCount > 0) {
            // already swiped by this user , no matter left or right
            let updateQuery = 'UPDATE swipes SET user_id = $1  , swipe_direction= $2 ,swiped_user_id = $3 ,liked = $4, superLiked= $5 WHERE user_id = $6 AND swiped_user_id = $7 RETURNING*';
            result = await pool.query(updateQuery, [user_id, swipe_direction, swiped_user_id, liked, superLiked, user_id, swiped_user_id]);
            if (result.rows[0]) {
                result = result.rows[0]
            }
        }
        else {
            let insertQuery = 'INSERT INTO swipes (user_id , swiped_user_id ,swipe_direction , liked , superLiked) VALUES ($1 ,$2 ,$3 , $4 , $5) RETURNING *';
            result = await pool.query(insertQuery, [user_id, swiped_user_id, swipe_direction, liked, superLiked]);
            if (result.rows[0]) {
                result = result.rows[0]
            }
        }


        const checkMatch = await checkForMatch(user_id, swiped_user_id, pool);
        if (checkMatch) {
            match_found = true
        } else {
            match_found = false;
        }



        if (result) {
            res.json({
                message: "Swipe successfully created",
                status: true,
                match_found: match_found,
                result: result
            })
        }
        else {
            res.json({
                message: "Could not create swipe",
                status: false,
            })
        }
    }
    catch (err) {
        res.json({
            message: "Error Occurred",
            status: false,
            error: err.message
        })
    }
    finally {
        client.release();
    }
}

exports.getAllMatches = async (req, res) => {
    try {
        const user_id = req.query.user_id;
        if (!user_id) {
            return (
                res.json({
                    message: "User id must be provided",
                    status: false
                })
            )
        }

        let user_details;
        const query = 'SELECT * FROM users WHERE user_id = $1'
        const foundResult = await pool.query(query, [user_id]);
        if (foundResult.rows) {
            if (foundResult.rows[0]) {
                user_details = foundResult.rows[0]
            }
        } else {
            return (
                res.json({
                    message: "It seems user data is not found in user table according to this id , make sure user with this id exists",
                    status: false
                })
            )

        }


        const result = await getMatches(user_id);
        if (result) {
            user_details.matches = result
        }

        if (user_details) {
            res.json({
                message: "All mathes of this user fethced",
                status: true,
                result: user_details
            })
        }
        else {
            res.json({
                message: "Could not fetch matches",
                status: false,
            })
        }
    }
    catch (err) {
        res.json({
            message: "Error Occurred",
            status: false,
            error: err.message
        })
    }
}

exports.rewindSwipe = async (req, res) => {
    const client = await pool.connect();
    try {
        const user_id = req.body.user_id;
        const swiped_user_id = req.body.swiped_user_id;

        if (!user_id || !swiped_user_id) {
            return (res.json({ message: "user_id , swiped_user_id  must be provided", status: false }))
        }

        const foundQuery = 'SELECT * FROM swipes WHERE user_id = $1 AND swiped_user_id = $2';
        const foundResult = await pool.query(foundQuery, [user_id, swiped_user_id]);

        if (foundResult.rowCount == 0) {
            return (
                res.json({
                    message: "Swipe does not exist for this user_id and swiped_user_id",
                    status: false
                })
            )
        }
        if (foundResult.rows[0]) {
            if (!foundResult.rows[0].swipe_id) {
                return (
                    res.json({
                        message: "swipe id not found for this record in db",
                        status: false
                    })
                )
            }
        }

        let swipe_id = foundResult.rows[0].swipe_id;
        if (swipe_id) {
            const query = 'DELETE FROM swipes WHERE swipe_id = $1 RETURNING *';
            const result = await pool.query(query, [swipe_id]);

            if (result.rowCount > 0) {
                res.status(200).json({
                    message: "Deletion successfull",
                    status: true,
                    deletedRecord: result.rows[0]
                })
            }
            else {
                res.status(404).json({
                    message: "Could not delete . Record With this Id may not found or req.body may be empty",
                    status: false,
                })
            }
        }
    }
    catch (err) {
        throw err;
    } finally {
        client.release();
    }
}

exports.getAllSuperLikes = async (req, res) => {
    const client = await pool.connect();
    try {
        const user_id = req.query.user_id;

        if (!user_id) {
            return (res.json({ message: "user_id  must be provided", status: false }))
        }

        const foundQuery = `SELECT swipes.user_id , swipes.liked , swipes.superLiked ,users.name, users.email , users.images
        FROM swipes
        LEFT OUTER JOIN users ON swipes.swiped_user_id = users.user_id
        WHERE swipes.swiped_user_id = $1 AND swipes.superLiked = $2;`;
        const foundResult = await pool.query(foundQuery, [user_id, true]);

        if (foundResult.rows) {
            res.json({
                message: "All users who have super liked you, are here",
                status: true,
                result: foundResult.rows
            })
        }
        else {
            res.json({
                message: "Could not fetch",
                status: false
            })
        }



    }
    catch (err) {
        throw err;
    } finally {
        client.release();
    }
}

exports.getAllSuperLikedUsers = async (req, res) => {
    const client = await pool.connect();
    try {

        const foundQuery = `SELECT  u.user_id , u.email, u.password, , u.images , u.name,
        json_agg(json_build_object(
            'swipe_direction', s.swipe_direction,
            'user_id', s.user_id,
            'liked', s.liked,
            'superLiked', s.superLiked,
            'created_at', s.created_at,
            'updated_at', s.updated_at
        )) AS super_liked_by
        FROM swipes s
        JOIN users u ON s.swiped_user_id = u.user_id
        WHERE s.superLiked = TRUE
        GROUP BY u.user_id,u.email, u.password
 
        `;
        const foundResult = await pool.query(foundQuery);

        if (foundResult.rows) {
            res.json({
                message: "All users with the users who super liked them",
                status: true,
                result: foundResult.rows
            })
        }
        else {
            res.json({
                message: "Could not fetch",
                status: false
            })
        }



    }
    catch (err) {
        throw err;
    } finally {
        client.release();
    }
}

exports.getRightSwipesOfUser = async (req, res) => {
    const client = await pool.connect();
    try {
        const user_id = req.query.user_id;

        if (!user_id) {
            return (res.json({ message: "user_id  must be provided", status: false }))
        }

        const foundQuery = `
        SELECT
            wtr.swipe_id,
            wtr.swipe_direction,
            wtr.user_id,
            wtr.swiped_user_id,
            wtr.liked,
            wtr.superLiked,
            json_build_object(
                'user_id', wt.user_id,
                'name', wt.name,
                'email', wt.email,
                'phone_number', wt.phone_number,
                'password', wt.password,
                'dob', wt.dob,
                'relation_type', wt.relation_type,
                'school', wt.school,
                'interest', wt.interest,
                'job_title', wt.job_title,
                'company', wt.company,
                'category_id', wt.category_id,
                'active_status', wt.active_status,
                'gender', wt.gender,
                'bio', wt.bio,
                'images', wt.images,
                'preference', wt.preference,
                'city', wt.city,
                'country', wt.country,
                'longitude', wt.longitude,
                'latitude', wt.latitude,
                'login_type', wt.login_type,
                'insta_id', wt.insta_id,
                'spotify_id', wt.spotify_id,
                'block_status', wt.block_status,
                'created_at', wt.created_at,
                'updated_at', wt.updated_at,
                'profile_boosted', wt.profile_boosted,
                'last_online_time', wt.last_online_time,
                'subscribed_status', wt.subscribed_status,
                'verified_by_email', wt.verified_by_email
            ) AS user_details,
            json_build_object(
                'user_id', wtu.user_id,
                'name', wtu.name,
                'email', wtu.email,
                'phone_number', wtu.phone_number,
                'password', wtu.password,
                'dob', wtu.dob,
                'relation_type', wtu.relation_type,
                'school', wtu.school,
                'interest', wtu.interest,
                'job_title', wtu.job_title,
                'company', wtu.company,
                'category_id', wtu.category_id,
                'active_status', wtu.active_status,
                'gender', wtu.gender,
                'bio', wtu.bio,
                'images', wtu.images,
                'preference', wtu.preference,
                'city', wtu.city,
                'country', wtu.country,
                'longitude', wtu.longitude,
                'latitude', wtu.latitude,
                'login_type', wtu.login_type,
                'insta_id', wtu.insta_id,
                'spotify_id', wtu.spotify_id,
                'block_status', wtu.block_status,
                'created_at', wtu.created_at,
                'updated_at', wtu.updated_at,
                'profile_boosted', wtu.profile_boosted,
                'last_online_time', wtu.last_online_time,
                'subscribed_status', wtu.subscribed_status,
                'verified_by_email', wtu.verified_by_email
            ) AS swiped_user_details
        FROM
            swipes wtr
            JOIN users wt ON wtr.user_id = wt.user_id
            JOIN users wtu ON wtr.swiped_user_id = wtu.user_id
        WHERE
            wtr.user_id = $1 AND wtr.swipe_direction = $2;
    `;


        const foundResult = await pool.query(foundQuery, [user_id, "right"]);


        if (foundResult.rows) {
            res.json({
                message: "All users swiped by this user",
                status: true,
                result: foundResult.rows
            })
        }
        else {
            res.json({
                message: "Could not fetch",
                status: false
            })
        }
    }
    catch (err) {
        throw err;
    } finally {
        client.release();
    }
}

exports.getLeftSwipesOfUser = async (req, res) => {
    const client = await pool.connect();
    try {
        const user_id = req.query.user_id;

        if (!user_id) {
            return (res.json({ message: "user_id  must be provided", status: false }))
        }

        const foundQuery = `
        SELECT
            wtr.swipe_id,
            wtr.swipe_direction,
            wtr.user_id,
            wtr.swiped_user_id,
            wtr.liked,
            wtr.superLiked,
            json_build_object(
                'user_id', wt.user_id,
                'name', wt.name,
                'email', wt.email,
                'phone_number', wt.phone_number,
                'password', wt.password,
                'dob', wt.dob,
                'relation_type', wt.relation_type,
                'school', wt.school,
                'interest', wt.interest,
                'job_title', wt.job_title,
                'company', wt.company,
                'category_id', wt.category_id,
                'active_status', wt.active_status,
                'gender', wt.gender,
                'bio', wt.bio,
                'images', wt.images,
                'preference', wt.preference,
                'city', wt.city,
                'country', wt.country,
                'longitude', wt.longitude,
                'latitude', wt.latitude,
                'login_type', wt.login_type,
                'insta_id', wt.insta_id,
                'spotify_id', wt.spotify_id,
                'block_status', wt.block_status,
                'created_at', wt.created_at,
                'updated_at', wt.updated_at,
                'profile_boosted', wt.profile_boosted,
                'last_online_time', wt.last_online_time,
                'subscribed_status', wt.subscribed_status,
                'verified_by_email', wt.verified_by_email
            ) AS user_details,
            json_build_object(
                'user_id', wtu.user_id,
                'name', wtu.name,
                'email', wtu.email,
                'phone_number', wtu.phone_number,
                'password', wtu.password,
                'dob', wtu.dob,
                'relation_type', wtu.relation_type,
                'school', wtu.school,
                'interest', wtu.interest,
                'job_title', wtu.job_title,
                'company', wtu.company,
                'category_id', wtu.category_id,
                'active_status', wtu.active_status,
                'gender', wtu.gender,
                'bio', wtu.bio,
                'images', wtu.images,
                'preference', wtu.preference,
                'city', wtu.city,
                'country', wtu.country,
                'longitude', wtu.longitude,
                'latitude', wtu.latitude,
                'login_type', wtu.login_type,
                'insta_id', wtu.insta_id,
                'spotify_id', wtu.spotify_id,
                'block_status', wtu.block_status,
                'created_at', wtu.created_at,
                'updated_at', wtu.updated_at,
                'profile_boosted', wtu.profile_boosted,
                'last_online_time', wtu.last_online_time,
                'subscribed_status', wtu.subscribed_status,
                'verified_by_email', wtu.verified_by_email
            ) AS swiped_user_details
        FROM
            swipes wtr
            JOIN users wt ON wtr.user_id = wt.user_id
            JOIN users wtu ON wtr.swiped_user_id = wtu.user_id
        WHERE
            wtr.user_id = $1 AND wtr.swipe_direction = $2;
    `;


        const foundResult = await pool.query(foundQuery, [user_id, "left"]);


        if (foundResult.rows) {
            res.json({
                message: "All users swiped by this user",
                status: true,
                result: foundResult.rows
            })
        }
        else {
            res.json({
                message: "Could not fetch",
                status: false
            })
        }
    }
    catch (err) {
        throw err;
    } finally {
        client.release();
    }
}

exports.boost = async (req, res) => {
    const client = await pool.connect();
    try {
        const user_id = req.query.user_id;
        if (!user_id) {
            return (res.json({
                message: "user_id must be privided",
                status: false
            }))
        }

        const query = 'UPDATE users SET profile_boosted = $1 WHERE user_id = $2 RETURNING*';
        const result = await pool.query(query, [true, user_id]);

        if (result.rows.length > 0) {
            const job = schedule.scheduleJob(new Date(Date.now() + 30 * 60 * 1000), async function () {
                const query = 'UPDATE users SET profile_boosted = $1 WHERE user_id = $2 RETURNING *';
                const result = await pool.query(query, [false, user_id]);
                const deleteScheduledTaskQuery = "DELETE FROM schedules_tables WHERE user_id = $1 RETURNING*";
                const deltedResult = await pool.query(deleteScheduledTaskQuery, [user_id]);
                if (deltedResult.rows[0]) {
                    console.log('boosted profile time end')
                }
            });

            let executeat = new Date(Date.now() + (30 * 60 * 1000));
            let start_at = new Date(Date.now());

            // Save the scheduled job details to the DB,

            const insertLogQuery = 'INSERT INTO schedules_tables (user_id , executeat , start_at) VALUES($1, $2, $3) RETURNING *';

            const insertResult = await pool.query(insertLogQuery, [user_id, executeat, start_at]);
            if (insertResult.rows[0]) {
            } else {
            }

            result.rows[0].boost_start = start_at
            result.rows[0].boost_end = executeat;
            setTimeout(function () {
                job.cancel();
            }, 1 * 60 * 1000);

            if (result.rows.length > 0) {
                res.json({
                    message: "Profile is boosted successfully",
                    status: true,
                    result: result.rows[0]
                })
            }
            else {
                res.json({
                    message: "Could not boost",
                    status: false
                })
            }

        }
        else {
            res.json({
                message: "Could not boost",
                status: false
            })
        }
    }
    catch (err) {
        throw err;
    } finally {
        client.release();
    }
}

exports.getAllBoostedProfiles = async (req, res) => {
    const client = await pool.connect();
    const { user_id } = req.query;
    try {
        if (!user_id) {
            return res.json({
                message: "User_id is required",
                status: false,
            })
        }
        const query = 'SELECT * FROM users WHERE profile_boosted = $1 AND user_id != $2 AND incognito_status = $3';
        const result = await pool.query(query, [true, user_id, false]);

        if (result.rows.length > 0) {
            res.json({
                message: "All current boosted profiles",
                status: true,
                result: result.rows
            })
        } else {
            res.json({
                message: "Not Found",
                status: false,
            })
        }
    }
    catch (err) {
        throw err;
    } finally {
        client.release();
    }
}

exports.getAllUserWhoLikedYou = async (req, res) => {
    const client = await pool.connect();
    try {
        const user_id = req.query.user_id;

        if (!user_id) {
            return (res.json({ message: "user_id  must be provided", status: false }))
        }

        const foundQuery = `
        SELECT
            wtr.swipe_id,
            wtr.swipe_direction,
            wtr.user_id,
            wtr.swiped_user_id,
            wtr.liked,
            wtr.superLiked,
            json_build_object(
                'user_id', wt.user_id,
                'name', wt.name,
                'email', wt.email,
                'phone_number', wt.phone_number,
                'password', wt.password,
                'dob', wt.dob,
                'relation_type', wt.relation_type,
                'school', wt.school,
                'interest', wt.interest,
                'job_title', wt.job_title,
                'company', wt.company,
                'category_id', wt.category_id,
                'active_status', wt.active_status,
                'gender', wt.gender,
                'bio', wt.bio,
                'images', wt.images,
                'preference', wt.preference,
                'city', wt.city,
                'country', wt.country,
                'longitude', wt.longitude,
                'latitude', wt.latitude,
                'login_type', wt.login_type,
                'insta_id', wt.insta_id,
                'spotify_id', wt.spotify_id,
                'block_status', wt.block_status,
                'created_at', wt.created_at,
                'updated_at', wt.updated_at,
                'profile_boosted', wt.profile_boosted,
                'last_online_time', wt.last_online_time,
                'subscribed_status', wt.subscribed_status,
                'verified_by_email', wt.verified_by_email
            ) AS user_details,
            json_build_object(
                'user_id', wtu.user_id,
                'name', wtu.name,
                'email', wtu.email,
                'phone_number', wtu.phone_number,
                'password', wtu.password,
                'dob', wtu.dob,
                'relation_type', wtu.relation_type,
                'school', wtu.school,
                'interest', wtu.interest,
                'job_title', wtu.job_title,
                'company', wtu.company,
                'category_id', wtu.category_id,
                'active_status', wtu.active_status,
                'gender', wtu.gender,
                'bio', wtu.bio,
                'images', wtu.images,
                'preference', wtu.preference,
                'city', wtu.city,
                'country', wtu.country,
                'longitude', wtu.longitude,
                'latitude', wtu.latitude,
                'login_type', wtu.login_type,
                'insta_id', wtu.insta_id,
                'spotify_id', wtu.spotify_id,
                'block_status', wtu.block_status,
                'created_at', wtu.created_at,
                'updated_at', wtu.updated_at,
                'profile_boosted', wtu.profile_boosted,
                'last_online_time', wtu.last_online_time,
                'subscribed_status', wtu.subscribed_status,
                'verified_by_email', wtu.verified_by_email
            ) AS swiped_user_details
        FROM
            swipes wtr
            JOIN users wt ON wtr.user_id = wt.user_id
            JOIN users wtu ON wtr.swiped_user_id = wtu.user_id
        WHERE
            wtr.swiped_user_id = $1 AND wtr.swipe_direction = $2;
    `;


        const foundResult = await pool.query(foundQuery, [user_id, "right"]);


        if (foundResult.rows) {
            res.json({
                message: "All Users who swiped This user",
                status: true,
                result: foundResult.rows
            })
        }
        else {
            res.json({
                message: "Could not fetch",
                status: false
            })
        }
    }
    catch (err) {
        throw err;
    } finally {
        client.release();
    }
}

exports.getAllPlatformMatchesCount = async (req, res) => {
    try {
        const query = `SELECT COUNT(*) AS total_matches
        FROM (
          SELECT LEAST(user_id, swiped_user_id) AS user1,
                 GREATEST(user_id, swiped_user_id) AS user2
          FROM swipes
          WHERE liked = true
          GROUP BY LEAST(user_id, swiped_user_id), GREATEST(user_id, swiped_user_id)
          HAVING COUNT(*) = 2
        ) AS matches;
        `;

        const result = await pool.query(query);
        if (result.rows[0]) {
            res.json({
                message: "Success",
                status: true,
                result: result.rows[0]
            })
        }
        else {
            res.json({
                message: " Could not found",
                status: false
            })
        }
    }
    catch (err) {
        res.json({
            message: "Error Occured",
            status: false,
            error: err.message
        })
    }
}

async function checkForMatch(userId, swipedUserId, pool) {
    try {
        const result = await pool.query(`
      SELECT *
      FROM swipes
      WHERE (user_id = $1 AND swiped_user_id = $2 AND swipe_direction = 'right')
        OR (user_id = $2 AND swiped_user_id = $1 AND swipe_direction = 'right')
    `, [userId, swipedUserId]);

        if (result.rowCount === 2) {

            // Both users have swiped right on each other, so it's a match!
            // Send a message to both users here
            return true;
        } else {
            // Not a match yet
            return false;
        }
    } catch (err) {
        throw err;
    }
}

async function getMatches(userId) {
    const client = await pool.connect();
    try {
        const result = await client.query(`
        SELECT *
        FROM users
        WHERE user_id IN (
          SELECT swiped_user_id
          FROM swipes
          WHERE user_id = $1 AND swipe_direction = 'right'
            AND swiped_user_id IN (
              SELECT user_id
              FROM swipes
              WHERE swiped_user_id = $1 AND swipe_direction = 'right'
            )
        )
      `, [userId]);

        return result.rows;
    } catch (err) {
        throw err;
    } finally {
        client.release();
    }
}

async function getSwipedProfileIds(userId, direction) {
    try {
        const query = 'SELECT swiped_user_id FROM swipes WHERE user_id = $1 AND swipe_direction = $2';
        const values = [userId, direction];
        const result = await pool.query(query, values);
        return result.rows.map(row => (row.swiped_user_id));
    }
    catch (err) {

    }

}

async function getPotentialMatches(latitude, longitude, userId, excludeProfileIds, limit, offset, maxDistance, start_age, end_age, gender, common_interest, recently_online) {
    try {

        let query;

        if (gender && !recently_online) {
            query = `
        SELECT *,
        EXTRACT(YEAR FROM age(current_date , to_date(dob, 'YYYY-MM-DD'))) AS age_years,
        acos(sin(radians($1)) * sin(radians(latitude))
            + cos(radians($1)) * cos(radians(latitude))
            * cos(radians($2) - radians(longitude))) * 6371 AS distance
    FROM users
    WHERE user_id <> $3
        AND user_id <> ALL($4)
        AND gender = $8
        AND acos(sin(radians($1)) * sin(radians(latitude))
            + cos(radians($1)) * cos(radians(latitude))
            * cos(radians($2) - radians(longitude))) * 6371 <= $5
            
    ORDER BY profile_boosted DESC
    OFFSET $6 LIMIT $7;

`;
        }

        else if (recently_online && !gender) {
            query = `
            SELECT *,
            EXTRACT(YEAR FROM age(current_date , to_date(dob, 'YYYY-MM-DD'))) AS age_years,
            acos(sin(radians($1)) * sin(radians(latitude))
                + cos(radians($1)) * cos(radians(latitude))
                * cos(radians($2) - radians(longitude))) * 6371 AS distance
        FROM users
        WHERE user_id <> $3
            AND user_id <> ALL($4)
            AND acos(sin(radians($1)) * sin(radians(latitude))
                + cos(radians($1)) * cos(radians(latitude))
                * cos(radians($2) - radians(longitude))) * 6371 <= $5
                AND last_online_time >= NOW() - INTERVAL '30 minutes'
                
        ORDER BY profile_boosted DESC
        OFFSET $6 LIMIT $7;
    
    `;
        }

        else if (gender && recently_online) {
            query = `
            SELECT *,
            EXTRACT(YEAR FROM age(current_date , to_date(dob, 'YYYY-MM-DD'))) AS age_years,
            acos(sin(radians($1)) * sin(radians(latitude))
                + cos(radians($1)) * cos(radians(latitude))
                * cos(radians($2) - radians(longitude))) * 6371 AS distance
                FROM users
                WHERE user_id <> $3
                    AND user_id <> ALL($4)
                    AND gender = $8
                    AND acos(sin(radians($1)) * sin(radians(latitude))
                        + cos(radians($1)) * cos(radians(latitude))
                        * cos(radians($2) - radians(longitude))) * 6371 <= $5
                        AND last_online_time >= NOW() - INTERVAL '30 minutes'
                
                ORDER BY profile_boosted DESC
                OFFSET $6 LIMIT $7;
    
            `;
        }
        else {
            query = `
            SELECT *,
            EXTRACT(YEAR FROM age(current_date , to_date(dob, 'YYYY-MM-DD'))) AS age_years,
            acos(sin(radians($1)) * sin(radians(latitude))
                + cos(radians($1)) * cos(radians(latitude))
                * cos(radians($2) - radians(longitude))) * 6371 AS distance
        FROM users
        
        WHERE user_id <> $3
            AND user_id <> ALL($4)
            AND acos(sin(radians($1)) * sin(radians(latitude))
                + cos(radians($1)) * cos(radians(latitude))
                * cos(radians($2) - radians(longitude))) * 6371 <= $5
        ORDER BY profile_boosted DESC
        OFFSET $6 LIMIT $7;
    
    `;
        }

        let values;
        if (gender) {
            values = [latitude, longitude, userId, excludeProfileIds, maxDistance, offset, limit, gender];
        }
        else {
            values = [latitude, longitude, userId, excludeProfileIds, maxDistance, offset, limit];

        }
        const result = await pool.query(query, values);
        let array = result.rows;

        if (start_age && end_age) {
            if (array) {
                array = array.filter(record => {
                    if (record.age_years) {
                        if (record.age_years >= start_age && record.age_years <= end_age) {
                            return record
                        }
                    }
                })
            }
        }

        if (common_interest == 'true') {
            let interestQuery = 'SELECT * FROM users WHERE user_id = $1';
            let current_user_interest;
            let interestResult = await pool.query(interestQuery, [userId]);

            if (interestResult) {
                if (interestResult.rows[0].interest) {
                    current_user_interest = interestResult.rows[0].interest;
                }
            }

            if (current_user_interest) {
                array = array.filter(record => {
                    if (record.interest) {
                        const contains = current_user_interest.some(element => {
                            return record.interest.includes(element);
                        });

                        if (contains) {
                            return (record)
                        }
                    }
                })
            }
            else {
            }

        }

        return array;
    }
    catch (err) {

    }

}

