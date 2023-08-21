
const {pool}  = require("../../config/db.config");

// CREATE A NEW POST 

exports.createPost = async (req,res)=>{
    try{

        // DESTRUCTURING DATA FROM REQUEST BODY
        const user_id = req.body.user_id ;
        const post_images = req.body.post_images;

        // CHECKING IF THE IMAGES WE ARE GETTING ARE GREATER THEN 9 THEN SENDING FALSE STATUS

        if(post_images.length > 9){
            return (res.json({
                message : "post images  cannot  be more thatn 9",
                status : false
            }))
        }
        
        // CHECKING IF WE ARE GETTING THE DATA FROM THE BODY

        if(!user_id || !post_images){
            return(
                res.json({
                message: "user _id and post_images must be provided",
                status : false
                })
            )
        }

        // SETTING UP QUERY TO POST THE DATA IN DATABASE

        const query = 'INSERT INTO posts (user_id , post_images) VALUES ($1 , $2) RETURNING*'

        // POSTING DATA INTO THE DATABASE USING ABOVE QUERY

        const result = await pool.query(query ,  [user_id , post_images])

        // CHECKING IF THE DATA IS SAVED THEN SENDING STATUS TRUE RESPONSE WITH RESULT

        if(result.rows[0]){
            res.json({
                message: "post created ",
                status : true,
                result : result.rows[0]
            })
        }

        // IF THE DATA IS NOT SAVED SENDING RESPONSE WITH STATUS FALSE

        else {
            res.json({message  : 'could not create posts' , status : false})
        }

    }
    catch(err){
        
        // EXCEPTION HANDLING

        res.json({
            message : "Error Occurrd ",
            status :false ,
            error :err.mesage
        })
    }
}

// GET ALL POSTS 

exports.getAllPosts = async(req,res)=>{
    try{
        // DESTRUCTURING DATA FROM REQUEST QUERY

        const user_id = req.query.user_id;
        
        // SETTING UP THE QUERY TO FETCH DATA FORM THE DATA BASE

        const query = 'SELECT * FROM posts WHERE user_id = $1'; 

        // FETCHING DATA FROM THE DATABASE

        const result = await pool.query(query  , [user_id]);

        // CHECKING IF THE DATA IS FETECHED THEN SENDING RESULTS AND STATUS TRUE IN RESPONSE

        if(result){
            res.json({
                message : "All posts fetched",
                status : true ,

            })
        }

        // IF THE DATA IS NOT FETCHED THEN SENDING STATUS FALSE RESPONSE
        
        else{
            res.json({
                message: "Could not fetch",
                status : false
            })
        }
    }
    catch(err){
        res.json({
            message : "Error Occurrd ",
            status :false ,
            error :err.mesage
        })
    }
}