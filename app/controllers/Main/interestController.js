

const { pool } = require("../../config/db.config");

// Add interests IN DATABASE
exports.addinterest = async (req, res) => {
    const client = await pool.connect();
    try {

        // Destructuring data from body
        const interest_name = req.body.interest_name;
        const category_id = req.body.category_id;

        // CHECK IF THE DATA IS VALID
        if (!interest_name || !category_id) {
            return (
                res.json({
                    message: "interest _name and category_id must be provided",
                    status: false
                })
            )
        }

        // ADDING NEW INTEREST IN DATABASE
        const query = 'INSERT INTO interests (interest_name , category_id) VALUES ($1 , $2) RETURNING*'
        const result = await pool.query(query,
            [
                interest_name ? interest_name : null,
                category_id ? category_id : null

            ]);

        // CHECK IF THE DATA IS SAVED IN DATABASE SUCESSFULLY THEN SENDING RESPONSE
        if (result.rows[0]) {
            res.status(201).json({
                message: "interest saved in database",
                status: true,
                result: result.rows[0]
            })
        }
        else {
            res.status(400).json({
                message: "Could not save",
                status: false
            })
        }
    }
    catch (err) {
              
        // HANDLING EXCEPTIONS

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
// UPDATE INTEREST USING INTEREST ID
exports.updateinterest = async (req, res) => {

    // CONNECTING TO DATABASE
    const client = await pool.connect();
    try {

        // Destructuring data from body
        const interest_id = req.body.interest_id;
        const interest_name = req.body.interest_name;
        const category_id = req.body.category_id;

        // CHECKING IF THE INTEREST_ID IS PRESENT IN THE BODY
        if (!interest_id) {
            return (
                res.json({
                    message: "Please provide interest_id ",
                    status: false
                })
            )
        }


        // SETTING QUERY TO USE FOR UPDATING INTEREST
        let query = 'UPDATE interests SET ';
        let index = 2;
        let values = [interest_id];

        // ADDING INTEREST_NAME IN QUERY

        if (interest_name) {
            query += `interest_name = $${index} , `;
            values.push(interest_name)
            index++
        }

        // ADDING CATEGORY_ID IN QUERY

        if (category_id) {
            query += `category_id = $${index} , `;
            values.push(category_id)
            index++
        }
        query += 'WHERE interest_id = $1 RETURNING*'
        query = query.replace(/,\s+WHERE/g, " WHERE");
        console.log(query);

        // MAKING THE CHANGES IN DATABASE
        const result = await pool.query(query, values);

        // CHECKING IF THE CHANGES ARE MADE SUCESSFULLY OR NOT
        if (result.rows[0]) {
            res.json({
                message: "Updated",
                status: true,
                result: result.rows[0]
            })
        }
        // IF THE CHANGES ARE NOT MADE THEN SENDING STATUS FALSE RESPONSE
        else {
            res.json({
                message: "Could not update . Record With this Id may not found or req.body may be empty",
                status: false,
            })
        }

    }
    catch (err) {
         
        // HANDLING EXCEPTIONS

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

// DELETE INTEREST
exports.deleteinterest = async (req, res) => {
    const client = await pool.connect();
    try {
        // DESTRUCTURING INTEREST_ID FROM THE BODY
        const interest_id = req.query.interest_id;

        // CHECKING IF THE INTEREST_ID IS PRESENT
        if (!interest_id) {
            return (
                res.json({
                    message: "Please provide interest_id ",
                    status: false
                })
            )
        }
        // SETTING UP THE QUERY
        const query = 'DELETE FROM interests WHERE interest_id = $1 RETURNING *';

        // MAKING CHANGES IN THE DATABASE
        const result = await pool.query(query, [interest_id]);

        // CHECKING IF THE CHANGES HAS BEEN MADE SUCESSFULLY OR NOT, THEN SENDING RESPONSE ACCORDINGLY
        if (result.rowCount > 0) {
            res.status(200).json({
                message: "Deletion successfull",
                status: true,
                deletedRecord: result.rows[0]
            })
        }
        // IF THE CHANGES ARE NOT MADE THEN SENDING STATUS FALSE RESPONSE

        else {
            res.status(404).json({
                message: "Could not delete . Record With this Id may not found or req.body may be empty",
                status: false,
            })
        }

    }
    catch (err) {
         
        // HANDLING EXCEPTIONS

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

// FETCHING ALL INTERESTS
exports.getAllinterests = async (req, res) => {
    // CONNECTING TO DATABASE
    const client = await pool.connect();
    try {
        // DESTRUCTTURING LIMIT AND PAGE FROM BODY
        let limit = req.query.limit;
        let page = req.query.page

        let result;

        // IF PAGE AND LIMIT ARE NOT AVAILABLE THEN
        if (!page || !limit) {
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
            FROM interests int
             LEFT OUTER JOIN categories c ON int.category_id = c.category_id
             WHERE int.trash = $1`

             // FETCHING ALL THE DATA FROM DATABASE AS LIMIT IS NOT GIVEN
            result = await pool.query(query, [false]);

        }

        // IF LIMIT AND PAGE ARE AVAILBALE THEN 
        if (page && limit) {
            limit = parseInt(limit);
            let offset = (parseInt(page) - 1) * limit

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
        FROM interests int
        LEFT OUTER JOIN categories c ON int.category_id = c.category_id
         WHERE int.trash=$3 LIMIT $1 OFFSET $2`

            // FETCHING THE DATA FROM DATABASE ACCORDING TO THE GIVEN LIMIT
            result = await pool.query(query, [limit, offset, false]);


        }

        // CHECKING IF THE DATA IS FETCHED SUCESSFULLY THEN SENDING STATUS TRUE AND FETCH DATA
        if (result.rows) {
            res.json({
                message: "Fetched",
                status: true,
                count: result.rows[0].json_agg ? result.rows[0].json_agg.length : 0,
                result: result.rows[0].json_agg
            })
        }

        // IF THE DATA IS NOT FETCHED SUCESSFULLY THEN SENDING STATUS FALSE
        else {
            res.json({
                message: "could not fetch",
                status: false
            })
        }
    }
    catch (err) {

        // HANDLING EXCEPTIONS

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

// GET SINGLE INTEREST BY INTEREST ID

exports.getinterestById = async (req, res) => {

    // CONNECTING TO DATABASE

    const client = await pool.connect();
    try {

        // DESTRUCTURING THE DATA FROM REQUEST BODY

        const interest_id = req.query.interest_id;

        // CHECKING IF INTERERT_ID IS NOT AVAILABLE RETURNING THE STATUS FALSE RESPONSE

        if (!interest_id) {
            return (
                res.status(400).json({
                    message: "Please Provide interest_id",
                    status: false
                })
            )
        }

        // SETTING UP THE QUERY TO FETCH THE INTEREST ACCORDING TO THE GIVEN ID

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
        FROM interests int
        LEFT OUTER JOIN categories c ON int.category_id = c.category_id
         WHERE interest_id = $1`

        // FETCHING DATA FROM THE DATABASE USING THE QUERY SET ABOVE

        const result = await pool.query(query, [interest_id]);

        // CHECKING IF THE DATA IS FETCHED SUCESSFULLY THEN SENDING STATUS TRUE AND FETCH DATA   

        if (result.rowCount > 0) {
            res.json({
                message: "Fetched",
                status: true,
                result: result.rows[0].json_agg
            })
        }

        // IF THE DATA IS NOT FETCHED SUCESSFULLY THEN SENDING STATUS FALSE

        else {
            res.json({
                message: "could not fetch",
                status: false
            })
        }
    }
    catch (err) {
         
        // HANDLING EXCEPTIONS

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

// GET INTEREST BY CATEGORY ID

exports.getInterestsBycategory_id = async (req, res) => {

    // CONNECTING TO DATABASE

    const client = await pool.connect();
    try {

        // DESTRUCTUREING DATA FROM REQUEST BODY

        const category_id = req.query.category_id;

        // CHECKING IF THE DATA IS NOT AVAILABLE RETURNING FALSE RESPONSE

        if (!category_id) {
            return (
                res.json({
                    message: "Category id must be provided",
                    status: false
                })
            )
        }

        // SETTING UP QUERY TO FETCH THE INTEREST BY PROVIDING THE CATEGORY ID

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
        FROM interests int
        JOIN categories c ON int.category_id = c.category_id
        WHERE int.category_id = $1;
 `
        // FETECHING THE DATA FROM THE DATABASE USING ABOVE QUERY

        const result = await pool.query(query, [category_id])
        
        // CHECKING IF THE DATA IS FETCHED SUCESSFULLY SENDING STATUS TRUE WITH RESULTS AND LENGTH OF RESULTS
        if (result.rows) {
            res.json({
                message: "Fetched",
                status: true,
                count: result.rows[0].json_agg.length,
                result: result.rows[0].json_agg
            })
        }

        // IF THE DATA IS NOT FETCHING SENDING FALSE RESPONSE

        else {
            res.json({
                message: "could not fetch",
                status: false
            })
        }
    }
    catch (err) {
         
        // HANDLING EXCEPTIONS

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
//         const workout_interest_id = req.query.workout_interest_id;
//         if (!workout_interest_id) {
//             return (
//                 res.status(400).json({
//                     message: "Please Provide workout_interest_id",
//                     status: false
//                 })
//             )
//         }

//         const query = 'UPDATE workout_interests SET trash=$2 WHERE workout_interest_id = $1 RETURNING *';
//         const result = await pool.query(query , [workout_interest_id , true]);

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
//         const workout_interest_id = req.query.workout_interest_id;
//         if (!workout_interest_id) {
//             return (
//                 res.status(400).json({
//                     message: "Please Provide workout_interest_id",
//                     status: false
//                 })
//             )
//         }

//         const query = 'UPDATE workout_interests SET trash=$2 WHERE workout_interest_id = $1 RETURNING *';
//         const result = await pool.query(query , [workout_interest_id , false]);

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

//         const query = 'SELECT * FROM workout_interests WHERE trash = $1';
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

exports.searchinterest = async (req, res) => {
    const client = await pool.connect();
    try {
        let name = req.query.name;

        if (!name) {
            return (
                res.json({
                    message: "name must be provided",
                    status: false
                })
            )
        }

        const query = `SELECT * FROM interests WHERE interest_name ILIKE $1`;
        let result = await pool.query(query, [name.concat("%")]);

        if (result.rows) {
            result = result.rows
        }

        if (result) {
            res.json({
                message: "Fetched",
                status: true,
                result: result
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