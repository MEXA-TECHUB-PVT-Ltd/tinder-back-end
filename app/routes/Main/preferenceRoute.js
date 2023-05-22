const express = require('express');

const router = express.Router();
const controller = require("../../controllers/Main/preferencesController")

router.post("/addPreference" , controller.addpreference);
router.put("/updatePreference" , controller.updatepreference);
router.delete("/deletePreference" , controller.deletepreference);
router.get("/getAllPreferences" , controller.getAllpreferences);
router.get("/getPreference" , controller.getpreferenceById);

// router.put("/deleteTemporarily" , controller.deleteTemporarily);
// router.put("/recover_record" , controller.recover_record);
// router.get("/getAllTrashRecords" , controller.getAllTrashRecords);

module.exports = router;