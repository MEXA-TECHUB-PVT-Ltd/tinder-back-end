const express = require("express"),
router=express.Router();

const controller= require("../../controllers/Main/report_userController");

router.post("/reportUser",controller.reportUser)
router.get("/getReportedUsers",controller.getReportedUsers)
router.get("/get_a_reported_user",controller.get_a_reported_user)





module.exports=router