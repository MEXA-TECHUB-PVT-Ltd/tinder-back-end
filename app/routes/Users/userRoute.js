const express = require('express');

const router = express.Router();

const controller = require("../../controllers/Users/userController")

router.post("/register_user" , controller.registerUser);
router.post("/login" , controller.login);
router.put("/updateProfile" , controller.updateProfile);
router.put("/updatePassword" , controller.updatePassword)



module.exports = router;