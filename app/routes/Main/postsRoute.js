const express = require("express"),
router=express.Router();

const controller= require("../../controllers/Main/postsController");

router.post("/create",controller.createPost)
router.post("/getAllPosts",controller.getAllPosts)




module.exports=router