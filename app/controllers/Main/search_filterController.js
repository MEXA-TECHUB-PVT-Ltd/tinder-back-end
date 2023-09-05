

const { pool } = require("../../config/db.config");


exports.searchByGender = async (req, res) => {
    const client = await pool.connect();
    try {

        let limit = req.query.limit;
        let page = req.query.page

        const gender = req.query.gender;
        const user_id = req.query.user_id;

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
                    'right_swiped_by_you', COALESCE(s.liked, false) 
                    )
            ) 
            FROM users u
            LEFT OUTER JOIN relation_type rt ON u.relation_type = rt.relation_type_id
            LEFT OUTER JOIN school sch ON u.school = sch.school_id
            LEFT OUTER JOIN preferences pref ON u.preference = pref.preference_id
            LEFT OUTER JOIN categories cat ON u.category_id::integer = cat.category_id
            LEFT OUTER JOIN swipes s ON u.user_id = s.swiped_user_id::integer AND s.user_id = $1 AND s.liked = true
            WHERE u.user_id <> $1 AND u.gender = $2 AND u.block_status = $3`
            
            ;
            result = await pool.query(query,
                [
                    user_id, gender , false

                ]);

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
                    'right_swiped_by_you', COALESCE(s.liked, false) 
                    )
            ) 
            FROM users u
            LEFT OUTER JOIN relation_type rt ON u.relation_type = rt.relation_type_id
            LEFT OUTER JOIN school sch ON u.school = sch.school_id
            LEFT OUTER JOIN preferences pref ON u.preference = pref.preference_id
            LEFT OUTER JOIN categories cat ON u.category_id::integer = cat.category_id
            LEFT OUTER JOIN swipes s ON u.user_id = s.swiped_user_id::integer AND s.user_id = $1 AND s.liked = true
            WHERE u.user_id <> $1 AND u.gender = $2
            AND u.block_status = $5
            LIMIT $3 OFFSET $4;
            `;
            result = await pool.query(query,
                [
                    user_id, gender, limit, offset , false

                ]);

        }







        if (result.rows) {
            res.status(201).json({
                message: "Fetched",
                status: true,
                result: result.rows[0].json_agg
            })
        }
        else {
            res.status(400).json({
                message: "Could not fetch",
                status: false
            })
        }
    }
    catch (err) {
        
        res.json({
            message: "Error",
            status: false,
            error: err.messagefalse
        })
    }
    finally {
        client.release();
    }

}

