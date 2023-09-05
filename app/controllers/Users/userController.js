
const { pool } = require("../../config/db.config");

const Joi = require("joi");
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');


exports.registerWithPh = async (req, res, next) => {
    const client = await pool.connect();
    try {
        const phone_number = req.body.phone_number;
        const password = req.body.password;
        const device_id = req.body.device_id;
        if (!phone_number || !password || !device_id) {
            return (
                res.json({
                    message: "phone number, device_id and pasword must be provided",
                    status: false
                })
            )
        }


        const found_ph_query = 'SELECT * FROM users WHERE phone_number = $1'
        const ph_no_Exists = await pool.query(found_ph_query, [phone_number])



        if (ph_no_Exists.rowCount > 0) {
            return (
                res.status(400).json({
                    message: "user with this phone_number already exists",
                    status: false
                })
            )
        }


        const query = 'INSERT INTO users (phone_number , password , profile_boosted , login_type, device_id) VALUES ($1 , $2 , $3 , $4, $5) RETURNING*'
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(req.body.password, salt);

        const result = await pool.query(query, [phone_number, hashPassword, false, 'phone_number', device_id]);
        if (result.rowCount < 1) {
            return res.json({
                message: "Error while signing up",
                status: false,
            });
        }
        const token = jwt.sign({ id: result.rows[0].user_id }, process.env.TOKEN, { expiresIn: '30d' });
        res.json({
            message: "Signed up Successfully",
            status: true,
            result: result.rows[0],
            jwt_token: token
        })


    }
    catch (err) {
        
        res.json({
            message: "Error Occurred",
            status: false,
            error: err.message
        })
    } finally {
        client.release();
    }
}

exports.registerWithEmail = async (req, res, next) => {
    const client = await pool.connect();
    try {
        const email = req.body.email;
        const password = req.body.password;
        const login_type = req.body.login_type;
        const device_id = req.body.device_id;


        const { error } = registerSchema.validate(req.body);
        if (!device_id) {
            return res.json({
                message: "Device-id is required",
                status: false
            })
        }
        if (error) {
            return (
                res.status(400).json({
                    message: "Error occurred",
                    error: error.details[0].message,
                    status: false
                })
            )
        }

        if (login_type == 'email' || login_type == 'facebook' || login_type == 'google' || login_type == 'apple') { } else {
            return (
                res.json({
                    message: "login_type can be only , email , facebook , google , apple",
                    status: false
                })
            )
        }


        const found_email_query = 'SELECT * FROM users WHERE email = $1'
        const emailExists = await pool.query(found_email_query, [email])

        if (emailExists.rowCount > 0) {
            return (
                res.status(400).json({
                    message: "user with this email already exists",
                    status: false
                })
            )
        }


        const query = 'INSERT INTO users (email , password , profile_boosted , login_type, device_id) VALUES ($1 , $2 , $3 , $4, $5) RETURNING*'
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(req.body.password, salt);


        const result = await pool.query(query, [email, hashPassword, false, login_type, device_id]);
        if (result.rowCount < 1) {
            return res.json({
                message: "Error while signing up",
                status: false,
            });
        }
        const token = jwt.sign({ id: result.rows[0].user_id }, process.env.TOKEN, { expiresIn: '30d' });
        res.json({
            message: "Signed up Successfully",
            status: true,
            result: result.rows[0],
            jwt_token: token
        })

    }
    catch (err) {
        
        res.json({
            message: "Error Occurred",
            status: false,
            error: err.message
        })
    } finally {
        client.release();
    }

}

exports.login_with_email = async (req, res) => {
    try {
        const email = req.body.email;
        let password = req.body.password;
        const device_id = req.body.device_id;
        let updateDevice;
        if (!email || !password || !device_id) {
            return (
                res.status(400).json({
                    message: "email, device_id and password must be provided",
                    status: false
                })
            )
        }

        const query = 'SELECT * FROM users WHERE email = $1';
        const foundResult = await pool.query(query, [email]);

        if (foundResult.rowCount == 0) {
            return (
                res.status(400).json({
                    message: "Wrong email or password",
                    status: false
                })
            )
        }
        const vaildPass = await bcrypt.compare(password, foundResult.rows[0].password);
        if (!vaildPass) {
            return (
                res.status(401).json({
                    message: "Wrong email or password",
                    status: false
                })
            )
        }

        if (device_id !== foundResult.rows[0].device_id) {

            const changeDeviceQuery = 'UPDATE users SET device_id = $1 WHERE user_id = $2 RETURNING *'
            updateDevice = await pool.query(changeDeviceQuery, [device_id, foundResult.rows[0].user_id]);

            if (updateDevice.rowCount < 1) {
                return (
                    res.json({
                        message: "Device id was not updated sucessfully",
                        status: false
                    })
                )
            }
        }
        const token = jwt.sign({ id: foundResult.rows[0].user_id }, process.env.TOKEN, { expiresIn: '30d' });
        if (!updateDevice) {
            return res.json({
                message: "Logged in Successfully",
                status: true,
                result: foundResult.rows[0],
                jwt_token: token
            });
        }

        res.json({
            message: "Logged in Successfully",
            status: true,
            result: updateDevice.rows[0],
            jwt_token: token
        });

    }
    catch (err) {
        
        res.json({
            message: "Error Occurred",
            status: false,
            error: err.message
        })
    }
}

