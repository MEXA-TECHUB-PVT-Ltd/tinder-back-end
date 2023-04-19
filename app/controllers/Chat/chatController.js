const { pool } = require("../../config/db.config");


exports.getChatRoomsOfUser = async (req, res) => {

    try {
        let user_id = req.query.user_id;

        if (!user_id) { return (res.json({ message: 'provide user id ', status: false })) };



        const query = `SELECT 
        cr.chat_room_id, 
        CASE WHEN cr.user_1_id = $1 THEN cr.user_2_id ELSE cr.user_1_id END AS other_user_id,
        blockStatus,
        blocked_by_id,
        deletedForUser1,
        deletedForUser2,
        pinnedByUser1,
        pinnedByUser2,
        archiveByUser1,
        archiveByUser2,
        cr.created_at,
        cr.updated_at,
        (SELECT message FROM messages WHERE chat_room_id = cr.chat_room_id ORDER BY created_at DESC LIMIT 1) AS last_message_content,
        (SELECT created_at FROM messages WHERE chat_room_id = cr.chat_room_id ORDER BY created_at DESC LIMIT 1) AS last_message_created_at,
        (SELECT first_name FROM users WHERE user_id = CASE WHEN cr.user_1_id = $1 THEN cr.user_2_id ELSE cr.user_1_id END) AS other_user_first_name,
        (SELECT last_name FROM users WHERE user_id = CASE WHEN cr.user_1_id = $1 THEN cr.user_2_id ELSE cr.user_1_id END) AS other_user_last_name,
        (SELECT profile_picture FROM users WHERE user_id = CASE WHEN cr.user_1_id = $1 THEN cr.user_2_id ELSE cr.user_1_id END) AS other_user_profile_pic_url
      FROM chatRoom cr
      WHERE cr.user_1_id = $1 OR cr.user_2_id = $1
      ORDER BY (SELECT created_at FROM messages WHERE chat_room_id = cr.chat_room_id ORDER BY created_at DESC LIMIT 1) DESC;
      `
        const result = await pool.query(query , [user_id])


        if (result.rows) {
            res.json({
                message: "ALl chat rooms of this user is fetched",
                result: result.rows,
                status: true
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