const { pool } = require("../../config/db.config");



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

        const query = 'INSERT INTO contacts (user_id , contact_name , phone_number) VALUES ($1 , $2 ,$3 ) RETURNING*'
        
        const reuslt = await pool.query(query , values)

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