exports.login_with_ph = async (req, res) => {
    try {
        const phone_number = req.body.phone_number;
        let password = req.body.password;
        const device_id = req.body.device_id;
        let updateDevice;

        if (!phone_number || !password || !device_id) {
            return (
                res.status(400).json({
                    message: "phone_number, device_id and password must be provided",
                    status: false
                })
            )
        }

        const query = 'SELECT * FROM users WHERE phone_number = $1';
        const foundResult = await pool.query(query, [phone_number]);

        if (foundResult.rowCount == 0) {
            return (
                res.status(400).json({
                    message: "Wrong phone_number or password",
                    status: false
                })
            )
        }

        const vaildPass = await bcrypt.compare(password, foundResult.rows[0].password);

        if (!vaildPass) {
            return (
                res.status(401).json({
                    message: "Wrong phone_number or password",
                    status: false
                })
            )
        }
        if (device_id !== foundResult.rows[0].device_id) {
            const changeDeviceQuery = 'UPDATE users SET device_id = $1 WHERE user_id = $2 RETURNING *'
            updateDevice = await pool.query(changeDeviceQuery, [device_id, foundResult.rows[0].user_id]);
            if (!updateDevice.rows[0]) {
                return (
                    res.json({
                        message: "Device id was not updated sucessfully",
                        status: false
                    })
                )
            }
        }
        const token = jwt.sign({ id: foundResult.rows[0].user_id }, process.env.TOKEN, { expiresIn: '30d' });
        if (!updateDevice) {
            res.json({
                message: "Logged in Successfully",
                status: true,
                result: foundResult.rows[0],
                jwt_token: token
            });
        }
        res.json({
            message: "Logged in Successfully",
            status: true,
            result: updateDevice.rows[0],
            jwt_token: token
        });


    }
    catch (err) {
        
        res.json({
            message: "Error Occurred",
            status: false,
            error: err.message
        })
    }
}

