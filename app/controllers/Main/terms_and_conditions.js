

const {pool} = require('../../config/db.config');


exports.addTermsAndConditions = async(req,res)=>{
    try{
        const text = req.body.text ;
        const query= 'INSERT INTO terms_and_condtions (text) Values ($1) RETURNING *'
        const result = await pool.query(query , [text]);

        if(result.rows[0]){
            res.json({
                message: "Created terms",
                status : true,
                result : result.rows[0]
            })
         }
         else{
            res.json({
                message: "Could not insert record",
                status : false
            })
         }
    }
    catch (err) {
        console.log(err)
        res.json({
            message: "Error Occurred",
            status: false,
            error: err.message
        })
    }
    
}
