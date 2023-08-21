const express = require('express');

const router = express.Router();
const controller = require("../../controllers/Main/notificationController")

router.post("/sendNotification" , controller.sendNotification);
 router.put("/readNotification" , controller.readNotification);
// router.delete("/deleteinterest" , controller.deleteinterest);
 router.get("/getUserNotifications" , controller.getUserNotifications);
// router.get("/getinterestById" , controller.getinterestById);
// router.get("/searchinterest" , controller.searchinterest);


module.exports = router;