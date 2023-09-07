const { pool } = require("../../config/db.config");

exports.getMessages = async (req, res) => {
    try {
        const user_id = req.query.user_id;
        const chat_room_id = req.query.chat_room_id;
        let limit = req.query.limit;
        const page = req.query.page;
        let chatRoomDetails;


        if (!user_id || !chat_room_id || !page || !limit) {
            return (
                res.json({
                    message: "UserId , page , limit, and chat room id must be provided , it seems one or both of them are missing",
                    status: false,
                })
            )
        }

        limit = parseInt(limit);
        let offset= (parseInt(page)-1)* limit



        const query  =  `SELECT *
        FROM messages
        WHERE
            (chat_room_id = $1 AND sender_id = $2 AND deletedForSender = false)
            OR
            (chat_room_id = $1 AND receiver_id = $2 AND deletedForReceiver = false)
            ORDER BY created_at DESC
            LIMIT $3 OFFSET $4;
        `
        const result = await pool.query(query ,[chat_room_id , user_id , limit , offset]);

        if(result.rows){
            const foundChatRoomQuery =`SELECT * FROM chatRoom WHERE chat_room_id = $1`;
            const foundResult = await pool.query(foundChatRoomQuery , [chat_room_id]);


            if(foundResult){
                if(foundResult.rows){
                    if(foundResult.rows[0]){
                        chatRoomDetails=foundResult.rows[0];
                        let messages = result.rows;
                        chatRoomDetails.messages = messages.reverse()
                    }

                }else{
                    return(
                        res.json({
                            message : "Chat room with this id not found",
                            status : false
                        })
                    )
                }
            }
        }
    
        if (chatRoomDetails) {
            res.json({
                message: "Messages for current user has fetched ",
                status: true,
                result: chatRoomDetails
            })
        }
        else {
            res.json({
                message: "Could not able to get messages for this user",
                status: false,
                result: null
            })
        }
    }
    catch (err) {
        res.json({
            message: "Error Occurred",
            status: false,
            error: err.stack
        })
    }
}

exports.deleteMessage = async (req, res) => {
    try {
        const message_id = req.body.message_id;
        const user_id = req.body.user_id;
        const deleteType = req.body.deleteType;


        if (!message_id || !user_id || !deleteType) {
            return (
                res.json({
                    message: "message_id , user_id , deleteType . must be provided  . it seems one of them or all of them is missing.",
                    status: false
                })
            )
        }

        const findMessageQuery = 'SELECT * FROM messages WHERE message_id = $1';
        const foundMessage = await pool.query(findMessageQuery , [message_id]);

        if (foundMessage.rowCount>0) {
            var sender_id = foundMessage.rows[0].sender_id;
            var receiver_id = foundMessage.rows[0].receiver_id;
        }

        //sender and reciever both can delete messages . 
        //user can delete message for itself and other if the sender of that message is user 
        // user can only delete message foritself if user is receiver of message . if user is receiver than delete for every one option will be not showing for that option.
        //from front side , for every one and for me option will be displayed according to current user and message sender id . 

        let result;
        if (user_id == sender_id) {
            if (deleteType == 'for_every_one') {
                const query = 'UPDATE messages SET deletedForSender = $1 , deletedForReceiver= $2 WHERE message_id= $3 RETURNING*'
                result = await pool.query(query , [true, true , message_id]);
                
            }
            else if (deleteType == 'for_me') {
                const query = 'UPDATE messages SET deletedForSender = $1  WHERE message_id= $2 RETURNING*'
                result = await pool.query(query , [true , message_id]);


            }
        }
        else if (user_id == receiver_id) {
            if (deleteType == 'for_every_one') {
                return (
                    res.json({
                        message: "The message You want to delete is not created by current user. This user is not supposed to delete message for every one ",
                        status: false
                    })
                )
            }
            else {
                const query = 'UPDATE messages SET deletedForReceiver= $1  WHERE message_id= $2 RETURNING*'
                result = await pool.query(query , [true , message_id]);
            }

        }


        if (result.rows.length >0) {
            res.json({
                message: "Message Deleted",
                status: true,
                result: result.rows[0]
            })
        }
        else {
            res.json({
                message: 'Could not delete message',
                status: false,
            })
        }

    }
    catch (err) {
        res.json({
            message: "Error Occurred",
            error: err.message,
            status: false
        })
    }
}