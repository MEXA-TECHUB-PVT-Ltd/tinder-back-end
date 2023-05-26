

const {pool} = require("../../config/db.config");


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
            WHERE u.user_id <> $1 AND u.gender = $2`;
             result = await pool.query(query , 
                [
                  user_id , gender
                  
                ]);
    
        }

        if(page && limit){
            limit = parseInt(limit);
            let offset= (parseInt(page)-1)* limit;

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
            LIMIT $3 OFFSET $4;
            `;
             result = await pool.query(query , 
                [
                  user_id , gender , limit , offset
                  
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
        console.log(err)
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
