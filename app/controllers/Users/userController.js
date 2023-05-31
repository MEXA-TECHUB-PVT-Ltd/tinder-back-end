
const {pool}  = require("../../config/db.config");

const Joi = require("joi");
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');


exports.registerWithPh= async (req, res, next) => {
    const client = await pool.connect();
    try {
        const phone_number = req.body.phone_number;
        const password = req.body.password;
       
        if(!phone_number || !password){
            return(
                res.json({
                    message: "phone number and pasword must be provided",
                    status : false
                })
            )
        }
        

        const found_ph_query = 'SELECT * FROM users WHERE phone_number = $1'
        const ph_no_Exists = await pool.query(found_ph_query , [phone_number])
        


        if (ph_no_Exists.rowCount>0) {
            return (
                res.status(400).json({
                    message: "user with this phone_number already exists",
                    status: false
                })
            )
        }


        const query = 'INSERT INTO users (phone_number , password , profile_boosted , login_type) VALUES ($1 , $2 , $3 , $4) RETURNING*'
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(req.body.password, salt);

        const result = await pool.query(query , [phone_number , hashPassword , false , 'phone_number']);
        console.log(result.rows[0])

        if(result.rows[0]){
            res.json({
                message: "User Has been registered with phone number successfully",
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

exports.registerWithEmail= async (req, res, next) => {
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


        const query = 'INSERT INTO users (email , password , profile_boosted , login_type) VALUES ($1 , $2 , $3 , $4) RETURNING*'
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(req.body.password, salt);


        const result = await pool.query(query , [email , hashPassword , false , 'email']);
        console.log(result.rows[0])

        if(result.rows[0]){
            res.json({
                message: "User Has been registered with email successfully",
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

exports.login_with_email = async (req, res) => {
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

exports.login_with_ph = async (req, res) => {
    try {
        const phone_number = req.body.phone_number;
        let password = req.body.password;

  
        if (!phone_number || !password) {
            return (
                res.status(400).json({
                    message: "phone_number and password must be provided",
                    status: false
                })
            )
        }

        const query = 'SELECT * FROM users WHERE phone_number = $1';
        const foundResult = await pool.query(query  , [phone_number]);

        console.log(foundResult)

        if (foundResult.rowCount == 0) {
            return (
                res.status(400).json({
                    message: "Wrong phone_number or password",
                    status: false
                })
            )
        }

        const vaildPass = await bcrypt.compare(password, foundResult.rows[0].password);

        if (!vaildPass) {
            return (
                res.status(401).json({
                    message: "Wrong phone_number or password",
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

        const name= req.body.name;
        const email = req.body.email ;
        const phone_number = req.body.phone_number ;
        const password = req.body.password ;
        const dob = req.body.dob;
        const relation_type = req.body.relation_type;
        const school = req.body.school;
        const interest = req.body.interest ;
        const job_title = req.body.job_title;
        const company = req.body.company;
        const category_id = req.body.category_id;
        const active_status = req.body.active_status ;
        const gender = req.body.gender ;
        const images = req.body.images;
        const preference = req.body.preference;
        const insta_id = req.body.insta_id;
        const spotify_id = req.body.spotify_id;

        let longitude = req.body.longitude;
        let latitude = req.body.latitude;



        if(images.length >6 || images.length < 2){
            return(
                res.json({
                    message: "Images can not be greater than 6 or less than 2 ",
                    status : false,
                })
            )
        }


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


    let query = 'UPDATE users SET ';
    let index = 2;
    let values =[user_id];

    if(name){
        query+= `name = $${index} , `;
        values.push(name)
        index ++
    }
    if(email){
        query+= `email = $${index} , `;
        values.push(email)
        index ++
    }
    if(phone_number){
        query+= `phone_number = $${index} , `;
        values.push(phone_number)
        index ++
    }


    if(password){
        query+= `password = $${index} , `;
        values.push(password)
        index ++
    }
    if(dob){
        query+= `dob = $${index} , `;
        values.push(dob)
        index ++
    }

    if(relation_type){
        query+= `relation_type = $${index} , `;
        values.push(relation_type)
        index ++
    }

    if(school){
        query+= `school = $${index} , `;
        values.push(school)
        index ++
    }


    if(interest){
        query+= `interest = $${index} , `;
        values.push(interest)
        index ++
    }


    if(job_title){
        query+= `job_title = $${index} , `;
        values.push(job_title)
        index ++
    }

    if(company){
        query+= `company = $${index} , `;
        values.push(company)
        index ++
    }

    if(category_id){
        query+= `category_id = $${index} , `;
        values.push(category_id)
        index ++
    }

    if(active_status){
        query+= `active_status = $${index} , `;
        values.push(active_status)
        index ++
    }


    if(gender){
        query+= `gender = $${index} , `;
        values.push(gender)
        index ++
    }

    if(images){
        query+= `images = $${index} , `;
        values.push(images)
        index ++
    }
    if(preference){
        query+= `preference = $${index} , `;
        values.push(preference)
        index ++
    }
    if(insta_id){
        query+= `insta_id = $${index} , `;
        values.push(insta_id)
        index ++
    }
    if(spotify_id){
        query+= `spotify_id = $${index} , `;
        values.push(spotify_id)
        index ++
    }

    if(longitude){
        query+= `longitude = $${index} , `;
        values.push(longitude)
        index ++
    }

    if(latitude){
        query+= `latitude = $${index} , `;
        values.push(latitude)
        index ++
    }


    query += 'WHERE user_id = $1 RETURNING*'
    query = query.replace(/,\s+WHERE/g, " WHERE");
    console.log(query);

      

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
        const phone_number = req.body.phone_number;
        const password = req.body.password;

        if(email && phone_number){
            return(res.json({
                message : "only one can be provided email or phone_number",
                status :false
            }))
        }

        if(email){
            const foundQuery = 'SELECT * FROM users WHERE email = $1 and login_type = $2';
            const foundResult = await pool.query(foundQuery , [email , 'email']);

        if(foundResult.rows[0]){
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
        }
        if(phone_number){
            const foundQuery = 'SELECT * FROM users WHERE phone_number = $1 and login_type = $2';
            const foundResult = await pool.query(foundQuery , [email , 'phone_number']);


            if(foundResult.rows[0]){
                const query = 'UPDATE users SET password = $1 WHERE phone_number = $2 RETURNING*';
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

exports.usersByPreference = async(req,res)=>{
    try{
        const preference_id = req.query.preference_id;
        if(!preference_id){
            return(res.json({message : "Please provide preference_id" , status : false}))
         }
         let limit = req.query.limit;
         let page = req.query.page
 
         let result;
 
         if (!page || !limit) {
             const query = 'SELECT * FROM users WHERE preference = $1'
            result = await pool.query(query , [preference_id]);
         }
 
         if(page && limit){
             limit = parseInt(limit);
             let offset= (parseInt(page)-1)* limit;
 
             const query = 'SELECT * FROM users WHERE preference = $3 LIMIT $1 OFFSET $2'
             result = await pool.query(query , [limit , offset , preference_id]);
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
        console.log(err)
        res.json({
            message: "Error Occurred",
            status: false,
            error: err.message
        })
    }
}

exports.usersByCategory = async(req,res)=>{
    try{
        const category_id = req.query.category_id;
        if(!category_id){
            return(res.json({message : "Please provide category_id" , status : false}))
         }

         let limit = req.query.limit;
         let page = req.query.page
 
         let result;
 
         if (!page || !limit) {
             const query = 'SELECT * FROM users WHERE category_id = $1'
            result = await pool.query(query , [category_id]);
         }
 
         if(page && limit){
             limit = parseInt(limit);
             let offset= (parseInt(page)-1)* limit;
 
             const query = 'SELECT * FROM users WHERE category_id = $3 LIMIT $1 OFFSET $2'
             result = await pool.query(query , [limit , offset , category_id]);
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
        console.log(err)
        res.json({
            message: "Error Occurred",
            status: false,
            error: err.message
        })
    }
}

exports.usersByInterest = async(req,res)=>{
    try{
        const interest = req.query.interest;
        if(!interest){
            return(res.json({message : "Please provide interest" , status : false}))
         }

         let limit = req.query.limit;
         let page = req.query.page
 
         let result;
 
         if (!page || !limit) {
             const query = 'SELECT * FROM users WHERE interest = $1'
            result = await pool.query(query , [interest]);
         }
 
         if(page && limit){
             limit = parseInt(limit);
             let offset= (parseInt(page)-1)* limit;
 
             const query = 'SELECT * FROM users WHERE interest = $3 LIMIT $1 OFFSET $2'
             result = await pool.query(query , [limit , offset , interest]);
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
        console.log(err)
        res.json({
            message: "Error Occurred",
            status: false,
            error: err.message
        })
    }
}

exports.getAllSubscribedUsers = async(req,res)=>{
    try{
   
         let limit = req.query.limit;
         let page = req.query.page
 
         let result;
 
         if (!page || !limit) {
             const query = 'SELECT * FROM users WHERE subscribed_status = $1'
            result = await pool.query(query , [true]);
         }
 
         if(page && limit){
             limit = parseInt(limit);
             let offset= (parseInt(page)-1)* limit;
 
             const query = 'SELECT * FROM users WHERE subscribed_status = $3 LIMIT $1 OFFSET $2'
             result = await pool.query(query , [limit , offset , true]);
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
        console.log(err)
        res.json({
            message: "Error Occurred",
            status: false,
            error: err.message
        })
    }
}

exports.updateSubscribedStatus = async(req,res)=>{
    try{
        const user_id = req.query.user_id;
        const subscribed_status = req.query.subscribed_status;
   if(!user_id || !subscribed_status){
    return(
        res.json({
            message: "user id , subscribed_status must be provided",
            status : false
        })
    )
   }
        const query= 'UPDATE users SET subscribed_status = $1 WHERE user_id = $2 RETURNING*'
        const result = await pool.query(query , [subscribed_status,user_id])
         if (result.rows[0]) {
             res.json({
                 message: "Updated",
                 status: true,
                 result: result.rows[0]
             })
         }
         else {
             res.json({
                 message: "could not updated",
                 status: false
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


const registerSchema = Joi.object({
    email: Joi.string().min(6).required().email(),
    password: Joi.string().min(6).required(),

});

