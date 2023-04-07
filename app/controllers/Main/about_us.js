const {pool} = require('../../config/db.config');


exports.add_aboutus = async(req,res)=>{
    try{
        const text = req.body.text ;
        const query= 'INSERT INTO about_us (text) Values ($1) RETURNING *'
        const result = await pool.query(query , [text]);

        if(result.rows[0]){
            res.json({
                message: "Created about_us",
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
