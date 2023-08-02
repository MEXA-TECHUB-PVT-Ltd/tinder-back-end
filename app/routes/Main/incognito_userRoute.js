const express = require("express"),
router=express.Router();

const controller= require("../../controllers/Main/incognito_userController");

router.put("/changeIncognitoStatus",controller.changeIncognitoStatus);
router.get("/getIncognitoUsers",controller.getIncognitoUsers);
router.get("/get_non_incognito_user",controller.getNonIncognitoUsers)





module.exports=router