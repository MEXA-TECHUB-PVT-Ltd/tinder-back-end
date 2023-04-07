const express = require("express"),
router=express.Router();

const controller= require("../../controllers/Main/about_us");

router.post("/add",controller.add_aboutus)


module.exports=router