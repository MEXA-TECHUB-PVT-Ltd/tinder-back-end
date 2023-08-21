const {pool} = require("../../config/db.config");

// ADD PREFRENCE TO DATABASE

exports.addpreference = async (req, res) => {

    // CONNECTING TO DATABASE

    const client = await pool.connect();
    try {

        // DESTRUCTURING DATA FROM THE BODY

        const preference = req.body.preference;
        const preference_type_id = req.body.preference_type_id;
        
        // SETTING UP QUERY TO SAVE DATA IN DATABASE

        const query = 'INSERT INTO preferences (preference , preference_type_id) VALUES ($1 , $2) RETURNING*'

        // SAVING DATA INTO THE DATABASE USING QUERY ABOVE

        const result = await pool.query(query , 
            [
                preference ? preference : null,
                preference_type_id ? preference_type_id : null
              
            ]);
        
        // CHECKING IF THE DATA IS SAVED THEN SENDING RESPONSE WITHH STATUS TRUE

        if (result.rows[0]) {
            res.status(201).json({
                message: "preference saved in database",
                status: true,
                result: result.rows[0]
            })
        }
        
        // CHECKING IF THE DATA IS NOT SAVED THEN SENDING RESPONSE WITHH STATUS FALSE

        else {
            res.status(400).json({
                message: "Could not save",
                status: false
            })
        }
    }
    catch (err) {
        
        // EXCEPTION HANLING

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

// UPDATING PREFRENCE IN DATABASE

exports.updatepreference = async (req, res) => {

    // CONNECTING TO DATABASE

    const client = await pool.connect();
    try {

        // DESTRUCTURING DATA FROM THE BODY

        const preference_id = req.body.preference_id;
        const preference = req.body.preference;
        const preference_type_id= req.body.preference_type_id;


        // CHECKING IF DATA IS NOT RECIEVED THEN SENDING RESPONSE WITH STATUS FALSE
        if (!preference_id) {
            return (
                res.json({
                    message: "Please provide preference_id ",
                    status: false
                })
            )
        }

        // SETTING UP QUERY TO UPDATE DATA

        let query = 'UPDATE preferences SET ';
        let index = 2;
        let values =[preference_id];

        // CHECKING IF PREFRENCE IS AVAILABLE THEN CONCATINATING IT IN QUERY
        
        if(preference){
            query+= `preference = $${index} , `;
            values.push(preference)
            index ++
        }

        // CHECKING IF PREFRENCE_TYPE_ID IS AVAILABLE THEN CONCATINATING IT IN QUERY

            
        if(preference_type_id){
            query+= `preference_type_id = $${index} , `;
            values.push(preference_type_id)
            index ++
        }
      
        // FURTHER MAKING THE QUERY READY

        query += 'WHERE preference_id = $1 RETURNING*'
        query = query.replace(/,\s+WHERE/g, " WHERE");
        console.log(query);

        // UPDATING THE PREFRENCE IN DATABASE

       const result = await pool.query(query , values);

       // CHECK IF THE CHANGES HAS BEEN MADE THEN SENDING RESPONSE WITH STATUS TRUE AND RESULTS

        if (result.rows[0]) {
            res.json({
                message: "Updated",
                status: true,
                result: result.rows[0]
            })
        }

        // CHECK IF THE CHANGES HAS NOT BEEN MADE THEN SENDING RESPONSE WITH STATUS FALSE

        else {
            res.json({
                message: "Could not update . Record With this Id may not found or req.body may be empty",
                status: false,
            })
        }

    }
    catch (err) {

        // ERROR HANDLING

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

// DELETING A REFRENCE

exports.deletepreference = async (req, res) => {

    // CONNECTING TO DATABASE

    const client = await pool.connect();
    try {

        // DESTRUCTURING FROM THE REQUEST QUERY

        const preference_id = req.query.preference_id;

        // CHECKING IF THE DATA IS RECIEVED

        if (!preference_id) {
            return (
                res.json({
                    message: "Please provide preference_id ",
                    status: false
                })
            )
        }

        // SETTING UP QUERY TO DELETE THE DATA FROM DB

        const query = 'DELETE FROM preferences WHERE preference_id = $1 RETURNING *';

        // DELETING DATA FROM THE DB USING QUERY ABOVE

        const result = await pool.query(query , [preference_id]);

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

// GET ALL PREFRENCES FROM DB

exports.getAllpreferences = async (req, res) => {

    // CONNECTING TO DB

    const client = await pool.connect();
    try {

        // DESTRUCTURING DATA FROM THE REQUEST QUERY

        let limit = req.query.limit;
        let page = req.query.page

        let result;

        // CHECKING IF DATA IS NOT RECIEVED THEN SETTING UP A QUERY TO FETCH ALL THE PREFRENCES IN DB

        if (!page || !limit) {
            const query = `SELECT  
            p.preference_id ,
            p.preference,
            json_agg(json_build_object(
                'preference_type_id' , pt.preference_type_id,
                'preference_type' , pt.preference_type,
                'created_at', pt.created_at,
                'updated_at', pt.updated_at
            )) AS preference_type
            FROM preference_types pt
            JOIN preferences p ON p.preference_type_id = pt.preference_type_id
            WHERE p.trash = $1
            GROUP BY p.preference_type_id , p.preference_id
            `

            // FETCHING ALL PREFRENCES FROM DB USING QUERY ABOVE

            result = await pool.query(query , [false]);
           
        }
        
        // CHECKING IF DATA IS NOT RECIEVED THEN SETTING UP A QUERY TO FETCH SELECTED PREFRENCES IN DB

        if(page && limit){
            limit = parseInt(limit);
            let offset= (parseInt(page)-1)* limit

            const query = `SELECT  
                p.preference_id ,
                p.preference,
                json_agg(json_build_object(
                'preference_type_id' , pt.preference_type_id,
                'preference_type' , pt.preference_type,
                'created_at', pt.created_at,
                'updated_at', pt.updated_at
                )) AS preference_type
                FROM preference_types pt
                JOIN preferences p ON p.preference_type_id = pt.preference_type_id
                WHERE p.trash = $3
                GROUP BY p.preference_type_id , p.preference_id
                LIMIT $1 OFFSET $2`

            // FETCHING PREFRENCES FROM DB USING QUERY ABOVE

            result = await pool.query(query , [limit , offset , false]);
        }
       
        // CHECKING IF THE PREFRENCES HAS BEEN FETCHED THEN SENDING STATUS TRUE WITH DATA IN RESPONSE

        if (result.rows) {
            res.json({
                message: "Fetched",
                status: true,
                count : result.rows.length,
                result: result.rows
            })
        }

        // CHECKING IF THE PREFRENCES HAS NOT BEEN FETCHED THEN SENDING STATUS FALSE

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

// GETTING SINGLE PREFRENCE USING PREFRENCE ID

exports.getpreferenceById= async (req, res) => {

    // CONNECTING TO DATABASE

    const client = await pool.connect();
    try {

        // DESTRUCTURING DATA FROM REQUEST QUERY

        const preference_id = req.query.preference_id;

        // CHECKING IF THE DATA IS RECIEVED

        if (!preference_id) {
            return (
                res.status(400).json({
                    message: "Please Provide preference_id",
                    status: false
                })
            )
        }

        // SETTING UP QUERY TO FETECH QUERY FROM DB

        const query = `SELECT  
        p.preference_id ,
        p.preference,
        json_agg(json_build_object(
            'preference_type_id' , pt.preference_type_id,
            'preference_type' , pt.preference_type,
            'created_at', pt.created_at,
            'updated_at', pt.updated_at
        )) AS preference_type
        FROM preference_types pt
        JOIN preferences p ON p.preference_type_id = pt.preference_type_id
        WHERE preference_id = $1
        GROUP BY p.preference_id`

        // FETECHING DATA FROM DB USING QUERY ABOVE

        const result = await pool.query(query , [preference_id]);

        // CHECKING IF THE DATA HAS BEEN FETECHED THEN SENDING STATUS TRUE WITH DATA

        if (result.rowCount>0) {
            res.json({
                message: "Fetched",
                status: true,
                result: result.rows[0]
            })
        }
        
        // CHECKING IF THE DATA HAS NOT BEEN FETECHED THEN SENDING STATUS FALSE

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

// GET PREFRENCES BY PREFRENCES TYPE

exports.getPreferencesByPreferenceType = async (req, res) => {

    // CONNECTING TO DB

    const client = await pool.connect();
    try {

        // SETTING UP QUERY TO GET DATA FROM SERVER

        const query = `SELECT json_agg(
            json_build_object(
                'interest_id', int.interest_id,
                'interest_name', int.interest_name,
                'category', json_build_object(
                    'category_id', c.category_id,
                    'category_name', c.category_name,
                    'image' , c.image,
                    'trash', c.trash,
                    'created_at', c.created_at,
                    'updated_at', c.updated_at
                    ),
                'trash', int.trash,
                'created_at', int.created_at,
                'updated_at', int.updated_at
                )
            ) 
            FROM pre int
            JOIN categories c ON int.category_id = c.category_id
            WHERE int.category_id = $1;
        `

        // FETCHING DATA FROM THE SERVER USING QUERY ABOVE

        const result = await pool.query(query,[category_id])
      
        // CHECKING IF THE DATA IS FETECHED THEN SENDING RESPONSE WITH STATUS TRUE AND DATA

        if (result.rows) {
            res.json({
                message: "Fetched",
                status: true,
                count : result.rows.length,
                result: result.rows
            })
        }
        
        // CHECKING IF THE DATA IS NOT FETECHED THEN SENDING RESPONSE WITH STATUS FALSE

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
//         const workout_preference_id = req.query.workout_preference_id;
//         if (!workout_preference_id) {
//             return (
//                 res.status(400).json({
//                     message: "Please Provide workout_preference_id",
//                     status: false
//                 })
//             )
//         }

//         const query = 'UPDATE workout_preferences SET trash=$2 WHERE workout_preference_id = $1 RETURNING *';
//         const result = await pool.query(query , [workout_preference_id , true]);

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
//         const workout_preference_id = req.query.workout_preference_id;
//         if (!workout_preference_id) {
//             return (
//                 res.status(400).json({
//                     message: "Please Provide workout_preference_id",
//                     status: false
//                 })
//             )
//         }

//         const query = 'UPDATE workout_preferences SET trash=$2 WHERE workout_preference_id = $1 RETURNING *';
//         const result = await pool.query(query , [workout_preference_id , false]);

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

//         const query = 'SELECT * FROM workout_preferences WHERE trash = $1';
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
