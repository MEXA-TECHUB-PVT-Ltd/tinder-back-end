

const {pool} = require("../../config/db.config");


exports.addSchool= async (req, res) => {
    const client = await pool.connect();
    try {
        const name = req.body.name;

        const query = 'INSERT INTO school (name) VALUES ($1) RETURNING*'
        const result = await pool.query(query , 
            [
                name ? name : null,
              
            ]);


            
        if (result.rows[0]) {
            res.status(201).json({
                message: "School saved in database",
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

exports.updateSchool = async (req, res) => {
    const client = await pool.connect();
    try {
        const school_id = req.body.school_id;
        const name = req.body.name;



        if (!school_id) {
            return (
                res.json({
                    message: "Please provide school_id ",
                    status: false
                })
            )
        }


    
        let query = 'UPDATE school SET ';
        let index = 2;
        let values =[school_id];

        
        if(name){
            query+= `name = $${index} , `;
            values.push(name)
            index ++
        }
      

        query += 'WHERE school_id = $1 RETURNING*'
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

exports.deleteSchool = async (req, res) => {
    const client = await pool.connect();
    try {
        const school_id = req.query.school_id;
       
        if (!school_id) {
            return (
                res.json({
                    message: "Please provide school_id ",
                    status: false
                })
            )
        }

        const query = 'DELETE FROM school WHERE school_id = $1 RETURNING *';
        const result = await pool.query(query , [school_id]);

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
exports.getAllSchools = async (req, res) => {
    const client = await pool.connect();
    try {

        let limit = req.query.limit;
        let page = req.query.page

        let result;

        if (!page || !limit) {
            const query = 'SELECT * FROM school'
            result = await pool.query(query);
           
        }

        if(page && limit){
            limit = parseInt(limit);
            let offset= (parseInt(page)-1)* limit

        const query = 'SELECT * FROM school LIMIT $1 OFFSET $2'
        result = await pool.query(query , [limit , offset]);

      
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

exports.getSchoolById= async (req, res) => {
    const client = await pool.connect();
    try {
        const school_id = req.query.school_id;

        if (!school_id) {
            return (
                res.status(400).json({
                    message: "Please Provide school_id",
                    status: false
                })
            )
        }
        const query = 'SELECT * FROM school WHERE school_id = $1'
        const result = await pool.query(query , [school_id]);

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

exports.searchSchool= async (req, res) => {
    const client = await pool.connect();
    try {
        let name = req.query.name;

        if(!name){
            return(
                res.json({
                    message: "name must be provided",
                    status : false
                })
            )
        }

        const query = `SELECT * FROM school WHERE name ILIKE $1`;
        let result = await pool.query(query , [name.concat("%")]);

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