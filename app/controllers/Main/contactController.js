const { pool } = require("../../config/db.config");
const format = require('pg-format');


// IMPORT CONTACTS 
exports.importContacts = async (req, res) => {
    try {

        // DESTRUCTURING DATA FROM REQUEST BODY

        let user_id = req.body.user_id;
        const contacts = req.body.contacts;

        // CHECKING IF DATA IS RECIEVED

        if(!user_id){
            return(
                res.json({
                    message: "Please provide user_id",
                    status : false
                })
            )
        }

        // PERFORMING A LOOP TO CHECK EACH ELEMENT OF ARRAY OF CONTACTS
        for (let i = 0; i < contacts.length; i++) {
            let element = contacts[i];

            // SORTING THE USER ID IN EACH ELEMENT OF ARRAY AS USER ID

            if(element){
                element.user_id = user_id
            }
        }

        // PERFORMING A LOP CHECK TO SEE IF EACH ELEMENT OF ARRAY HAS EITHER CONTACT NAME OR CONTACT PHONE NUMBER
        
        for (let i = 0; i < contacts.length; i++) {
        let element = contacts[i];

        // CHECKING IF THE ELEMENET IS NOT EMPTY

        if(element){

            // CHECKING IF THE ELEMENET HAS EITHER CONTACT NAME OR CONTACT PHONE NUMBER

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
        
        // IF ALL CHECKS ARE PASSED THEN WE WILL SOROE USER_ID, CONTACT_NAME AND PHONE NUMBER IN VALUES TO MAKE AN ARRAY PO
        const values = contacts.map(contact => [contact.user_id, contact.contact_name, contact.phone_number]);
        console.log(values)

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
       
        console.log(phone_number)
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
        console.log(result)
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
        console.log(result)

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

