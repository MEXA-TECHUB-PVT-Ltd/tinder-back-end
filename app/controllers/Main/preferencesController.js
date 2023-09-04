

const {pool} = require("../../config/db.config");


exports.addpreference = async (req, res) => {
    const client = await pool.connect();
    try {
        const preference = req.body.preference;
        const preference_type_id = req.body.preference_type_id;

        const query = 'INSERT INTO preferences (preference , preference_type_id) VALUES ($1 , $2) RETURNING*'
        const result = await pool.query(query , 
            [
                preference ? preference : null,
                preference_type_id ? preference_type_id : null
              
            ]);

        if (result.rows[0]) {
            res.status(201).json({
                message: "preference saved in database",
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

exports.updatepreference = async (req, res) => {
    const client = await pool.connect();
    try {
        const preference_id = req.body.preference_id;
        const preference = req.body.preference;
        const preference_type_id= req.body.preference_type_id;



        if (!preference_id) {
            return (
                res.json({
                    message: "Please provide preference_id ",
                    status: false
                })
            )
        }


    
        let query = 'UPDATE preferences SET ';
        let index = 2;
        let values =[preference_id];

        
        if(preference){
            query+= `preference = $${index} , `;
            values.push(preference)
            index ++
        }

        if(preference_type_id){
            query+= `preference_type_id = $${index} , `;
            values.push(preference_type_id)
            index ++
        }
      
      

        query += 'WHERE preference_id = $1 RETURNING*'
        query = query.replace(/,\s+WHERE/g, " WHERE");

       const result = await pool.query(query , values);

        if (result.rows[0]) {
            res.json({
                message: "Updated",
                status: true,
                result: result.rows[0]
            })
        }
        else {
            res.json({
                message: "Could not update . Record With this Id may not found or req.body may be empty",
                status: false,
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

exports.deletepreference = async (req, res) => {
    const client = await pool.connect();
    try {
        const preference_id = req.query.preference_id;
        if (!preference_id) {
            return (
                res.json({
                    message: "Please provide preference_id ",
                    status: false
                })
            )
        }

        const query = 'DELETE FROM preferences WHERE preference_id = $1 RETURNING *';
        const result = await pool.query(query , [preference_id]);

        if(result.rowCount>0){
            res.status(200).json({
                message: "Deletion successfull",
                status: true,
                deletedRecord: result.rows[0]
            })
        }
        else{
            res.status(404).json({
                message: "Could not delete . Record With this Id may not found or req.body may be empty",
                status: false,
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
exports.getAllpreferences = async (req, res) => {
    const client = await pool.connect();
    try {

        let limit = req.query.limit;
        let page = req.query.page

        let result;

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
            result = await pool.query(query , [false]);
           
        }

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
        result = await pool.query(query , [limit , offset , false]);

      
        }
       
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

exports.getpreferenceById= async (req, res) => {
    const client = await pool.connect();
    try {
        const preference_id = req.query.preference_id;
        if (!preference_id) {
            return (
                res.status(400).json({
                    message: "Please Provide preference_id",
                    status: false
                })
            )
        }
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
        const result = await pool.query(query , [preference_id]);

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

exports.getPreferencesByPreferenceType = async (req, res) => {
    const client = await pool.connect();
    try {


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

 const result = await pool.query(query,[category_id])
      

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
