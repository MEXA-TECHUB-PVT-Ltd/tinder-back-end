const { pool } = require("../../config/db.config");
const format = require('pg-format');



exports.importContacts = async (req, res) => {
    try {
        let user_id = req.body.user_id;
        const contacts = req.body.contacts;


        if(!user_id){
            return(
                res.json({
                    message: "Please provide user_id",
                    status : false
                })
            )
        }

        for (let i = 0; i < contacts.length; i++) {
            let element = contacts[i];

            if(element){
                element.user_id = user_id
            }
        }

            for (let i = 0; i < contacts.length; i++) {
            let element = contacts[i];
            if(element){
                if(!element.contact_name || !element.phone_number){
                    return(
                        res.json({
                            message: "The Input of contact array must be in valid format , Each record must have contact_name and phone_number",
                            status : false
                        })
                    )
                }
            }
        }
    
        const values = contacts.map(contact => [contact.user_id, contact.contact_name, contact.phone_number]);

        const query = format(`INSERT INTO contacts
         (user_id , contact_name , phone_number)
        VALUES %L 
        RETURNING*`
         , values)
        const reuslt = await pool.query(query)

        if(reuslt.rows){
            res.json({
                message : "Contacts imported",
                status : false,
                result : reuslt.rows
            })
        }
        else{
            res.json({
                message: "Could not import contacts due to some reason",
                status : false
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

exports.getImportedContactsByUser = async (req, res) => {
    try {
        let user_id = req.query.user_id;
       
        if(!user_id){
            return(
                res.json({
                    message: "Please provide user_ id",
                    status : false
                })
            )
        }

        const query = "SELECT * FROM contacts WHERE user_id = $1"
        const result   = await pool.query(query , [user_id]);

        if(result.rows){
            res.json({
                message : "All imported contacts of the user",
                status : false,
                result : result.rows
            })
        }
        else{
            res.json({
                message: "Could not Get any imported contacts of user",
                status : false
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

exports.blockContact = async (req, res) => {
    try {
        let phone_number = req.body.phone_number;
        const user_id  = req.body.user_id;
       
        if(!phone_number || !user_id){
            return(
                res.json({
                    message: "Please provide phone_number and user_id",
                    status : false
                })
            )
        }

        const query = "UPDATE contacts SET block = $1 WHERE user_id = $2 AND phone_number = $3 RETURNING*";
        const result   = await pool.query(query , [true, user_id , phone_number]);
        if(result.rows[0]){
            res.json({
                message : "BLOCKED",
                status : true,
                result : result.rows[0]
            })
        }
        else{
            res.json({
                message: "Could not block contact",
                status : false
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

exports.unblockContact = async (req, res) => {
    try {
        let phone_number = req.body.phone_number;
        const user_id = req.body.user_id;
       
        if(!phone_number || !user_id){
            return(
                res.json({
                    message: "Please provide phone_number and user_id",
                    status : false
                })
            )
        }

        const query = "UPDATE contacts SET block = $1 WHERE user_id = $2 AND phone_number=$3 RETURNING *";
        const result   = await pool.query(query , [false, user_id , phone_number]);

        if(result.rows[0]){
            res.json({
                message : "UNBLOCKED",
                status : true,
                result : result.rows[0]
            })
        }
        else{
            res.json({
                message: "Could not unblock contact",
                status : false
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

