const express = require('express');

const router = express.Router();
const controller = require("../../controllers/Main/categoryController")

router.post("/addCategory" , controller.addCategory);
router.put("/updateCategory" , controller.updateCategory);
router.delete("/deleteCategory" , controller.deleteCategory);
router.get("/getAllCategories" , controller.getAllCategories);
router.get("/getCategoryById" , controller.getCategoryById);
router.get("/searchCategory" , controller.searchCategory);


// router.put("/deleteTemporarily" , controller.deleteTemporarily);
// router.put("/recover_record" , controller.recover_record);
// router.get("/getAllTrashRecords" , controller.getAllTrashRecords);

module.exports = router;