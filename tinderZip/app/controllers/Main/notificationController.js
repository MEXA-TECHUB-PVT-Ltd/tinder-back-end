const { read } = require("fs");
const { pool } = require("../../config/db.config");
const { restart } = require("nodemon");

// SENDING NOTICATION
exports.sendNotification = async (req, res) => {

    // CONNECTING TO DATABSE

    const client = await pool.connect();
    try {

        //DESTRUCTURING DATA FROM BODY

        const sender = req.body.sender;
        const receiver = req.body.receiver;
        const text = req.body.text;
        const type = req.body.type;

        // CHECKING IF THE DATA IS AVAILABLE

        if (!sender || !receiver || !text || !type) {
            return (
                res.json({
                    message: "sender , receiver ,type , and text must be provided",
                    status: false
                })
            )
        }

        // CHECKING IF THE TYPE PROVIDED IS VALID ACCORDING TO OUR CRITERIA

        if (type == 'liked' || type == 'superLiked' || type == 'match_found' || type == 'message_received' || type == 'user_subscribed' || type == 'user_added') {
        } else {
            return (
                res.json({
                    message: "type can be one of these : [liked, superLiked , match_found , message_received , user_subscribed , user_added]",
                    status: false
                })
            )
        }

        // SETTING UP QUERY TO INSERT THE DATA IN NOTIFICATION DATABASE 

        const query = 'INSERT INTO notifications (sender , receiver , text , type) VALUES ($1 ,$2 , $3 , $4) RETURNING *';

        // SENDING DATA INTO THE DATABASE BY USING QUERY ABOVE

        const result = await pool.query(query, [sender ? sender : null, receiver ? receiver : null, text ? text : null, type ? type : null]);

        // CHECKING THE DATA IS SAVED SUCESSFULLY THEN SENDING THE RESULTS AND TRUE STATUS

        if (result.rows[0]) {
            res.status(201).json({
                message: "Notification send",
                status: true,
                result: result.rows[0]
            })
        }

        // IF THE DATA IS NOT SAVED SENDING FALSE RESPONSE WITH MESSAGE

        else {
            res.status(400).json({
                message: "Could not save",
                status: false
            })
        }
    }
    catch (err) {

        // EXCEPTION HANDLING

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

// GETTING NOTIFICATION OF A SPECIFIC USER

exports.getUserNotifications = async (req, res) => {

    // CONNECTING TO DATABASE

    const client = await pool.connect();
    try {

        // DESTRUCTURING DTA FROM THE REQUEST BODY

        const user_id = req.query.user_id;

        // CHECKING IF THE DATA IS AVAILABLE

        if (!user_id) {
            return (
                res.json({
                    message: "user_id must be provided",
                    status: false
                })
            )
        }

        // SETTING UP FETCH DATA FROM THE DATABASE OF THE SPECIFIC USER

        const query = `SELECT json_agg(
            json_build_object(
                'notification_id', n.notification_id,
                'sender', json_build_object(
                    'user_id', u.user_id,
                    'device_id', u.device_id,
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
                    'device_id', us.device_id,
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
        
 ; `;

        // FETECHING DATA FROM THE DATABASE USING THE QUERY ABOVE
        
        const result = await pool.query(query, [user_id]);
        console.log(result.rows);
        // CHECKING IF THE DATA IS FETCHED SUCESSFULLT FROM THE DATABASE THEN SENDING THE RESULTS TO THE RESPONSE

        if (result.rows) {
            res.status(201).json({
                message: "Users notifications",
                status: true,
                result: result.rows[0].json_agg
            })
        }

        // IF THE DATA IS NOT FETCHED THE SENING FALSE STATUS TO RESPONSE
        
        else {
            res.status(400).json({
                message: "Could not save",
                status: false
            })
        }
    }
    catch (err) {
        
        // EXCEPTION HANDLING 

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

// SETTING UP NOTIFICATION MARKED AS READ

exports.readNotification = async (req, res) => {
    try {

        // DESTRUCTURING NOTIFICATION ID FROM REQUEST QUERY

        const notificaiton_id = req.query.notificaiton_id;

        // CHECKING IF THE NOTIFICATION ID IS AVAILABLE

        if (!notificaiton_id) {
            return (
                res.json({
                    message: "Please Provide notificaiton_id",
                    status: false
                })
            )
        }

        // SETTING UP THE QUERY TO SET THE NOTIFICATION AS READ

        const query = 'UPDATE notifications SET read = $1 WHERE notification_id = $2 RETURNING*';

        // CHANGING THE NOFITICATION READ STATUS TO TRUE IN DATABASE USING ABOVE QUERY

        const result = await pool.query(query, [true, notificaiton_id]);

        // CHECKING IF THE CHANGES HAS BEEN MADE THEN SENDING RESPONSE AS STATUS TRUE
        console.log(result.rows[0])
        if (!result.rows[0]) {
            return res.json({
                message: "Notification was not marked as read",
                status: false,

            })
        }
        // CHECKING IF THE CHANGES ARE NOT MADE THEN SENDING RESPONSE AS FALSE

        const getSendersDataQuery = 'SELECT * FROM users WHERE user_id = $1'
        const getSenderData = await pool.query(getSendersDataQuery, [result.rows[0].sender]);
        if(!getSenderData.rows[0]){
            return res.json({
                message: "Sender Data was not fetched",
                status: false,

            })
        }
        const getRecieversDataQuery = 'SELECT * FROM users WHERE user_id = $1'
        const getRecieverData = await pool.query(getRecieversDataQuery, [result.rows[0].receiver]);
        if(!getRecieverData.rows[0]){
            return res.json({
                message: "Reciever Data was not fetched",
                status: false,

            })
        }
        result.rows[0].sender = getSenderData.rows[0];
        result.rows[0].receiver = getRecieverData.rows[0];
        res.json({
            status:true,
            message:'Notification marked as read',
            results: result.rows[0]
        })
    }
    catch (err) {
        return (
            res.json({
                message: "Error Occurred",
                status: false,
                error: err.message
            })
        )
    }
}