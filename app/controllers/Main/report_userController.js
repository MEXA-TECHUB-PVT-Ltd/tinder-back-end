
const {pool} = require("../../config/db.config");


exports.reportUser = async (req, res) => {
    const client = await pool.connect();
    try {
        const user_id = req.body.user_id;
        const reported_by = req.body.reported_by;
        const report_reason = req.body.report_reason;

        if(!user_id || !reported_by){
            return(
                res.json({
                    message: "user_id and reported_by (id) must be provided",
                    status : false
                })
            )
        }

    
    
        const foundQuery = 'SELECT * FROM reported_users_records WHERE user_id = $1 AND reported_by = $2';
        const foundResult = await pool.query(foundQuery  , [user_id , reported_by])

        if(foundResult.rows[0]){
            return(
                res.json({
                    message : 'You already reported this user.',
                    status : false
                })
            )
        }


        const query = 'INSERT INTO reported_users_records (user_id , reported_by , report_reason) VALUES ($1 , $2 , $3) RETURNING*'
        const result = await pool.query(query , 
            [
                user_id ? user_id : null,
                reported_by ? reported_by : null,
                report_reason ? report_reason: null
              
            ]);

        if (result.rows[0]) {
            res.status(201).json({
                message: "user has been reported saved in database",
                status: true,
                result: result.rows[0]
            })
        }
        else {
            res.status(400).json({
                message: "Could not save record",
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

exports.getReportedUsers= async (req, res) => {
    const client = await pool.connect();
    try {
        const foundQuery = `SELECT u.user_id, u.email, u.password, u.name, u.images,
        json_agg(
            json_build_object(
                'reported_users_record_id', rus.reported_users_record_id,
                'user_id', rus.user_id,
                'reported_by_user', json_build_object(
                    'user_id', ru.user_id,
                    'email', ru.email,
                    'name', ru.name,
                    'images', ru.images
                ),
                'report_reason', rus.report_reason,
                'trash', rus.trash,
                'created_at', rus.created_at,
                'updated_at', rus.updated_at
            )
        ) AS reported_by
 FROM reported_users_records rus
 JOIN users u ON rus.user_id = u.user_id
 JOIN users ru ON rus.reported_by = ru.user_id
 GROUP BY u.user_id, u.email, u.password;
 
        `;
        const result = await pool.query(foundQuery);

        if (result.rows) {
            res.status(201).json({
                message: "Fetched All reported users.",
                status: true,
                result: result.rows
            })
        }
        else {
            res.status(400).json({
                message: "Could not Fetch",
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

exports.get_a_reported_user= async (req, res) => {
    const client = await pool.connect();
    try {

        const user_id = req.query.user_id;

        if(!user_id){
            return(
                res.json({
                    message : "user_id must be provided",
                    status : false
                })
            )
        }
        const foundQuery = `SELECT  u.user_id , u.email, u.password,u.name, u.images,
        json_agg(json_build_object(
            'reported_users_record_id' , rus.reported_users_record_id,
            'user_id' , rus.user_id,
            'reported_by_user', json_build_object(
                'user_id', ru.user_id,
                'email', ru.email,
                'name', ru.name,
                'images', ru.images
            ),
            'report_reason' , rus.report_reason,
            'trash' , rus.trash,
            'created_at', rus.created_at,
            'updated_at', rus.updated_at
        )) AS reported_users_records
        FROM reported_users_records rus
        JOIN users u ON rus.user_id = u.user_id
        JOIN users ru ON rus.reported_by = ru.user_id

        WHERE rus.user_id = $1
        GROUP BY u.user_id,u.email, u.password
         `;

        const result = await pool.query(foundQuery ,[user_id]);

        if (result.rows[0]) {
            res.status(201).json({
                message: "Fetched a user who is reported.",
                status: true,
                result: result.rows[0]
            })
        }
        else {
            res.status(400).json({
                message: "Could not fetch if this user is reported.",
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

