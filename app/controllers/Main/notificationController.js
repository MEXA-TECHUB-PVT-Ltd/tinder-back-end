const { read } = require("fs");
const {pool} = require("../../config/db.config");
const { restart } = require("nodemon");


exports.sendNotification = async (req, res) => {
    const client = await pool.connect();
    try {
        const sender = req.body.sender;
        const receiver = req.body.receiver;
        const text = req.body.text;
        const type = req.body.type;

      
        if(!sender || !receiver || !text || !type){
            return(
                res.json({
                    message: "sender , receiver ,type , and text must be provided",
                    status : false
                })
            )
        }
        if(type == 'liked' || type== 'superLiked' || type == 'match_found' || type == 'message_received' || type == 'user_subscribed' || type == 'user_added'){
        }else{
            return(
                res.json({
                    message : "type can be one of these : [liked, superLiked , match_found , message_received , user_subscribed , user_added]",
                    status : false
                })
            )
        }
        


        const query = 'INSERT INTO notifications (sender , receiver , text , type) VALUES ($1 ,$2 , $3 , $4) RETURNING *';
        const result = await pool.query(query , [sender?sender : null, receiver? receiver : null , text ? text : null ,type?type:null]);

        if (result.rows[0]) {
            res.status(201).json({
                message: "Notification send",
                status: true,
                result: result.rows[0]
            })
        }
        else {
            res.status(400).json({
                message: "Could not save",
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

exports.getUserNotifications = async (req, res) => {
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

        const query = `SELECT json_agg(
            json_build_object(
                'notification_id', n.notification_id,
                'sender', json_build_object(
                    'user_id', u.user_id,
                    'name', u.name,
                    'email', u.email,
                    'phone_number', u.phone_number,
                    'password', u.password,
                    'dob', u.dob,
                    'relation_type', u.relation_type,
                    'school', u.school,
                    'interest', u.interest,
                    'job_title', u.job_title,
                    'company', u.company,
                    'category_id', u.category_id,
                    'active_status', u.active_status,
                    'gender', u.gender,
                    'images', u.images,
                    'preference', u.preference,
                    'longitude', u.longitude,
                    'latitude', u.latitude,
                    'login_type', u.login_type,
                    'created_at', u.created_at,
                    'updated_at', u.updated_at,
                    'profile_boosted', u.profile_boosted
                ),
                'receiver' ,  json_build_object(
                    'user_id', us.user_id,
                    'name', us.name,
                    'email', us.email,
                    'phone_number', us.phone_number,
                    'password', us.password,
                    'dob', us.dob,
                    'relation_type', us.relation_type,
                    'school', us.school,
                    'interest', us.interest,
                    'job_title', us.job_title,
                    'company', us.company,
                    'category_id', us.category_id,
                    'active_status', us.active_status,
                    'gender', us.gender,
                    'images', us.images,
                    'preference', us.preference,
                    'longitude', us.longitude,
                    'latitude', us.latitude,
                    'login_type', us.login_type,
                    'created_at', us.created_at,
                    'updated_at', us.updated_at,
                    'profile_boosted', us.profile_boosted
                ), 
                'text', n.text,
                'type', n.type,
                'read', n.read,
                'trash', n.trash,
                'created_at', n.created_at,
                'updated_at', n.updated_at
            )
        ) 
        FROM notifications n
        LEFT OUTER JOIN users u ON n.sender = u.user_id
       LEFT OUTER JOIN users us ON n.receiver = us.user_id

        WHERE n.receiver = $1
        
 ;
 
                        `;
        const result = await pool.query(query , [user_id]);

        if (result.rows) {
            res.status(201).json({
                message: "Users notifications",
                status: true,
                result: result.rows[0].json_agg
            })
        }
        else {
            res.status(400).json({
                message: "Could not save",
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

exports.readNotification = async (req,res)=>{
    try{
        const notificaiton_id = req.query.notificaiton_id;

        if(!notificaiton_id){
            return (
                res.json({
                    message: "Please Provide notificaiton_id",
                    status : false
                })
            )
        }

        const query = 'UPDATE notifications SET read = $1 WHERE notification_id = $2 RETURNING*';
        const result = await pool.query(query , [true , notificaiton_id]);

        if(result.rows[0]){
            res.json({
                message: "Notification is marked as read",
                status : true,
                result : result.rows[0]
            })
        }  
        else{
            return(
                res.json({
                    message: "Notification could not be marked as read due to some reason",
                    status : false
                })
            )
        }
    }
    catch(err){
        return(
            res.json({
                message: "Error Occurred",
                status : false,
                error : err.message
            })
        )
    }
}