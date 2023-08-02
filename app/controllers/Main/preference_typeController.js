

const {pool} = require("../../config/db.config");

// ADDING PREFRENCE TYPE

exports.addpreference_type = async (req, res) => {

    // CONNECTING TO THE DATABASE

    const client = await pool.connect();
    try {

        // DESTRUCTURING DATA FROM THE BODY

        const preference_type = req.body.preference_type;

        // SETTING UP QUERY TO INSERT THE PREFRENCE TYPE INTO THE DATABASE

        const query = 'INSERT INTO preference_types (preference_type) VALUES ($1) RETURNING*'

        // SETTING UP THE DATA IN DATABASE USING THE QUERY ABOVE

        const result = await pool.query(query , 
            [
                preference_type ? preference_type : null,
              
            ]);
        
        // CHECKING IF THE DATA IS SAVED IN DATABASE THEN SENDING TRUE RESPONSE WITH DATA

        if (result.rows[0]) {
            res.status(201).json({
                message: "preference_type saved in database",
                status: true,
                result: result.rows[0]
            })
        }

        // IF DATA IS NOT SAVED IN DATABASE THEN SENDING STATUS FLASE RESPONSE

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

// UPDATE PREFRENCE TYPE IN DATBASE 

exports.updatepreference_type = async (req, res) => {
    
    // CONNECTING TO DATABASE

    const client = await pool.connect();
    try {

        // DESTRUCTUREING DATA FROM THE REQUEST BODY

        const preference_type_id = req.body.preference_type_id;
        const preference_type = req.body.preference_type;

        // CHECKING IF THE DATA IS RECIEVED SUCESSFULLY

        if (!preference_type_id) {
            return (
                res.json({
                    message: "Please provide preference_type_id ",
                    status: false
                })
            )
        }

        // SETTING UP BAISC QUERY TO UPDATE THE DATA
    
        let query = 'UPDATE preference_types SET ';
        let index = 2;
        let values =[preference_type_id];

        // SETTING UP QUERY TO UPDATE THE DATA IF PREFRENCE_TYPE IS PRESENT

        if(preference_type){
            query+= `preference_type = $${index} , `;
            values.push(preference_type)
            index ++
        }
      
        // APPENDING QUERY TO MAKE IT READY TO CHANGE DATA IN DB

        query += 'WHERE preference_type_id = $1 RETURNING*'
        query = query.replace(/,\s+WHERE/g, " WHERE");
        console.log(query);

        // CHANGEING DATA IN DB USING THE ABOVE QUERY

       const result = await pool.query(query , values);

        // CHECKING IF THE DATA IS CHANGED SUCESSFULLY THEN SENDING THE STATUS TRUE RESPONSE

        if (result.rows[0]) {
            res.json({
                message: "Updated",
                status: true,
                result: result.rows[0]
            })
        }

        // CHECKING IF THE DATA IS NOT CHANGED SUCESSFULLY THEN SENDING THE STATUS FALSE RESPONSE

        else {
            res.json({
                message: "Could not update . Record With this Id may not found or req.body may be empty",
                status: false,
            })
        }

    }
    catch (err) {

        // EXCEPTION HANDLING

        res.json({
            message: "Error",
            status: false,
            error: err.message
        })
    }
    finally {
        client.release();
      }
}

// DELETE PREFRENCE TYPE FORM DB

exports.deletepreference_type = async (req, res) => {

    // CONNECTING TO DATABASE 

    const client = await pool.connect();
    try {

        // DESTRUCTURING DATA FROM REQUEST QUERY 

        const preference_type_id = req.query.preference_type_id;

        // CHECKING IF THE DATA IS RECIEVED FROM THE BODY IF NOT THEN SENDING STATUS FALSE RESPONSE

        if (!preference_type_id) {
            return (
                res.json({
                    message: "Please provide preference_type_id ",
                    status: false
                })
            )
        }
        
        // SETTING UP QUERY TO DELETE THE PREFRENCE TYPE FROM THE DATABASE

        const query = 'DELETE FROM preference_types WHERE preference_type_id = $1 RETURNING *';

        // DELETEING DATA FROMD DATABASE USING ABOVE QUERY

        const result = await pool.query(query , [preference_type_id]);

        // CHECKING IF THE DATA IS DELETED SUCESSFULLY THEN SENDING TRUE STATUS RESPONSE

        if(result.rowCount>0){
            res.status(200).json({
                message: "Deletion successfull",
                status: true,
                deletedRecord: result.rows[0]
            })
        }
        
        // CHECKING IF THE DATA IS NOT DELETED SUCESSFULLY THEN SENDING FALSE STATUS RESPONSE

        else{
            res.status(404).json({
                message: "Could not delete . Record With this Id may not found or req.body may be empty",
                status: false,
            })
        }

    }
    catch (err) {

        // EXCEPTION HANDLING

        res.json({
            message: "Error",
            status: false,
            error: err.message
        })
    }
    finally {
        client.release();
      }
}

// FETECHING ALL PREFRENCE TYPES

exports.getAllpreference_types = async (req, res) => {

    // CONNECTING TO DATABASE

    const client = await pool.connect();
    try {

        // DESTRUCTURING DATA FROM THE REQUEST QUERY

        let limit = req.query.limit;
        let page = req.query.page

        let result;

        // CHECKING IF WE ARE GETTING THE DATA

        if (!page || !limit) {
            const query = 'SELECT * FROM preference_types WHERE trash=$1'
            result = await pool.query(query , [false]);
           
        }

        // ONLY IF BOTH PAGE AND LIMITS ARE AVAILABLE THEN WE WILL QUERY PGSQL

        if(page && limit){
            
            // PARSING THE GIVEN DATA INTO INT

            limit = parseInt(limit);
            let offset= (parseInt(page)-1)* limit

            // SETTING UP QUERY TO FETCH DATA FROM THE DATABASE

            const query = 'SELECT * FROM preference_types WHERE trash=$3 LIMIT $1 OFFSET $2'

            // FETCHING DATA FROM DATABASE USING QUERY ABVOE

            result = await pool.query(query , [limit , offset , false]);

      
        }
       
        // CHECKING IF THE DATA HAS BEEN FETCHED THEN SENDING THE RESPONSE WITH TRUE STATUS AND RESUTS

        if (result.rows) {
            res.json({
                message: "Fetched",
                status: true,
                count : result.rows.length,
                result: result.rows
            })
        }

        // IF THE DATA HAS NOT BEEN FETECHED THEN SENDING THE RESPONSE WITH FALSE STATUS

        else {
            res.json({
                message: "could not fetch",
                status: false
            })
        }
    }
    catch (err) {

        // EXCEPTION HANDLING

        res.json({
            message: "Error",
            status: false,
            error: err.message
        })
    }
    finally {
        client.release();
      }

}

// GET SINGLE PREFRENCE BY ID

exports.getpreference_typeById= async (req, res) => {

    // CONNECTING TO DATABASE

    const client = await pool.connect();
    try {

        // DESTRUCTUREING DATA FROM THE REQUEST QUERY

        const preference_type_id = req.query.preference_type_id;

        // CHECKING IF WE ARE GETTING THE DATA FROM REQUEST IF NOT THEN SENDING THE FALSE RESPONSE

        if (!preference_type_id) {
            return (
                res.status(400).json({
                    message: "Please Provide preference_type_id",
                    status: false
                })
            )
        }

        // SETTING UP QUERY TO GET DATA FROM THE DATABASE

        const query = 'SELECT * FROM preference_types WHERE preference_type_id = $1'

        // FETECHING DATA FROM DATABASE USING ABOVE QUERY

        const result = await pool.query(query , [preference_type_id]);
        
        // CHECKING IF DATA IS FETECHED THEN SENDING THE RESPONSE WITH STATUS TRUE AND RESULTS

        if (result.rowCount>0) {
            res.json({
                message: "Fetched",
                status: true,
                result: result.rows[0]
            })
        }

        // CHECKING IF DATA IS NOT FETECHED THEN SENDING THE RESPONSE WITH STATUS FALSE

        else {
            res.json({
                message: "could not fetch",
                status: false
            })
        }
    }
    catch (err) {

        // EXCEPTION HANDLING
        
        res.json({
            message: "Error",
            status: false,
            error: err.message
        })
    }
    finally {
        client.release();
      }

}

// exports.deleteTemporarily = async (req, res) => {
//     const client = await pool.connect();
//     try {
//         const workout_preference_type_id = req.query.workout_preference_type_id;
//         if (!workout_preference_type_id) {
//             return (
//                 res.status(400).json({
//                     message: "Please Provide workout_preference_type_id",
//                     status: false
//                 })
//             )
//         }

//         const query = 'UPDATE workout_preference_types SET trash=$2 WHERE workout_preference_type_id = $1 RETURNING *';
//         const result = await pool.query(query , [workout_preference_type_id , true]);

//         if(result.rowCount>0){
//             res.status(200).json({
//                 message: "Temporaily Deleted",
//                 status: true,
//                 Temporarily_deletedRecord: result.rows[0]
//             })
//         }
//         else{
//             res.status(404).json({
//                 message: "Could not delete . Record With this Id may not found or req.body may be empty",
//                 status: false,
//             })
//         }

//     }
//     catch (err) {
//         res.json({
//             message: "Error",
//             status: false,
//             error: err.message
//         })
//     }
//     finally {
//         client.release();
//       }
// }
 
// exports.recover_record = async (req, res) => {
//     const client = await pool.connect();
//     try {
//         const workout_preference_type_id = req.query.workout_preference_type_id;
//         if (!workout_preference_type_id) {
//             return (
//                 res.status(400).json({
//                     message: "Please Provide workout_preference_type_id",
//                     status: false
//                 })
//             )
//         }

//         const query = 'UPDATE workout_preference_types SET trash=$2 WHERE workout_preference_type_id = $1 RETURNING *';
//         const result = await pool.query(query , [workout_preference_type_id , false]);

//         if(result.rowCount>0){
//             res.status(200).json({
//                 message: "Recovered",
//                 status: true,
//                 recovered_record: result.rows[0]
//             })
//         }
//         else{
//             res.status(404).json({
//                 message: "Could not recover . Record With this Id may not found or req.body may be empty",
//                 status: false,
//             })
//         }

//     }
//     catch (err) {
//         res.json({
//             message: "Error",
//             status: false,
//             error: err.message
//         })
//     }
//     finally {
//         client.release();
//       }
// }
 
// exports.getAllTrashRecords = async (req, res) => {
//     const client = await pool.connect();
//     try {

//         const query = 'SELECT * FROM workout_preference_types WHERE trash = $1';
//         const result = await pool.query(query , [true]);

//         if(result.rowCount>0){
//             res.status(200).json({
//                 message: "Recovered",
//                 status: true,
//                 trashed_records: result.rows
//             })
//         }
//         else{
//             res.status(404).json({
//                 message: "Could not find trash records",
//                 status: false,
//             })
//         }

//     }
//     catch (err) {
//         res.json({
//             message: "Error",
//             status: false,
//             error: err.message
//         })
//     }
//     finally {
//         client.release();
//       }
// }