exports.searchByAge = async (req, res) => {
    const client = await pool.connect();
    try {

        let limit = req.query.limit;
        let page = req.query.page

        const start_age = req.query.start_age;
        const end_age = req.query.end_age;


        if (start_age || end_age) {
        }
        else {
            return (
                res.json({
                    message: "start_age and end_age must be provided",
                    status: false
                })
            )
        }

        const user_id = req.query.user_id;

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
                    'right_swiped_by_you', COALESCE(s.liked, false) ,
                    'age_years', EXTRACT(YEAR FROM age(current_date , to_date(u.dob, 'YYYY-MM-DD')))

                    )
            ) 
            FROM users u
            LEFT OUTER JOIN relation_type rt ON u.relation_type = rt.relation_type_id
            LEFT OUTER JOIN school sch ON u.school = sch.school_id
            LEFT OUTER JOIN preferences pref ON u.preference = pref.preference_id
            LEFT OUTER JOIN categories cat ON u.category_id::integer = cat.category_id
            LEFT OUTER JOIN swipes s ON u.user_id = s.swiped_user_id::integer AND s.user_id = $1 AND s.liked = true
            WHERE u.user_id <> $1
            AND u.block_status = $2`;
            result = await pool.query(query,
                [
                    user_id , false

                ]);

        }

        if (page && limit) {
            limit = parseInt(limit);
            let offset = (parseInt(page) - 1) * limit;

            const query = `SELECT 
            json_agg(
                json_build_object(
                    'user_id', u.user_id,
                    'name', u.name,
                    'email', u.email,
                    'phone_number', u.phone_number,
                    'password', u.password,
                    'dob', u.dob,
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
                    'right_swiped_by_you', COALESCE(s.liked, false) ,
                    'age_years', EXTRACT(YEAR FROM age(current_date , to_date(u.dob, 'YYYY-MM-DD')))


                    )
            ) 
            FROM users u
            LEFT OUTER JOIN relation_type rt ON u.relation_type = rt.relation_type_id
            LEFT OUTER JOIN school sch ON u.school = sch.school_id
            LEFT OUTER JOIN preferences pref ON u.preference = pref.preference_id
            LEFT OUTER JOIN categories cat ON u.category_id::integer = cat.category_id
            LEFT OUTER JOIN swipes s ON u.user_id = s.swiped_user_id::integer AND s.user_id = $1 AND s.liked = true
            WHERE u.user_id <> $1 AND u.block_status = $4
            LIMIT $2 OFFSET $3;
            `;
            result = await pool.query(query,
                [
                    user_id, limit, offset , false

                ]);

        }

        let array;
        if (result.rows) {
            array = result.rows[0].json_agg;
        }

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

        if (array) {
            res.status(201).json({
                message: "Fetched",
                status: true,
                result: array
            })
        }
        else {
            res.status(400).json({
                message: "Could not fetch",
                status: false
            })
        }
    }
    catch (err) {
        
        res.json({
            message: "Error",
            status: false,
            error: err.messagefalse
        })
    }
    finally {
        client.release();
    }

}

exports.searchByName = async (req, res) => {
    const client = await pool.connect();
    try {

        let limit = req.query.limit;
        let page = req.query.page

        const name = req.query.name;
        const user_id = req.query.user_id;

        if (!name) {
            return (
                res.json({
                    message: "Please provide name",
                    status: false
                })
            )
        }

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
                    'right_swiped_by_you', COALESCE(s.liked, false) 
                    )
            ) 
            FROM users u
            LEFT OUTER JOIN relation_type rt ON u.relation_type = rt.relation_type_id
            LEFT OUTER JOIN school sch ON u.school = sch.school_id
            LEFT OUTER JOIN preferences pref ON u.preference = pref.preference_id
            LEFT OUTER JOIN categories cat ON u.category_id::integer = cat.category_id
            LEFT OUTER JOIN swipes s ON u.user_id = s.swiped_user_id::integer AND s.user_id = $1 AND s.liked = true
            WHERE u.user_id <> $1 AND u.name ILIKE $2 AND u.block_status = $3`;
            result = await pool.query(query,
                [
                    user_id, name.concat('%') , false

                ]);

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
                    'right_swiped_by_you', COALESCE(s.liked, false) 
                    )
            ) 
            FROM users u
            LEFT OUTER JOIN relation_type rt ON u.relation_type = rt.relation_type_id
            LEFT OUTER JOIN school sch ON u.school = sch.school_id
            LEFT OUTER JOIN preferences pref ON u.preference = pref.preference_id
            LEFT OUTER JOIN categories cat ON u.category_id::integer = cat.category_id
            LEFT OUTER JOIN swipes s ON u.user_id = s.swiped_user_id::integer AND s.user_id = $1 AND s.liked = true
            WHERE u.user_id <> $1 AND u.name ILIKE $2 AND u.block_status = $5
            LIMIT $3 OFFSET $4;
            `;
            result = await pool.query(query,
                [
                    user_id, name.concat("%"), limit, offset , false

                ]);

        }



        if (result.rows) {
            res.status(201).json({
                message: "Fetched",
                status: true,
                result: result.rows[0].json_agg
            })
        }
        else {
            res.status(400).json({
                message: "Could not fetch",
                status: false
            })
        }
    }
    catch (err) {
        
        res.json({
            message: "Error",
            status: false,
            error: err.messagefalse
        })
    }
    finally {
        client.release();
    }

}

exports.searchByCommonInterest = async (req, res) => {
    const client = await pool.connect();
    try {

        let limit = req.query.limit;
        let page = req.query.page

        const user_id = req.query.user_id;

        if (!user_id) {
            return (
                res.json({
                    message: "Please provide user_id",
                    status: false
                })
            )
        }

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
                    'right_swiped_by_you', COALESCE(s.liked, false) 
                    )
            ) 
            FROM users u
            LEFT OUTER JOIN relation_type rt ON u.relation_type = rt.relation_type_id
            LEFT OUTER JOIN school sch ON u.school = sch.school_id
            LEFT OUTER JOIN preferences pref ON u.preference = pref.preference_id
            LEFT OUTER JOIN categories cat ON u.category_id::integer = cat.category_id
            LEFT OUTER JOIN swipes s ON u.user_id = s.swiped_user_id::integer AND s.user_id = $1 AND s.liked = true
            WHERE u.user_id <> $1 AND u.block_status = $2`
            result = await pool.query(query,
                [
                    user_id , false

                ]);

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
                    'right_swiped_by_you', COALESCE(s.liked, false) 
                    )
            ) 
            FROM users u
            LEFT OUTER JOIN relation_type rt ON u.relation_type = rt.relation_type_id
            LEFT OUTER JOIN school sch ON u.school = sch.school_id
            LEFT OUTER JOIN preferences pref ON u.preference = pref.preference_id
            LEFT OUTER JOIN categories cat ON u.category_id::integer = cat.category_id
            LEFT OUTER JOIN swipes s ON u.user_id = s.swiped_user_id::integer AND s.user_id = $1 AND s.liked = true
            WHERE u.user_id <> $1 AND u.block_status = $4
            LIMIT $2 OFFSET $3;
            `;
            result = await pool.query(query,
                [
                    user_id, limit, offset , false

                ]);

        }



        let array;
        if (result.rows) {
            array = result.rows[0].json_agg;
            let interestQuery = 'SELECT * FROM users WHERE user_id = $1';
            let current_user_interest;
            let interestResult = await pool.query(interestQuery, [user_id]);

            if (interestResult) {
                if (interestResult.rows[0].interest) {
                    current_user_interest = interestResult.rows[0].interest;
                }
            }


            if (current_user_interest) {
                array = array.filter(record => {
                    if (record.interest) {
                        if (record.interest.length > 0) {
                            const hasCommonValues = record.interest.some(item => current_user_interest.includes(item.interest_id));
                            if (hasCommonValues) {
                                return (record)
                            }
                        }
                    }

                })
            }
            else {
            }
        }






        if (array) {
            res.status(201).json({
                message: "Fetched",
                status: true,
                result: array
            })
        }
        else {
            res.status(400).json({
                message: "Could not fetch",
                status: false
            })
        }
    }
    catch (err) {
        
        res.json({
            message: "Error",
            status: false,
            error: err.messagefalse
        })
    }
    finally {
        client.release();
    }

}

exports.searchByDistance= async (req, res) => {
    const client = await pool.connect();
    try {
        let limit = req.query.limit;
        let page = req.query.page

        let distance = req.query.distance;
        let longitude = req.query.longitude;
        let latitude = req.query.latitude;



        

        const user_id = req.query.user_id;

        if (!user_id || !distance || !longitude || !latitude) {
            return (
                res.json({
                    message: "Please provide user_id and distance , longitude , latitude",
                    status: false
                })
            )
        }

        distance = parseFloat(distance);
        longitude = parseFloat (longitude);
        latitude = parseFloat(latitude)

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
                    'right_swiped_by_you', COALESCE(s.liked, false) ,
                    EXTRACT(YEAR FROM age(current_date , to_date(dob, 'YYYY-MM-DD'))) AS age_years,
                    acos(sin(radians($1)) * sin(radians(latitude))
                         + cos(radians($1)) * cos(radians(latitude))
                        * cos(radians($2) - radians(longitude))) * 6371 AS distance
                    )
            ) 
            FROM users u
            LEFT OUTER JOIN relation_type rt ON u.relation_type = rt.relation_type_id
            LEFT OUTER JOIN school sch ON u.school = sch.school_id
            LEFT OUTER JOIN preferences pref ON u.preference = pref.preference_id
            LEFT OUTER JOIN categories cat ON u.category_id::integer = cat.category_id
            LEFT OUTER JOIN swipes s ON u.user_id = s.swiped_user_id::integer AND s.user_id = $1 AND s.liked = true
            WHERE u.user_id <> $1 AND u.block_status = $2`
            result = await pool.query(query,
                [
                    user_id,false

                ]);

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
                    'right_swiped_by_you', COALESCE(s.liked, false) ,
                    'distance' , acos(sin(radians($6)) * sin(radians(latitude))
                    + cos(radians($6)) * cos(radians(latitude))
                    * cos(radians($5) - radians(longitude))) * 6371
                    )
            ) 
            FROM users u
            LEFT OUTER JOIN relation_type rt ON u.relation_type = rt.relation_type_id
            LEFT OUTER JOIN school sch ON u.school = sch.school_id
            LEFT OUTER JOIN preferences pref ON u.preference = pref.preference_id
            LEFT OUTER JOIN categories cat ON u.category_id::integer = cat.category_id
            LEFT OUTER JOIN swipes s ON u.user_id = s.swiped_user_id::integer AND s.user_id = $1 AND s.liked = true
            WHERE u.user_id <> $1 AND u.block_status = $7
            AND acos(sin(radians($6)) * sin(radians(u.latitude))
            + cos(radians($6)) * cos(radians(u.latitude))
            * cos(radians($5) - radians(u.longitude))) * 6371 <= $4
            LIMIT $2 OFFSET $3;
            `;
            result = await pool.query(query,
                [
                    user_id, limit, offset , distance , longitude , latitude , false

                ]);

        }



        if (result.rows) {
            res.status(201).json({
                message: "Fetched",
                status: true,
                result: result.rows[0].json_agg
            })
        }
        else {
            res.status(400).json({
                message: "Could not fetch",
                status: false
            })
        }
    }
    catch (err) {
        
        res.json({
            message: "Error",
            status: false,
            error: err.messagefalse
        })
    }
    finally {
        client.release();
    }

}
exports.recentlyActive = async (req, res) => {
    const client = await pool.connect();
    try {

        let limit = req.query.limit;
        let page = req.query.page

        const user_id = req.query.user_id;


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
                    'right_swiped_by_you', COALESCE(s.liked, false) 
                    )
            ) 
            FROM users u
            LEFT OUTER JOIN relation_type rt ON u.relation_type = rt.relation_type_id
            LEFT OUTER JOIN school sch ON u.school = sch.school_id
            LEFT OUTER JOIN preferences pref ON u.preference = pref.preference_id
            LEFT OUTER JOIN categories cat ON u.category_id::integer = cat.category_id
            LEFT OUTER JOIN swipes s ON u.user_id = s.swiped_user_id::integer AND s.user_id = $1 AND s.liked = true
            WHERE u.user_id <> $1 AND u.block_status = $2
            AND last_online_time >= NOW() - INTERVAL '30 minutes'
            `;
            result = await pool.query(query,
                [
                    user_id , false

                ]);

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
                    'right_swiped_by_you', COALESCE(s.liked, false) 
                    )
            ) 
            FROM users u
            LEFT OUTER JOIN relation_type rt ON u.relation_type = rt.relation_type_id
            LEFT OUTER JOIN school sch ON u.school = sch.school_id
            LEFT OUTER JOIN preferences pref ON u.preference = pref.preference_id
            LEFT OUTER JOIN categories cat ON u.category_id::integer = cat.category_id
            LEFT OUTER JOIN swipes s ON u.user_id = s.swiped_user_id::integer AND s.user_id = $1 AND s.liked = true
            WHERE u.user_id <> $1 AND u.block_status = $4
            AND last_online_time >= NOW() - INTERVAL '30 minutes'
            LIMIT $2 OFFSET $3;
            `;
            result = await pool.query(query,
                [
                    user_id, limit, offset , false

                ]);

        }

        if (result.rows) {
            res.status(201).json({
                message: "All Users who were online in last 30 minutes",
                status: true,
                result: result.rows[0].json_agg
            })
        }
        else {
            res.status(400).json({
                message: "Could not fetch any user online within in last 30 minutes",
                status: false
            })
        }
    }
    catch (err) {
        
        res.json({
            message: "Error",
            status: false,
            error: err.messagefalse
        })
    }
    finally {
        client.release();
    }

}