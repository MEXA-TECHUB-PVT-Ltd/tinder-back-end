const express = require('express');

const router = express.Router();
const controller = require("../../controllers/Main/schoolController")

router.post("/addSchool" , controller.addSchool);
router.put("/updateSchool" , controller.updateSchool);
router.delete("/deleteSchool" , controller.deleteSchool);
router.get("/getAllSchools" , controller.getAllSchools);
router.get("/getSchoolById" , controller.getSchoolById);
router.get("/searchSchool" , controller.searchSchool);


// router.put("/deleteTemporarily" , controller.deleteTemporarily);
// router.put("/recover_record" , controller.recover_record);
// router.get("/getAllTrashRecords" , controller.getAllTrashRecords);

module.exports = router;