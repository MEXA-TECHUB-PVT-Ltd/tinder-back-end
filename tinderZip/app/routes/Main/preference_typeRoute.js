const express = require('express');

const router = express.Router();
const controller = require("../../controllers/Main/preference_typeController")

router.post("/addPreferenceType" , controller.addpreference_type);
router.put("/updatePreferenceType" , controller.updatepreference_type);
router.delete("/deletePreferenceType" , controller.deletepreference_type);
router.get("/getAllPreferenceType" , controller.getAllpreference_types);
router.get("/getPreferenceType" , controller.getpreference_typeById);


// router.put("/deleteTemporarily" , controller.deleteTemporarily);
// router.put("/recover_record" , controller.recover_record);
// router.get("/getAllTrashRecords" , controller.getAllTrashRecords);

module.exports = router;