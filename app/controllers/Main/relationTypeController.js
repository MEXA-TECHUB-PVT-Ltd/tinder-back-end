

const {pool} = require("../../config/db.config");

// ADD RELATION TYPE IN DATABASE

exports.addRelation_type= async (req, res) => {

    // CONNECTING TO DATABASE

    const client = await pool.connect();
    try {

        // DESTRUCTURING DATA FROM REQUEST BODY

        const type = req.body.type;

        // SETTING UP QUERY TO ADD RELATION TYPE 

        const query = 'INSERT INTO relation_type (type) VALUES ($1) RETURNING*'

        // SAVING DATA IN DB USING QUERY ABOVE

        const result = await pool.query(query , 
            [
                type ? type : null,
              
            ]);

        // CHECKING IF THE DATA IS SAVED IN DATABASE THEN SENDING RESPONSE WITH STATUS TRUE
            
        if (result.rows[0]) {
            res.status(201).json({
                message: "relation_type saved in database",
                status: true,
                result: result.rows[0]
            })
        }

        // CHECKING IF THE DATA IS NOT SAVED IN DATABASE THEN SENDING RESPONSE WITH STATUS FALSE

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

// UPDATE RELATION TYPE IN DATABASE

exports.updateRelation_type = async (req, res) => {

    // CONNECTING TO DATABASE

    const client = await pool.connect();
    try {

        // DESTRUCTURING DATA FROM REQUEST BODY

        const relation_type_id = req.body.relation_type_id;
        const type = req.body.type;

        // CHECKING IF DATA IS NOT RECIEVED THEN SENDING RESPONSE WITH STATUS FALSE

        if (!type) {
            return (
                res.json({
                    message: "Please provide type ",
                    status: false
                })
            )
        }

        // SETTING UP QUERY 
    
        let query = 'UPDATE relation_type SET ';
        let index = 2;
        let values =[relation_type_id];
        if(type){
            query+= `type = $${index} , `;
            values.push(type)
            index ++
        }
      
        // FURTHER SETTING UP QUERY FINALIZING IT

        query += 'WHERE relation_type_id = $1 RETURNING*'
        query = query.replace(/,\s+WHERE/g, " WHERE");
        
        // UPDATING DATA IN DATABASE USING ABOVE QUERY

        const result = await pool.query(query , values);
        
       // CHECKING IF THE DATA IS UPDATED IN DATABASE THEN SENDING RESPONSE WITH STATUS TRUE

        if (result.rows[0]) {
            res.json({
                message: "Updated",
                status: true,
                result: result.rows[0]
            })
        }

        // CHECKING IF THE DATA IS NOT UPDATED THEN SENDING RESPONSE WITH STATUS FALSE

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

// DELETE RELATION TYPE

exports.deleteRelation_type = async (req, res) => {

    // CONNECTING TO DB

    const client = await pool.connect();
    try {

        // DETRUCTURING DATA FROM REQUEST QUERY

        const relation_type_id = req.query.relation_type_id;
       
        // CHECKING IF THE DATA IS NOT RECIEVED THEN SENDING RESPONSE WITH STATUS FALSE

        if (!relation_type_id) {
            return (
                res.json({
                    message: "Please provide relation_type_id ",
                    status: false
                })
            )
        }

        // SETTING UP QUERY TO DELETE DATA FROM DATABASE

        const query = 'DELETE FROM relation_type WHERE relation_type_id = $1 RETURNING *';

        // DELETING DATA FROM DB USING QUERY ABOVE

        const result = await pool.query(query , [relation_type_id]);

        // CHECKING IF THE DATA HAS BEEN DELETED SUCESSFULLY THEN SENDING RESPONSE WITH STATUS TRUE

        if(result.rowCount>0){
            res.status(200).json({
                message: "Deletion successfull",
                status: true,
                deletedRecord: result.rows[0]
            })
        }

        // CHECKING IF THE DATA HAS NOT BEEN DELETED SUCESSFULLY THEN SENDING RESPONSE WITH STATUS FALSE

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

// GET ALL RELATION TYPES

exports.getAllrelation_types = async (req, res) => {

    // CONNECTING TO DB

    const client = await pool.connect();
    try {

        // DESTRUCTURING DATA FROM REQUEST QUERY

        let limit = req.query.limit;
        let page = req.query.page

        let result;

        // CHECKING IF THE DATA IS RECIEVED

        if (!page || !limit) {
            const query = 'SELECT * FROM relation_type'
            result = await pool.query(query);
           
        }

        // CHECKING IF BOTH ARE AVAILABLE THEN SETTING QUERY ACCORDINGLY

        if(page && limit){
            limit = parseInt(limit);
            let offset= (parseInt(page)-1)* limit

        const query = 'SELECT * FROM relation_type LIMIT $1 OFFSET $2'
        result = await pool.query(query , [limit , offset]);

      
        }
        
        // CHECKING IF THE DATA HAS BEEN SAVED THEN SEDING RESPONSE WITH STATUS TRUE
        
        if (result.rows) {
            res.json({
                message: "Fetched",
                status: true,
                count : result.rows.length,
                result: result.rows
            })
        }
        else {
            res.json({
                message: "could not fetch",
                status: false
            })
        }
    }
    catch (err) {
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

exports.getRelation_typeById= async (req, res) => {
    const client = await pool.connect();
    try {
        const relation_type_id = req.query.relation_type_id;

        if (!relation_type_id) {
            return (
                res.status(400).json({
                    message: "Please Provide relation_type_id",
                    status: false
                })
            )
        }
        const query = 'SELECT * FROM relation_type WHERE relation_type_id = $1'
        const result = await pool.query(query , [relation_type_id]);

        if (result.rowCount>0) {
            res.json({
                message: "Fetched",
                status: true,
                result: result.rows[0]
            })
        }
        else {
            res.json({
                message: "could not fetch",
                status: false
            })
        }
    }
    catch (err) {
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

exports.searchrelation_type= async (req, res) => {
    const client = await pool.connect();
    try {
        let type = req.query.type;

        if(!type){
            return(
                res.json({
                    message: "type must be provided",
                    status : false
                })
            )
        }

        const query = `SELECT * FROM relation_type WHERE type ILIKE $1`;
        let result = await pool.query(query , [type.concat("%")]);

        if(result.rows){
            result = result.rows
        }
       
        if (result) {
            res.json({
                message: "Fetched",
                status: true,
                result : result
            })
        }
        else {
            res.json({
                message: "could not fetch",
                status: false
            })
        }
    }
    catch (err) {
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
//         const workout_category_id = req.query.workout_category_id;
//         if (!workout_category_id) {
//             return (
//                 res.status(400).json({
//                     message: "Please Provide workout_category_id",
//                     status: false
//                 })
//             )
//         }

//         const query = 'UPDATE workout_categories SET trash=$2 WHERE workout_category_id = $1 RETURNING *';
//         const result = await pool.query(query , [workout_category_id , true]);

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
//         const workout_category_id = req.query.workout_category_id;
//         if (!workout_category_id) {
//             return (
//                 res.status(400).json({
//                     message: "Please Provide workout_category_id",
//                     status: false
//                 })
//             )
//         }

//         const query = 'UPDATE workout_categories SET trash=$2 WHERE workout_category_id = $1 RETURNING *';
//         const result = await pool.query(query , [workout_category_id , false]);

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

//         const query = 'SELECT * FROM workout_categories WHERE trash = $1';
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
