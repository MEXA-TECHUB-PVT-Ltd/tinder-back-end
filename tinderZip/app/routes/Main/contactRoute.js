const express = require('express');

const router = express.Router();

const controller = require("../../controllers/Main/contactController")

router.post("/import" , controller.importContacts);
router.get("/getUserContacts" , controller.getImportedContactsByUser);
router.put("/blockContact" , controller.blockContact);
router.put("/unBlockContact" , controller.unblockContact);






module.exports = router;