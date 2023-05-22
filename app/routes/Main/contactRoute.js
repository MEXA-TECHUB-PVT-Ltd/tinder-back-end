const express = require('express');

const router = express.Router();

const controller = require("../../controllers/Main/contactController")

router.post("/import" , controller.importContacts);




module.exports = router;