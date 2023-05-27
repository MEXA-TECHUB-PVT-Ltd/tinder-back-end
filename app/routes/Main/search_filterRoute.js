const express = require('express');

const router = express.Router();
const controller = require("../../controllers/Main/search_filterController")

router.get("/searchByGender" , controller.searchByGender);
//  router.put("/readNotification" , controller.readNotification);
// // router.delete("/deleteinterest" , controller.deleteinterest);
//  router.get("/getUserNotifications" , controller.getUserNotifications);
// router.get("/getinterestById" , controller.getinterestById);
// router.get("/searchinterest" , controller.searchinterest);


module.exports = router;