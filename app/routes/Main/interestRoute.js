const express = require('express');

const router = express.Router();
const controller = require("../../controllers/Main/interestController")

router.post("/addinterest" , controller.addinterest);
router.put("/updateinterest" , controller.updateinterest);
router.delete("/deleteinterest" , controller.deleteinterest);
router.get("/getAllinterests" , controller.getAllinterests);
router.get("/getinterestById" , controller.getinterestById);
router.get("/searchinterest" , controller.searchinterest);
router.get("/getInterestsByCategory" , controller.getInterestsBycategory_id);

// router.put("/deleteTemporarily" , controller.deleteTemporarily);
// router.put("/recover_record" , controller.recover_record);
// router.get("/getAllTrashRecords" , controller.getAllTrashRecords);

module.exports = router;