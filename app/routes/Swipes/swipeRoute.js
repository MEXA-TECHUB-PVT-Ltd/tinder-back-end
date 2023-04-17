const express = require('express');

const router = express.Router();

const controller = require("../../controllers/Swipes/swiipeController")

router.get("/viewCards" , controller.viewCards);
router.post("/swipe" , controller.swipe);
router.get("/getAllMatches" , controller.getAllMatches);




module.exports = router;