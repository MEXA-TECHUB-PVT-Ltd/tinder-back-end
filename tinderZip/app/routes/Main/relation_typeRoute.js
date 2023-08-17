const express = require('express');

const router = express.Router();
const controller = require("../../controllers/Main/relationTypeController")

router.post("/addRelation_type" , controller.addRelation_type);
router.put("/updateRelation_type" , controller.updateRelation_type);
router.delete("/deleteRelation_type" , controller.deleteRelation_type);
router.get("/getAllrelation_types" , controller.getAllrelation_types);
router.get("/getRelation_typeById" , controller.getRelation_typeById);
router.get("/searchrelation_type" , controller.searchrelation_type);
// router.put("/deleteTemporarily" , controller.deleteTemporarily);
// router.put("/recover_record" , controller.recover_record);
// router.get("/getAllTrashRecords" , controller.getAllTrashRecords);

module.exports = router;