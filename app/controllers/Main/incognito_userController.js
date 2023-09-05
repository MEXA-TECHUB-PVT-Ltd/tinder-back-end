const { pool } = require("../../config/db.config")
exports.changeIncognitoStatus = async (req, res) => {
    const db = await pool.connect();
    try {
        const { user_id, status } = req.body;
        if (!user_id) {
            return res.send({
                status: false,
                message: "Please Provide user_id and status"
            });
        }
        if (status === true || status === false) {

        }
        else {
            return res.send({
                status: false,
                message: "Status can either be true or false"
            })
        }
        const query = "UPDATE users SET incognito_status = $2 WHERE user_id = $1 RETURNING *"
        const blockUser = await db.query(query, [user_id, status]);
        if (!blockUser.rows[0]) {
            return res.send({
                status: false,
                message: "User with this id does not exsists"
            })
        }
        if (status) {
            res.send({
                status: true,
                message: "status changed to true in db",
                results: blockUser.rows[0]
            })
        }
        else {
            res.send({
                status: true,
                message: "status changed to false in db",
                results: blockUser.rows[0]
            })
        }
    } catch (err) {
        return res.send({
            status: false,
            message: err.message
        })
    }
}
exports.getIncognitoUsers = async (req, res) => {
    const db = await pool.connect();
    try {
        const { limit } = req.query;
        let query;
        let allIncognitoUsers;
        if(limit){
            query = "SELECT * FROM users WHERE incognito_status = $1 LIMIT $2"
            allIncognitoUsers = await db.query(query,[true, limit]);
        }
        else{
            query = "SELECT * FROM users WHERE incognito_status = $1"
            allIncognitoUsers = await db.query(query,[true]);
        }
        if(!allIncognitoUsers.rows[0]){
            return res.json({
                status:false,
                message:"No incognito users were found"
            })
        }
        res.send({
            status:true,
            message:"Data was fetched sucessfully",
            results: allIncognitoUsers.rows
        })
    } catch (err) {
        return res.send({
            status: false,
            message: err.message
        })
    }
}
exports.getNonIncognitoUsers = async (req, res) => {
    const db = await pool.connect();
    try {
        const { limit } = req.query;
        let query;
        let allIncognitoUsers;
        if(limit){
            query = "SELECT * FROM users WHERE incognito_status = $1 LIMIT $2"
            allIncognitoUsers = await db.query(query,[true, limit]);
        }
        else{
            query = "SELECT * FROM users WHERE incognito_status = $1"
            allIncognitoUsers = await db.query(query,[false]);
        }

        if(!allIncognitoUsers.rows[0]){
            return res.json({
                status:false,
                message:"No Non incognito users were found"
            })
        }
        res.send({
            status:true,
            message:"Data was fetched sucessfully",
            results: allIncognitoUsers.rows
        })
    } catch (err) {
        return res.send({
            status: false,
            message: err.message
        })
    }
}
