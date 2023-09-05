const express = require('express');

const router = express.Router();

const controller = require("../../controllers/Users/userController")

router.post("/register_with_email" , controller.registerWithEmail);
router.post("/register_with_ph" , controller.registerWithPh);
router.post("/login_with_email" , controller.login_with_email);
router.post("/login_with_ph" , controller.login_with_ph);
router.put("/updateProfile" , controller.updateProfile);
router.put("/updatePassword" , controller.updatePassword)
router.get("/getAllUsers"  , controller.getAllUsers)
router.get("/getAllUsersFiltered"  , controller.getAllUsersFiltered)
router.get("/usersByPreference"  , controller.usersByPreference)
router.get("/usersByCategory"  , controller.usersByCategory)
router.get("/usersByInterest"  , controller.usersByInterest)
router.get("/getAllSubscribedUsers"  , controller.getAllSubscribedUsers)
router.put("/updateSubscribedStatus" , controller.updateSubscribedStatus)
router.put("/updateActiveStatus" , controller.updateActiveStatus)
router.get("/view_profile"  , controller.viewProfile)
router.put("/updateBlockStatus"  , controller.updateBlockStatus)
router.delete("/deleteUser"  , controller.deleteUser)












module.exports = router;