
const { pool } = require("../../config/db.config");


exports.viewCards = async (req, res) => {
    try {
        let user_id = req.query.user_id;
        const radius = parseInt(req.query.radius) || 10;
        const limit = parseInt(req.query.limit) || 10; // Default to 10 matches per page
        let page = parseInt(req.query.page) // Default to the first page
        let latitude = req.query.latitude
        let longitude = req.query.longitude
        if (!user_id || !radius || !limit || !page || !latitude|| !longitude) {
            return (
                res.json({
                    message: "user_id , radius , limit , latitude, longitude and page must be provided",
                    status: false
                })
            )
        }

        user_id = parseInt(user_id)
        latitude = parseFloat(latitude);
        longitude =parseFloat(longitude);

    
        if(page<1){
            return(res.json({message: "page must be greater than 0" , status : false}))
        }

        let offset = (page -1) * limit;
        
        const excludeProfileIds = await getSwipedProfileIds(user_id, 'right');
        if (excludeProfileIds) { excludeProfileIds.push(user_id) }
        const potentialMatches = await getPotentialMatches(latitude , longitude ,user_id, excludeProfileIds, limit, offset , radius);

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
    try {
        const user_id = req.body.user_id;  // user who is swiping
        const swiped_user_id = req.body.swiped_user_id; // who is being swiped
        const swipe_direction = req.body.swipe_direction; // ie left or right
        let result;
        let match_found;

        if (!user_id || !swipe_direction || !swiped_user_id) {
            return (res.json({ message: "user_id , swiped_user_id and swipe_direction must be provided", status: false }))
        }

        if (swipe_direction == 'left' || swipe_direction == 'right') { } else { return (res.json({ message: "swipe direction must be left or right", status: false })) }

        const checkAlreadySwipeQuery = 'SELECT * FROM swipes WHERE user_id = $1 AND swiped_user_id = $2';
        const checkResult = await pool.query(checkAlreadySwipeQuery, [user_id, swiped_user_id]);


        if (checkResult.rowCount > 0) {
            // already swiped by this user , no matter left or right
            let updateQuery = 'UPDATE swipes SET user_id = $1  , swipe_direction= $2 ,swiped_user_id = $3  RETURNING*';
            result = await pool.query(updateQuery, [user_id, swipe_direction, swiped_user_id]);
            if (result.rows[0]) {
                result = result.rows[0]
            }
        }
        else {
            let insertQuery = 'INSERT INTO swipes (user_id , swiped_user_id ,swipe_direction) VALUES ($1 ,$2 ,$3) RETURNING *';
            result = await pool.query(insertQuery, [user_id, swiped_user_id, swipe_direction]);
            if (result.rows[0]) {
                result = result.rows[0]
            }
        }


        const checkMatch = await checkForMatch(user_id, swiped_user_id, pool);
        if (checkMatch) {
            console.log("match found true");
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
                console.log("inside")
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


        console.log(user_id);
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


async function checkForMatch(userId, swipedUserId, pool) {
    try {
        const result = await pool.query(`
      SELECT *
      FROM swipes
      WHERE (user_id = $1 AND swiped_user_id = $2 AND swipe_direction = 'right')
        OR (user_id = $2 AND swiped_user_id = $1 AND swipe_direction = 'right')
    `, [userId, swipedUserId]);

        if (result.rowCount === 2) {
            console.log(userId)

            // Both users have swiped right on each other, so it's a match!
            // Send a message to both users here
            console.log(`Match found between user ${userId} and user ${swipedUserId}`);
            return true;
        } else {
            // Not a match yet
            console.log(`No match yet between user ${userId} and user ${swipedUserId}`);
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

        console.log(result)
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
        return result.rows.map(row => row.profile_id);
    }
    catch (err) {
        console.log(err)
    }

}

async function getPotentialMatches(latitude , longitude, userId, excludeProfileIds, limit, offset, maxDistance) {
    try {
        const query = `
    SELECT *, 
      acos(sin(radians($1)) * sin(radians(latitude)) 
        + cos(radians($1)) * cos(radians(latitude)) 
        * cos(radians($2) - radians(longitude))) * 6371 as distance
    FROM users
    WHERE user_id NOT IN ($3) 
      AND user_id <> $4 
      AND user_id NOT IN (SELECT user_id FROM users WHERE user_id = $4)
      AND acos(sin(radians($1)) * sin(radians(latitude)) 
        + cos(radians($1)) * cos(radians(latitude)) 
        * cos(radians($2) - radians(longitude))) * 6371 <= $5
    OFFSET $6 LIMIT $7`;
        const values = [latitude, longitude, excludeProfileIds, userId, maxDistance, offset, limit];
        const result = await pool.query(query, values);
        return result.rows;
    }
    catch (err) {
        console.log("inside")
        console.log(err)
    }

}

