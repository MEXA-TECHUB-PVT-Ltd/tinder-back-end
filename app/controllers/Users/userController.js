
const {pool}  = require("../../config/db.config");

const Joi = require("joi");
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');


exports.registerUser = async (req, res, next) => {
    const client = await pool.connect();
    try {
        const email = req.body.email;
        const password = req.body.password;
        const { error } = registerSchema.validate(req.body);
        if (error) {
            return (
                res.status(400).json({
                    message: "Error occurred",
                    error: error.details[0].message,
                    status: false
                })
            )
        }
        

        const found_email_query = 'SELECT * FROM users WHERE email = $1'
        const emailExists = await pool.query(found_email_query , [email])
        


        if (emailExists.rowCount>0) {
            return (
                res.status(400).json({
                    message: "user with this email already exists",
                    status: false
                })
            )
        }


        const query = 'INSERT INTO users (email , password , profile_boosted) VALUES ($1 , $2 , $3) RETURNING*'
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(req.body.password, salt);


        const result = await pool.query(query , [email , hashPassword , false]);
        console.log(result.rows[0])

        if(result.rows[0]){
            res.json({
                message: "User Has been registered successfully",
                status : true,
                result:result.rows[0]
            })
        }
        else{
            res.json({
                message: "Could not Register user",
                status :false,
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
    }finally {
        client.release();
      }

}

exports.login = async (req, res) => {
    try {
        const email = req.body.email;
        let password = req.body.password;

  
        if (!email || !password) {
            return (
                res.status(400).json({
                    message: "email and password must be provided",
                    status: false
                })
            )
        }

        const query = 'SELECT * FROM users WHERE email = $1';
        const foundResult = await pool.query(query  , [email]);

        console.log(foundResult)


        if (foundResult.rowCount == 0) {
            return (
                res.status(400).json({
                    message: "Wrong email or password",
                    status: false
                })
            )
        }

        const vaildPass = await bcrypt.compare(password, foundResult.rows[0].password);

        if (!vaildPass) {
            return (
                res.status(401).json({
                    message: "Wrong email or password",
                    status: false
                })
            )
        }

        const token = jwt.sign({ id: foundResult.rows[0].user_id }, process.env.TOKEN, { expiresIn: '30d' });
        res.json({
            message: "Logged in Successfully",
            status: true,
            result: foundResult.rows[0],
            jwt_token: token
        });

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


exports.updateProfile= async (req,res)=>{
    try{
        const user_id = req.body.user_id;

         if(!user_id){
            return(res.json({message : "Please provide user_id" , status : false}))
         }

        const first_name= req.body.first_name;
        const last_name = req.body.last_name ;
        const profession = req.body.profession ;
        const interests = req.body.interests ;
        const appreciation_text = req.body.appreciation_text;
        const height = req.body.height;
        const profile_picture = req.body.profile_picture;
        const gender = req.body.gender ;
        const date_of_birth = req.body.date_of_birth;
        const country = req.body.country;
        const city = req.body.city ;
        const state = req.body.state ;
        const education = req.body.education ;
        const academic_qualifications = req.body.academic_qualifications
        const graduated_university = req.body.graduated_university ;
        const smoke_status = req.body.smoke_status ;
        const drink_status = req.body.drink_status ;
        const constellation_id = req.body.constellation_id;
        const annual_income = req.body.annual_income;
        const children = req.body.children ;
        const bio = req.body.bio ;
        let longitude = req.body.longitude;
        let latitude = req.body.latitude;


        //filtering and modifying
        longitude = parseFloat(longitude);
        latitude = parseFloat(latitude);

        if(gender)
        {if(gender== 'male' || gender== 'female' || gender == 'prefer_not_to_say'){}else{
            res.json({
                message: "gender should only be male , femal , prefer_not_to_say",
                status:false
            })
        }}

        

        const query = `UPDATE users SET
        first_name = $1,
        last_name = $2,
        profession = $3,
        interests = $4,
        appreciation_text = $5,
        height = $6,
        profile_picture = $7,
        gender = $8,
        date_of_birth = $9,
        country = $10,
        city = $11,
        state = $12,
        education = $13,
        academic_qualifications = $14,
        graduated_university = $15,
        smoke_status = $16,
        drink_status = $17,
        constellation_id = $18,
        annual_income = $19,
        children = $20,
        bio = $21,
        longitude = $22,
        latitude = $23
        WHERE user_id = $24 RETURNING *;
    `;

    const values = [
        first_name || null,
        last_name || null,
        profession || null,
        interests || null,
        appreciation_text || null,
        height || null,
        profile_picture || null,
        gender || null,
        date_of_birth || null,
        country || null,
        city || null,
        state || null,
        education || null,
        academic_qualifications || null,
        graduated_university || null,
        smoke_status || null,
        drink_status || null,
        constellation_id || null,
        annual_income || null,
        children || null,
        bio || null,
        longitude || null,
        latitude || null,
        user_id
      ];
      

      const result = await pool.query(query , values);

      if(result.rows[0]){
        res.json({
            message: "Profile Updated successfully",
            status : true ,
            result : result.rows[0]
        })
      }
      else{
        res.json({
            message: "Profile could not be updated successfully",
            status : false,
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

exports.updatePassword = async(req,res)=>{
    try{
        const email = req.body.email ;
        const password = req.body.password;

        const query = 'UPDATE users SET password = $1 WHERE email = $2 RETURNING*';
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);

        const result = await pool.query(query , [hashPassword , email]);

        if(result.rows[0]){
            res.json({message: "Update successfully" , status :true , result : result.rows[0]})
        }
        else{
            res.json({message: "Could not Update" , status : false })
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

exports.viewProfile = async(req,res)=>{
    try{
        const user_id = req.query.user_id;
        if(!user_id){
            return(res.json({message : "Please provide user_id" , status : false}))
         }


         const query = 'SELECT * FROM users WHERE user_id = $1';
         const result = await pool.query(query , [user_id]);


         if(result.rowCount>0){
            res.json({
                message: "User profile fetched",
                status : true,
                result : result.rows[0]
            })
         }
         else{
            res.json({
                message: "Could not Fetch profile , may be the user_id is wrong",
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
exports.getAllUsers = async (req, res) => {
    const client = await pool.connect();
    try {
        let limit = req.query.limit;
        let page = req.query.page

        let result;

        if (!page || !limit) {
            const query = 'SELECT * FROM users'
           result = await pool.query(query);
        }

        if(page && limit){
            limit = parseInt(limit);
            let offset= (parseInt(page)-1)* limit;

            const query = 'SELECT * FROM users LIMIT $1 OFFSET $2'
            result = await pool.query(query , [limit , offset]);
        }   
      
        if (result.rows) {
            res.json({
                message: "Fetched",
                status: true,
                users_counts: result.rows.length,
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

const registerSchema = Joi.object({
    email: Joi.string().min(6).required().email(),
    password: Joi.string().min(6).required(),

});

