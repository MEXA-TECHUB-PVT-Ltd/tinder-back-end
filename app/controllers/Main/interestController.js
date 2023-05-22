

const {pool} = require("../../config/db.config");


exports.addinterest = async (req, res) => {
    const client = await pool.connect();
    try {
        const interest_name = req.body.interest_name;

        const query = 'INSERT INTO interests (interest_name) VALUES ($1) RETURNING*'
        const result = await pool.query(query , 
            [
                interest_name ? interest_name : null,
              
            ]);

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
        console.log(err)
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

exports.updateinterest = async (req, res) => {
    const client = await pool.connect();
    try {
        const interest_id = req.body.interest_id;
        const interest_name = req.body.interest_name;



        if (!interest_id) {
            return (
                res.json({
                    message: "Please provide interest_id ",
                    status: false
                })
            )
        }


    
        let query = 'UPDATE interests SET ';
        let index = 2;
        let values =[interest_id];

        
        if(interest_name){
            query+= `interest_name = $${index} , `;
            values.push(interest_name)
            index ++
        }
      

        query += 'WHERE interest_id = $1 RETURNING*'
        query = query.replace(/,\s+WHERE/g, " WHERE");
        console.log(query);

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

exports.deleteinterest = async (req, res) => {
    const client = await pool.connect();
    try {
        const interest_id = req.query.interest_id;
        if (!interest_id) {
            return (
                res.json({
                    message: "Please provide interest_id ",
                    status: false
                })
            )
        }

        const query = 'DELETE FROM interests WHERE interest_id = $1 RETURNING *';
        const result = await pool.query(query , [interest_id]);

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
exports.getAllinterests = async (req, res) => {
    const client = await pool.connect();
    try {

        let limit = req.query.limit;
        let page = req.query.page

        let result;

        if (!page || !limit) {
            const query = 'SELECT * FROM interests WHERE trash=$1'
            result = await pool.query(query , [false]);
           
        }

        if(page && limit){
            limit = parseInt(limit);
            let offset= (parseInt(page)-1)* limit

        const query = 'SELECT * FROM interests WHERE trash=$3 LIMIT $1 OFFSET $2'
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

exports.getinterestById= async (req, res) => {
    const client = await pool.connect();
    try {
        const interest_id = req.query.interest_id;
        if (!interest_id) {
            return (
                res.status(400).json({
                    message: "Please Provide interest_id",
                    status: false
                })
            )
        }
        const query = 'SELECT * FROM interests WHERE interest_id = $1'
        const result = await pool.query(query , [interest_id]);

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

exports.searchinterest= async (req, res) => {
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

        const query = `SELECT * FROM interests WHERE interest_name ILIKE $1`;
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