const express = require("express"),
router=express.Router();

const controller= require("../../controllers/Main/privacy_policy");

router.post("/add",controller.addPrivacyPolicy)


module.exports=router