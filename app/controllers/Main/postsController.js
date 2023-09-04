
const {pool}  = require("../../config/db.config");


exports.createPost = async (req,res)=>{
    try{
        const user_id = req.body.user_id ;
        const post_images = req.body.post_images;

        if(post_images.length > 9){
            return (res.json({
                message : "post images  cannot  be more thatn 9",
                status : false
            }))
        }
        
        if(!user_id || !post_images){
            return(
                res.json({
                message: "user _id and post_images must be provided",
                status : false
                })
            )
        }

        const query = 'INSERT INTO posts (user_id , post_images) VALUES ($1 , $2) RETURNING*'
        const result = await pool.query(query ,  [user_id , post_images])
        if(result.rows[0]){
            res.json({
                message: "post created ",
                status : true,
                result : result.rows[0]
            })
        }
        else {
            res.json({message  : 'could not create posts' , status : false})
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
exports.getAllPosts = async(req,res)=>{
    try{
        const user_id = req.query.user_id;
        
        const query = 'SELECT * FROM posts WHERE user_id = $1'; 
        const result = await pool.query(query  , [user_id]);

        if(result){
            res.json({
                message : "All posts fetched",
                status : true ,

            })
        }
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