exports.updateProfile = async (req, res) => {
    try {
        const user_id = req.body.user_id;

        if (!user_id) {
            return (res.json({ message: "Please provide user_id", status: false }))
        }

        const name = req.body.name;
        const email = req.body.email;
        const phone_number = req.body.phone_number;
        const password = req.body.password;
        const dob = req.body.dob;
        const relation_type = req.body.relation_type;
        const school = req.body.school;
        const interest = req.body.interest;
        const job_title = req.body.job_title;
        const company = req.body.company;
        const category_id = req.body.category_id;
        const active_status = req.body.active_status;
        const gender = req.body.gender;
        const images = req.body.images;
        const preference = req.body.preference;
        const insta_id = req.body.insta_id;
        const spotify_id = req.body.spotify_id;
        const city = req.body.city;
        const country = req.body.country;
        const bio = req.body.bio;
        const verified_by_email = req.body.verified_by_email;


        let longitude = req.body.longitude;
        let latitude = req.body.latitude;



        if (images) {
            if (images.length > 6 || images.length < 2) {
                return (
                    res.json({
                        message: "Images can not be greater than 6 or less than 2 ",
                        status: false,
                    })
                )
            }
        }



        //filtering and modifying
        longitude = parseFloat(longitude);
        latitude = parseFloat(latitude);

        if (gender) {
            if (gender == 'male' || gender == 'female' || gender == 'prefer_not_to_say') { } else {
                res.json({
                    message: "gender should only be male , femal , prefer_not_to_say",
                    status: false
                })
            }
        }


        let query = 'UPDATE users SET ';
        let index = 2;
        let values = [user_id];

        if (name) {
            query += `name = $${index} , `;
            values.push(name)
            index++
        }
        if (email) {
            query += `email = $${index} , `;
            values.push(email)
            index++
        }
        if (phone_number) {
            query += `phone_number = $${index} , `;
            values.push(phone_number)
            index++
        }


        if (password) {
            query += `password = $${index} , `;
            values.push(password)
            index++
        }
        if (dob) {
            query += `dob = $${index} , `;
            values.push(dob)
            index++
        }

        if (relation_type) {
            query += `relation_type = $${index} , `;
            values.push(relation_type)
            index++
        }

        if (school) {
            query += `school = $${index} , `;
            values.push(school)
            index++
        }


        if (interest) {
            query += `interest = $${index} , `;
            values.push(interest)
            index++
        }


        if (job_title) {
            query += `job_title = $${index} , `;
            values.push(job_title)
            index++
        }

        if (company) {
            query += `company = $${index} , `;
            values.push(company)
            index++
        }

        if (category_id) {
            query += `category_id = $${index} , `;
            values.push(category_id)
            index++
        }

        if (active_status) {
            query += `active_status = $${index} , `;
            values.push(active_status)
            index++
        }


        if (gender) {
            query += `gender = $${index} , `;
            values.push(gender)
            index++
        }

        if (images) {
            query += `images = $${index} , `;
            values.push(images)
            index++
        }
        if (preference) {
            query += `preference = $${index} , `;
            values.push(preference)
            index++
        }
        if (insta_id) {
            query += `insta_id = $${index} , `;
            values.push(insta_id)
            index++
        }
        if (spotify_id) {
            query += `spotify_id = $${index} , `;
            values.push(spotify_id)
            index++
        }

        if (longitude) {
            query += `longitude = $${index} , `;
            values.push(longitude)
            index++
        }

        if (latitude) {
            query += `latitude = $${index} , `;
            values.push(latitude)
            index++
        }

        if (city) {
            query += `city = $${index} , `;
            values.push(city)
            index++
        }

        if (country) {
            query += `country = $${index} , `;
            values.push(country)
            index++
        }

        if (bio) {
            query += `bio = $${index} , `;
            values.push(bio)
            index++
        }

        if (verified_by_email) {
            query += `verified_by_email = $${index} , `;
            values.push(verified_by_email)
            index++
        }


        query += 'WHERE user_id = $1 RETURNING*'
        query = query.replace(/,\s+WHERE/g, " WHERE");



        const result = await pool.query(query, values);

        if (result.rows[0]) {
            res.json({
                message: "Profile Updated successfully",
                status: true,
                result: result.rows[0]
            })
        }
        else {
            res.json({
                message: "Profile could not be updated successfully",
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

exports.updatePassword = async (req, res) => {
    try {
        const email = req.body.email;
        const phone_number = req.body.phone_number;
        const password = req.body.password;

        if (email && phone_number) {
            return (res.json({
                message: "only one can be provided email or phone_number",
                status: false
            }))
        }

        if (email) {
            const foundQuery = 'SELECT * FROM users WHERE email = $1 and login_type = $2';
            const foundResult = await pool.query(foundQuery, [email, 'email']);

            if (foundResult.rows[0]) {
                const query = 'UPDATE users SET password = $1 WHERE email = $2 RETURNING*';
                const salt = await bcrypt.genSalt(10);
                const hashPassword = await bcrypt.hash(password, salt);

                const result = await pool.query(query, [hashPassword, email]);

                if (result.rows[0]) {
                    res.json({ message: "Update successfully", status: true, result: result.rows[0] })
                }
                else {
                    res.json({ message: "Could not Update", status: false })
                }
            }
        }
        if (phone_number) {
            const foundQuery = 'SELECT * FROM users WHERE phone_number = $1 and login_type = $2';
            const foundResult = await pool.query(foundQuery, [email, 'phone_number']);


            if (foundResult.rows[0]) {
                const query = 'UPDATE users SET password = $1 WHERE phone_number = $2 RETURNING*';
                const salt = await bcrypt.genSalt(10);
                const hashPassword = await bcrypt.hash(password, salt);
                const result = await pool.query(query, [hashPassword, email]);

                if (result.rows[0]) {
                    res.json({ message: "Update successfully", status: true, result: result.rows[0] })
                }
                else {
                    res.json({ message: "Could not Update", status: false })
                }
            }
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

exports.viewProfile = async (req, res) => {
    try {
        const user_id = req.query.user_id;
        if (!user_id) {
            return (res.json({ message: "Please provide user_id", status: false }))
        }


        const query = `SELECT json_agg(
            json_build_object(
                'user_id', u.user_id,
                'name', u.name,
                'email', u.email,
                'phone_number', u.phone_number,
                'password', u.password,
                'incognito_status',u.incognito_status,
                'device_id',u.device_id,
                'dob', u.dob,
                'block_status' , u.block_status,
                'verified_by_email' , u.verified_by_email,
                'school',json_build_object(
                    'school_id', sch.school_id,
                    'name', sch.name,
                    'created_at', sch.created_at,
                    'updated_at', sch.updated_at
                ),
                'interest', (
                    SELECT json_agg(
                        json_build_object(
                            'interest_id', i.interest_id,
                            'interest_name', i.interest_name,
                            'created_at', i.created_at,
                            'updated_at', i.updated_at
                        )
                    )
                    FROM interests i
                    WHERE i.interest_id IN (SELECT unnest(u.interest))
                ),
                'job_title', u.job_title,
                'company', u.company,
                'category',json_build_object(
                    'category_id', cat.category_id,
                    'category_name', cat.category_name,
                    'created_at', cat.created_at,
                    'trash', cat.trash
                ),
                'active_status', u.active_status,
                'gender', u.gender,
                'images', u.images,
                'preference', json_build_object(
                    'preference_id', pref.preference_id,
                    'preference_type_id', pref.preference_type_id,
                    'preference', pref.preference,
                    'trash', pref.trash
                ),
                'longitude', u.longitude,
                'latitude', u.latitude,
                'city', u.city,
                'country', u.country,
                'bio', u.bio,
                'login_type', u.login_type,
                'created_at', u.created_at,
                'updated_at', u.updated_at,
                'profile_boosted', u.profile_boosted,
                'relation_type', json_build_object(
                    'relation_type_id', rt.relation_type_id,
                    'type', rt.type,
                    'created_at', rt.created_at,
                    'updated_at', rt.updated_at
                ),
                'match_count', (
                    SELECT COUNT(*)
                    FROM users mu
                    WHERE mu.user_id IN (
                        SELECT swiped_user_id
                        FROM swipes
                        WHERE user_id = u.user_id AND swipe_direction = 'right'
                            AND swiped_user_id IN (
                                SELECT user_id
                                FROM swipes
                                WHERE swiped_user_id = u.user_id AND swipe_direction = 'right'
                            )
                    )
                )
                )
        ) 
        FROM users u
        LEFT OUTER JOIN relation_type rt ON u.relation_type = rt.relation_type_id
        LEFT OUTER JOIN school sch ON u.school = sch.school_id
        LEFT OUTER JOIN preferences pref ON u.preference = pref.preference_id
        LEFT OUTER JOIN categories cat ON u.category_id::integer = cat.category_id
        WHERE u.user_id = $1`;
        const result = await pool.query(query, [user_id]);


        if (result.rowCount > 0) {
            res.json({
                message: "User profile fetched",
                status: true,
                result: result.rows[0]
            })
        }
        else {
            res.json({
                message: "Could not Fetch profile , may be the user_id is wrong",
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

exports.getAllUsers = async (req, res) => {
    const client = await pool.connect();
    try {
        let limit = req.query.limit;
        let page = req.query.page

        let result;

        if (!page || !limit) {
            const query = `
            SELECT json_agg(
                json_build_object(
                    'user_id', u.user_id,
                    'name', u.name,
                    'email', u.email,
                    'phone_number', u.phone_number,
                    'incognito_status',u.incognito_status,
                    'device_id',u.device_id,
                    'password', u.password,
                    'dob', u.dob,
                    'block_status' , u.block_status,
                    'verified_by_email' , u.verified_by_email,
                    'school', json_build_object(
                        'school_id', sch.school_id,
                        'name', sch.name,
                        'created_at', sch.created_at,
                        'updated_at', sch.updated_at
                    ),
                    'interest', (
                        SELECT json_agg(
                            json_build_object(
                                'interest_id', i.interest_id,
                                'interest_name', i.interest_name,
                                'created_at', i.created_at,
                                'updated_at', i.updated_at
                            )
                        )
                        FROM interests i
                        WHERE i.interest_id IN (SELECT unnest(u.interest))
                    ),
                    'job_title', u.job_title,
                    'company', u.company,
                    'category', json_build_object(
                        'category_id', cat.category_id,
                        'category_name', cat.category_name,
                        'created_at', cat.created_at,
                        'trash', cat.trash
                    ),
                    'active_status', u.active_status,
                    'gender', u.gender,
                    'images', u.images,
                    'preference', json_build_object(
                        'preference_id', pref.preference_id,
                        'preference_type_id', pref.preference_type_id,
                        'preference', pref.preference,
                        'trash', pref.trash
                    ),
                    'longitude', u.longitude,
                    'latitude', u.latitude,
                    'city', u.city,
                    'country', u.country,
                    'bio', u.bio,
                    'login_type', u.login_type,
                    'created_at', u.created_at,
                    'updated_at', u.updated_at,
                    'profile_boosted', u.profile_boosted,
                    'relation_type', json_build_object(
                        'relation_type_id', rt.relation_type_id,
                        'type', rt.type,
                        'created_at', rt.created_at,
                        'updated_at', rt.updated_at
                    ),
                    'match_count', (
                        SELECT COUNT(*)
                        FROM swipes
                        WHERE swiped_user_id = u.user_id AND swipe_direction = 'right'
                    )
                )
            )
            FROM users u
            LEFT OUTER JOIN relation_type rt ON u.relation_type = rt.relation_type_id
            LEFT OUTER JOIN school sch ON u.school = sch.school_id
            LEFT OUTER JOIN preferences pref ON u.preference = pref.preference_id
            LEFT OUTER JOIN categories cat ON u.category_id::integer = cat.category_id`
            result = await pool.query(query);
        }

        if (page && limit) {
            limit = parseInt(limit);
            let offset = (parseInt(page) - 1) * limit;

            const query = `
            SELECT json_agg(
                json_build_object(
                    'user_id', u.user_id,
                    'name', u.name,
                    'email', u.email,
                    'phone_number', u.phone_number,
                    'incognito_status',u.incognito_status,
                    'device_id',u.device_id,
                    'password', u.password,
                    'dob', u.dob,
                    'block_status' , u.block_status,
                    'verified_by_email' , u.verified_by_email,
                    'school', json_build_object(
                        'school_id', sch.school_id,
                        'name', sch.name,
                        'created_at', sch.created_at,
                        'updated_at', sch.updated_at
                    ),
                    'interest', (
                        SELECT json_agg(
                            json_build_object(
                                'interest_id', i.interest_id,
                                'interest_name', i.interest_name,
                                'created_at', i.created_at,
                                'updated_at', i.updated_at
                            )
                        )
                        FROM interests i
                        WHERE i.interest_id IN (SELECT unnest(u.interest))
                    ),
                    'job_title', u.job_title,
                    'company', u.company,
                    'category', json_build_object(
                        'category_id', cat.category_id,
                        'category_name', cat.category_name,
                        'created_at', cat.created_at,
                        'trash', cat.trash
                    ),
                    'active_status', u.active_status,
                    'gender', u.gender,
                    'images', u.images,
                    'preference', json_build_object(
                        'preference_id', pref.preference_id,
                        'preference_type_id', pref.preference_type_id,
                        'preference', pref.preference,
                        'trash', pref.trash
                    ),
                    'longitude', u.longitude,
                    'latitude', u.latitude,
                    'city', u.city,
                    'country', u.country,
                    'bio', u.bio,
                    'login_type', u.login_type,
                    'created_at', u.created_at,
                    'updated_at', u.updated_at,
                    'profile_boosted', u.profile_boosted,
                    'relation_type', json_build_object(
                        'relation_type_id', rt.relation_type_id,
                        'type', rt.type,
                        'created_at', rt.created_at,
                        'updated_at', rt.updated_at
                    ),
                    'match_count', (
                        SELECT COUNT(*)
                        FROM swipes
                        WHERE swiped_user_id = u.user_id AND swipe_direction = 'right'
                    )
                )
            )
            FROM users u
            LEFT OUTER JOIN relation_type rt ON u.relation_type = rt.relation_type_id
            LEFT OUTER JOIN school sch ON u.school = sch.school_id
            LEFT OUTER JOIN preferences pref ON u.preference = pref.preference_id
            LEFT OUTER JOIN categories cat ON u.category_id::integer = cat.category_id
            LIMIT $1 OFFSET $2`;
            result = await pool.query(query, [limit, offset]);
        }
        const query1 = `SELECT * FROM swipes WHERE swiped_user_id = $1 AND swipe_direction = 'right'`
        const result1 = await pool.query(query1, [101044]);
        if (result.rows) {
            res.json({
                message: "Fetched",
                status: true,
                users_counts: result.rows[0].json_agg.length,
                result: result.rows[0].json_agg
            })
        }
        else {
            res.json({
                message: "could not fetch",
                status: false
            })
        }
    }
    catch (err) {
        res.json({
            message: "Error",
            status: false,
            error: err.message
        })
    }
    finally {
        client.release();
    }

}
exports.getAllUsersFiltered = async (req, res) => {
    const client = await pool.connect();
    const { user_id } = req.query;
    try {
        let result;

        const query = `
            SELECT json_agg(
                json_build_object(
                    'user_id', u.user_id,
                    'name', u.name,
                    'email', u.email,
                    'phone_number', u.phone_number,
                    'incognito_status',u.incognito_status,
                    'device_id',u.device_id,
                    'password', u.password,
                    'dob', u.dob,
                    'block_status' , u.block_status,
                    'verified_by_email' , u.verified_by_email,
                    'school', json_build_object(
                        'school_id', sch.school_id,
                        'name', sch.name,
                        'created_at', sch.created_at,
                        'updated_at', sch.updated_at
                    ),
                    'interest', (
                        SELECT json_agg(
                            json_build_object(
                                'interest_id', i.interest_id,
                                'interest_name', i.interest_name,
                                'created_at', i.created_at,
                                'updated_at', i.updated_at
                            )
                        )
                        FROM interests i
                        WHERE i.interest_id IN (SELECT unnest(u.interest))
                    ),
                    'job_title', u.job_title,
                    'company', u.company,
                    'category', json_build_object(
                        'category_id', cat.category_id,
                        'category_name', cat.category_name,
                        'created_at', cat.created_at,
                        'trash', cat.trash
                    ),
                    'active_status', u.active_status,
                    'gender', u.gender,
                    'images', u.images,
                    'preference', json_build_object(
                        'preference_id', pref.preference_id,
                        'preference_type_id', pref.preference_type_id,
                        'preference', pref.preference,
                        'trash', pref.trash
                    ),
                    'longitude', u.longitude,
                    'latitude', u.latitude,
                    'city', u.city,
                    'country', u.country,
                    'bio', u.bio,
                    'login_type', u.login_type,
                    'created_at', u.created_at,
                    'updated_at', u.updated_at,
                    'profile_boosted', u.profile_boosted,
                    'relation_type', json_build_object(
                        'relation_type_id', rt.relation_type_id,
                        'type', rt.type,
                        'created_at', rt.created_at,
                        'updated_at', rt.updated_at
                    ),
                    'match_count', (
                        SELECT COUNT(*)
                        FROM swipes
                        WHERE swiped_user_id = u.user_id AND swipe_direction = 'right'
                    )
                )
            )
            FROM users u
            LEFT OUTER JOIN relation_type rt ON u.relation_type = rt.relation_type_id
            LEFT OUTER JOIN school sch ON u.school = sch.school_id
            LEFT OUTER JOIN preferences pref ON u.preference = pref.preference_id
            LEFT OUTER JOIN categories cat ON u.category_id::integer = cat.category_id`
        result = await pool.query(query);
        let finalResults = [];
        await Promise.all(
            result.rows[0].json_agg.map((item, index) => {
                if (item.user_id != user_id && item.incognito_status == false) {
                    finalResults.push(item)
                }
            })
        )

        if (result.rows) {
            res.json({
                message: "Fetched",
                status: true,
                result: finalResults
            })
        }
        else {
            res.json({
                message: "could not fetch",
                status: false
            })
        }
    }
    catch (err) {
        res.json({
            message: "Error",
            status: false,
            error: err.message
        })
    }
    finally {
        client.release();
    }

}
exports.usersByPreference = async (req, res) => {
    try {
        const preference_id = req.query.preference_id;
        if (!preference_id) {
            return (res.json({ message: "Please provide preference_id", status: false }))
        }
        let limit = req.query.limit;
        let page = req.query.page

        let result;

        if (!page || !limit) {
            const query = `SELECT json_agg(
                json_build_object(
                    'user_id', u.user_id,
                    'name', u.name,
                    'email', u.email,
                    'phone_number', u.phone_number,
                    'password', u.password,
                    'dob', u.dob,
                    'block_status' , u.block_status,
                    'school',json_build_object(
                        'school_id', sch.school_id,
                        'name', sch.name,
                        'created_at', sch.created_at,
                        'updated_at', sch.updated_at
                    ),
                    'interest', (
                        SELECT json_agg(
                            json_build_object(
                                'interest_id', i.interest_id,
                                'interest_name', i.interest_name,
                                'created_at', i.created_at,
                                'updated_at', i.updated_at
                            )
                        )
                        FROM interests i
                        WHERE i.interest_id IN (SELECT unnest(u.interest))
                    ),
                    'job_title', u.job_title,
                    'company', u.company,
                    'category',json_build_object(
                        'category_id', cat.category_id,
                        'category_name', cat.category_name,
                        'created_at', cat.created_at,
                        'trash', cat.trash
                    ),
                    'active_status', u.active_status,
                    'gender', u.gender,
                    'images', u.images,
                    'preference', json_build_object(
                        'preference_id', pref.preference_id,
                        'preference_type_id', pref.preference_type_id,
                        'preference', pref.preference,
                        'trash', pref.trash
                    ),
                    'longitude', u.longitude,
                    'latitude', u.latitude,
                    'city', u.city,
                    'country', u.country,
                    'bio', u.bio,
                    'login_type', u.login_type,
                    'created_at', u.created_at,
                    'updated_at', u.updated_at,
                    'profile_boosted', u.profile_boosted,
                    'relation_type', json_build_object(
                        'relation_type_id', rt.relation_type_id,
                        'type', rt.type,
                        'created_at', rt.created_at,
                        'updated_at', rt.updated_at
                    )
                    )
            ) 
            FROM users u
            LEFT OUTER JOIN relation_type rt ON u.relation_type = rt.relation_type_id
            LEFT OUTER JOIN school sch ON u.school = sch.school_id
            LEFT OUTER JOIN preferences pref ON u.preference = pref.preference_id
            LEFT OUTER JOIN categories cat ON u.category_id::integer = cat.category_id
             WHERE u.preference = $1`
            result = await pool.query(query, [preference_id]);
        }

        if (page && limit) {
            limit = parseInt(limit);
            let offset = (parseInt(page) - 1) * limit;

            const query = `SELECT json_agg(
                json_build_object(
                    'user_id', u.user_id,
                    'name', u.name,
                    'email', u.email,
                    'phone_number', u.phone_number,
                    'password', u.password,
                    'dob', u.dob,
                    'block_status' , u.block_status,
                    'school',json_build_object(
                        'school_id', sch.school_id,
                        'name', sch.name,
                        'created_at', sch.created_at,
                        'updated_at', sch.updated_at
                    ),
                    'interest', (
                        SELECT json_agg(
                            json_build_object(
                                'interest_id', i.interest_id,
                                'interest_name', i.interest_name,
                                'created_at', i.created_at,
                                'updated_at', i.updated_at
                            )
                        )
                        FROM interests i
                        WHERE i.interest_id IN (SELECT unnest(u.interest))
                    ),
                    'job_title', u.job_title,
                    'company', u.company,
                    'category',json_build_object(
                        'category_id', cat.category_id,
                        'category_name', cat.category_name,
                        'created_at', cat.created_at,
                        'trash', cat.trash
                    ),
                    'active_status', u.active_status,
                    'gender', u.gender,
                    'images', u.images,
                    'preference', json_build_object(
                        'preference_id', pref.preference_id,
                        'preference_type_id', pref.preference_type_id,
                        'preference', pref.preference,
                        'trash', pref.trash
                    ),
                    'longitude', u.longitude,
                    'latitude', u.latitude,
                    'city', u.city,
                    'country', u.country,
                    'bio', u.bio,
                    'login_type', u.login_type,
                    'created_at', u.created_at,
                    'updated_at', u.updated_at,
                    'profile_boosted', u.profile_boosted,
                    'relation_type', json_build_object(
                        'relation_type_id', rt.relation_type_id,
                        'type', rt.type,
                        'created_at', rt.created_at,
                        'updated_at', rt.updated_at
                    )
                    )
            ) 
            FROM users u
            LEFT OUTER JOIN relation_type rt ON u.relation_type = rt.relation_type_id
            LEFT OUTER JOIN school sch ON u.school = sch.school_id
            LEFT OUTER JOIN preferences pref ON u.preference = pref.preference_id
            LEFT OUTER JOIN categories cat ON u.category_id::integer = cat.category_id
             WHERE u.preference = $3 LIMIT $1 OFFSET $2`
            result = await pool.query(query, [limit, offset, preference_id]);
        }

        if (result.rows) {
            res.json({
                message: "Fetched",
                status: true,
                users_counts: result.rows[0].json_agg ? result.rows[0].json_agg.length : 0,
                result: result.rows[0].json_agg
            })
        }
        else {
            res.json({
                message: "could not fetch",
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

exports.usersByCategory = async (req, res) => {
    try {
        const category_id = req.query.category_id;
        if (!category_id) {
            return (res.json({ message: "Please provide category_id", status: false }))
        }

        let limit = req.query.limit;
        let page = req.query.page

        let result;

        if (!page || !limit) {
            const query = `SELECT json_agg(
                json_build_object(
                    'user_id', u.user_id,
                    'name', u.name,
                    'email', u.email,
                    'phone_number', u.phone_number,
                    'password', u.password,
                    'dob', u.dob,
                    'block_status' , u.block_status,
                    'school',json_build_object(
                        'school_id', sch.school_id,
                        'name', sch.name,
                        'created_at', sch.created_at,
                        'updated_at', sch.updated_at
                    ),
                    'interest', (
                        SELECT json_agg(
                            json_build_object(
                                'interest_id', i.interest_id,
                                'interest_name', i.interest_name,
                                'created_at', i.created_at,
                                'updated_at', i.updated_at
                            )
                        )
                        FROM interests i
                        WHERE i.interest_id IN (SELECT unnest(u.interest))
                    ),
                    'job_title', u.job_title,
                    'company', u.company,
                    'category',json_build_object(
                        'category_id', cat.category_id,
                        'category_name', cat.category_name,
                        'created_at', cat.created_at,
                        'trash', cat.trash
                    ),
                    'active_status', u.active_status,
                    'gender', u.gender,
                    'images', u.images,
                    'preference', json_build_object(
                        'preference_id', pref.preference_id,
                        'preference_type_id', pref.preference_type_id,
                        'preference', pref.preference,
                        'trash', pref.trash
                    ),
                    'longitude', u.longitude,
                    'latitude', u.latitude,
                    'city', u.city,
                    'country', u.country,
                    'bio', u.bio,
                    'login_type', u.login_type,
                    'created_at', u.created_at,
                    'updated_at', u.updated_at,
                    'profile_boosted', u.profile_boosted,
                    'relation_type', json_build_object(
                        'relation_type_id', rt.relation_type_id,
                        'type', rt.type,
                        'created_at', rt.created_at,
                        'updated_at', rt.updated_at
                    )
                    )
            ) 
            FROM users u
            LEFT OUTER JOIN relation_type rt ON u.relation_type = rt.relation_type_id
            LEFT OUTER JOIN school sch ON u.school = sch.school_id
            LEFT OUTER JOIN preferences pref ON u.preference = pref.preference_id
            LEFT OUTER JOIN categories cat ON u.category_id::integer = cat.category_id
             WHERE u.category_id = $1`
            result = await pool.query(query, [category_id]);
        }

        if (page && limit) {
            limit = parseInt(limit);
            let offset = (parseInt(page) - 1) * limit;

            const query = `SELECT json_agg(
                json_build_object(
                    'user_id', u.user_id,
                    'name', u.name,
                    'email', u.email,
                    'phone_number', u.phone_number,
                    'password', u.password,
                    'dob', u.dob,
                    'block_status' , u.block_status,
                    'school',json_build_object(
                        'school_id', sch.school_id,
                        'name', sch.name,
                        'created_at', sch.created_at,
                        'updated_at', sch.updated_at
                    ),
                    'interest', (
                        SELECT json_agg(
                            json_build_object(
                                'interest_id', i.interest_id,
                                'interest_name', i.interest_name,
                                'created_at', i.created_at,
                                'updated_at', i.updated_at
                            )
                        )
                        FROM interests i
                        WHERE i.interest_id IN (SELECT unnest(u.interest))
                    ),
                    'job_title', u.job_title,
                    'company', u.company,
                    'category',json_build_object(
                        'category_id', cat.category_id,
                        'category_name', cat.category_name,
                        'created_at', cat.created_at,
                        'trash', cat.trash
                    ),
                    'active_status', u.active_status,
                    'gender', u.gender,
                    'images', u.images,
                    'preference', json_build_object(
                        'preference_id', pref.preference_id,
                        'preference_type_id', pref.preference_type_id,
                        'preference', pref.preference,
                        'trash', pref.trash
                    ),
                    'longitude', u.longitude,
                    'latitude', u.latitude,
                    'city', u.city,
                    'country', u.country,
                    'bio', u.bio,
                    'login_type', u.login_type,
                    'created_at', u.created_at,
                    'updated_at', u.updated_at,
                    'profile_boosted', u.profile_boosted,
                    'relation_type', json_build_object(
                        'relation_type_id', rt.relation_type_id,
                        'type', rt.type,
                        'created_at', rt.created_at,
                        'updated_at', rt.updated_at
                    )
                    )
            ) 
            FROM users u
            LEFT OUTER JOIN relation_type rt ON u.relation_type = rt.relation_type_id
            LEFT OUTER JOIN school sch ON u.school = sch.school_id
            LEFT OUTER JOIN preferences pref ON u.preference = pref.preference_id
            LEFT OUTER JOIN categories cat ON u.category_id::integer = cat.category_id
             WHERE u.category_id = $3 LIMIT $1 OFFSET $2`
            result = await pool.query(query, [limit, offset, category_id]);
        }

        if (result.rows) {
            res.json({
                message: "Fetched",
                status: true,
                users_counts: result.rows[0].json_agg ? result.rows[0].json_agg.length : 0,
                result: result.rows[0].json_agg
            })
        }
        else {
            res.json({
                message: "could not fetch",
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

exports.usersByInterest = async (req, res) => {
    try {
        const interest = req.query.interest;
        if (!interest) {
            return (res.json({ message: "Please provide interest", status: false }))
        }

        let limit = req.query.limit;
        let page = req.query.page

        let result;

        if (!page || !limit) {
            const query = `SELECT json_agg(
                json_build_object(
                    'user_id', u.user_id,
                    'name', u.name,
                    'email', u.email,
                    'phone_number', u.phone_number,
                    'password', u.password,
                    'dob', u.dob,
                    'block_status' , u.block_status,
                    'school',json_build_object(
                        'school_id', sch.school_id,
                        'name', sch.name,
                        'created_at', sch.created_at,
                        'updated_at', sch.updated_at
                    ),
                    'interest', (
                        SELECT json_agg(
                            json_build_object(
                                'interest_id', i.interest_id,
                                'interest_name', i.interest_name,
                                'created_at', i.created_at,
                                'updated_at', i.updated_at
                            )
                        )
                        FROM interests i
                        WHERE i.interest_id IN (SELECT unnest(u.interest))
                    ),
                    'job_title', u.job_title,
                    'company', u.company,
                    'category',json_build_object(
                        'category_id', cat.category_id,
                        'category_name', cat.category_name,
                        'created_at', cat.created_at,
                        'trash', cat.trash
                    ),
                    'active_status', u.active_status,
                    'gender', u.gender,
                    'images', u.images,
                    'preference', json_build_object(
                        'preference_id', pref.preference_id,
                        'preference_type_id', pref.preference_type_id,
                        'preference', pref.preference,
                        'trash', pref.trash
                    ),
                    'longitude', u.longitude,
                    'latitude', u.latitude,
                    'city', u.city,
                    'country', u.country,
                    'bio', u.bio,
                    'login_type', u.login_type,
                    'created_at', u.created_at,
                    'updated_at', u.updated_at,
                    'profile_boosted', u.profile_boosted,
                    'relation_type', json_build_object(
                        'relation_type_id', rt.relation_type_id,
                        'type', rt.type,
                        'created_at', rt.created_at,
                        'updated_at', rt.updated_at
                    )
                    )
            ) 
            FROM users u
            LEFT OUTER JOIN relation_type rt ON u.relation_type = rt.relation_type_id
            LEFT OUTER JOIN school sch ON u.school = sch.school_id
            LEFT OUTER JOIN preferences pref ON u.preference = pref.preference_id
            LEFT OUTER JOIN categories cat ON u.category_id::integer = cat.category_id
             WHERE $1 IN (SELECT unnest(u.interest))`
            result = await pool.query(query, [interest]);
        }

        if (page && limit) {
            limit = parseInt(limit);
            let offset = (parseInt(page) - 1) * limit;

            const query = `SELECT json_agg(
                json_build_object(
                    'user_id', u.user_id,
                    'name', u.name,
                    'email', u.email,
                    'phone_number', u.phone_number,
                    'password', u.password,
                    'dob', u.dob,
                    'block_status' , u.block_status,
                    'school',json_build_object(
                        'school_id', sch.school_id,
                        'name', sch.name,
                        'created_at', sch.created_at,
                        'updated_at', sch.updated_at
                    ),
                    'interest', (
                        SELECT json_agg(
                            json_build_object(
                                'interest_id', i.interest_id,
                                'interest_name', i.interest_name,
                                'created_at', i.created_at,
                                'updated_at', i.updated_at
                            )
                        )
                        FROM interests i
                        WHERE i.interest_id IN (SELECT unnest(u.interest))
                    ),
                    'job_title', u.job_title,
                    'company', u.company,
                    'category',json_build_object(
                        'category_id', cat.category_id,
                        'category_name', cat.category_name,
                        'created_at', cat.created_at,
                        'trash', cat.trash
                    ),
                    'active_status', u.active_status,
                    'gender', u.gender,
                    'images', u.images,
                    'preference', json_build_object(
                        'preference_id', pref.preference_id,
                        'preference_type_id', pref.preference_type_id,
                        'preference', pref.preference,
                        'trash', pref.trash
                    ),
                    'longitude', u.longitude,
                    'latitude', u.latitude,
                    'city', u.city,
                    'country', u.country,
                    'bio', u.bio,
                    'login_type', u.login_type,
                    'created_at', u.created_at,
                    'updated_at', u.updated_at,
                    'profile_boosted', u.profile_boosted,
                    'relation_type', json_build_object(
                        'relation_type_id', rt.relation_type_id,
                        'type', rt.type,
                        'created_at', rt.created_at,
                        'updated_at', rt.updated_at
                    )
                    )
            ) 
            FROM users u
            LEFT OUTER JOIN relation_type rt ON u.relation_type = rt.relation_type_id
            LEFT OUTER JOIN school sch ON u.school = sch.school_id
            LEFT OUTER JOIN preferences pref ON u.preference = pref.preference_id
            LEFT OUTER JOIN categories cat ON u.category_id::integer = cat.category_id 
            WHERE $3 IN (SELECT unnest(u.interest)) LIMIT $1 OFFSET $2`
            result = await pool.query(query, [limit, offset, interest]);
        }

        if (result.rows) {
            res.json({
                message: "Fetched",
                status: true,
                users_counts: result.rows[0].json_agg ? result.rows[0].json_agg.length : 0,
                result: result.rows[0].json_agg
            })
        }
        else {
            res.json({
                message: "could not fetch",
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

exports.getAllSubscribedUsers = async (req, res) => {
    try {

        let limit = req.query.limit;
        let page = req.query.page

        let result;

        if (!page || !limit) {
            const query = 'SELECT * FROM users WHERE subscribed_status = $1'
            result = await pool.query(query, [true]);
        }

        if (page && limit) {
            limit = parseInt(limit);
            let offset = (parseInt(page) - 1) * limit;

            const query = 'SELECT * FROM users WHERE subscribed_status = $3 LIMIT $1 OFFSET $2'
            result = await pool.query(query, [limit, offset, true]);
        }

        if (result.rows) {
            res.json({
                message: "Fetched",
                status: true,
                users_counts: result.rows.length,
                result: result.rows
            })
        }
        else {
            res.json({
                message: "could not fetch",
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

exports.updateSubscribedStatus = async (req, res) => {
    try {
        const user_id = req.query.user_id;
        const subscribed_status = req.query.subscribed_status;
        if (!user_id || !subscribed_status) {
            return (
                res.json({
                    message: "user id , subscribed_status must be provided",
                    status: false
                })
            )
        }
        const query = 'UPDATE users SET subscribed_status = $1 WHERE user_id = $2 RETURNING*'
        const result = await pool.query(query, [subscribed_status, user_id])
        if (result.rows[0]) {
            res.json({
                message: "Updated",
                status: true,
                result: result.rows[0]
            })
        }
        else {
            res.json({
                message: "could not updated",
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

exports.updateActiveStatus = async (req, res) => {
    try {
        const user_id = req.query.user_id;
        const active_status = req.query.active_status;
        last_online_time = null;
        if (!user_id || !active_status) {
            return (
                res.json({
                    message: "user id , active_status must be provided",
                    status: false
                })
            )
        }


        if (active_status == "false") {
            const date = new Date(Date.now());
            const utcString = date.toISOString();
            last_online_time = utcString
        }



        let query = 'UPDATE users SET ';
        let index = 2;
        let values = [user_id];


        if (active_status) {
            query += `active_status = $${index} , `;
            values.push(active_status)
            index++
        }


        if (last_online_time) {
            query += `last_online_time = $${index} , `;
            values.push(last_online_time)
            index++
        }

        query += 'WHERE user_id = $1 RETURNING*'
        query = query.replace(/,\s+WHERE/g, " WHERE");



        const result = await pool.query(query, values);


        if (result.rows[0]) {
            res.json({
                message: "Acive status updated",
                status: true,
                result: result.rows[0]
            })
        }
        else {
            res.json({
                message: "could not update active status",
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

exports.updateBlockStatus = async (req, res) => {
    try {
        const user_id = req.query.user_id;
        const block_status = req.query.block_status;

        if (!user_id || !block_status) {
            return (
                res.json({
                    message: "user id , block_status must be provided",
                    status: false
                })
            )
        }


        let query = 'UPDATE users SET ';
        let index = 2;
        let values = [user_id];


        if (block_status) {
            query += `block_status = $${index} , `;
            values.push(block_status)
            index++
        }

        query += 'WHERE user_id = $1 RETURNING*'
        query = query.replace(/,\s+WHERE/g, " WHERE");



        const result = await pool.query(query, values);


        if (result.rows[0]) {
            res.json({
                message: "block_status updated",
                status: true,
                result: result.rows[0]
            })
        }
        else {
            res.json({
                message: "could not update block_status",
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

exports.deleteUser = async (req, res) => {
    const client = await pool.connect();
    try {
        const user_id = req.query.user_id;
        if (!user_id) {
            return (
                res.json({
                    message: "Please provide user_id ",
                    status: false
                })
            )
        }

        const query = 'DELETE FROM users WHERE user_id = $1 RETURNING *';
        const result = await pool.query(query, [user_id]);

        if (result.rowCount < 1) {
            res.status(404).json({
                message: "Could not delete . Record With this Id may not found or req.body may be empty",
                status: false,
            })
        }
        let deletedFrom = `user entry deleted from `
        const query1 = `DELETE FROM swipes WHERE user_id = $1 OR swiped_user_id=$1`
        const query2 = `DELETE FROM posts WHERE user_id = $1`
        const query3 = `DELETE FROM reported_users_records WHERE user_id = $1 OR reported_by = $1`
        const query4 = `DELETE FROM contacts WHERE user_id = $1`
        const query5 = `DELETE FROM schedules_tables WHERE user_id = $1`
        const result1 = await pool.query(query1, [user_id]);
        const result2 = await pool.query(query2, [user_id]);
        const result3 = await pool.query(query3, [user_id]);
        const result4 = await pool.query(query4, [user_id]);
        const result5 = await pool.query(query5, [user_id]);
        if (result1.rowCount > 0) {
            deletedFrom += `swipes, `
        }
        if (result2.rowCount > 0) {
            deletedFrom += `posts, `
        }
        if (result3.rowCount > 0) {
            deletedFrom += `reported_users_records, `
        }
        if (result4.rowCount > 0) {
            deletedFrom += `contacts, `
        }
        if (result5.rowCount > 0) {
            deletedFrom += `schedules_tables, `
        }
        res.status(200).json({
            message: "Deletion successfull",
            status: true,
            deletedRecord: result.rows[0],
            deletedFrom:deletedFrom
        })

    }
    catch (err) {
        res.json({
            message: "Error",
            status: false,
            error: err.message
        })
    }
    finally {
        client.release();
    }
}

const registerSchema = Joi.object({
    email: Joi.string().min(6).required().email(),
    password: Joi.string().min(6).required(),
    login_type: Joi.string().required(),
    device_id: Joi.required()
});

