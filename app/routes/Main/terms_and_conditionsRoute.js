const express = require("express"),
router=express.Router();

const controller= require("../../controllers/Main/terms_and_conditions");

router.post("/add",controller.addTermsAndConditions)


module.exports=router