const express = require('express');

const router = express.Router();

const controller = require("../../controllers/Swipes/swiipeController")

router.get("/viewCards" , controller.viewCards);
router.post("/swipe" , controller.swipe);
router.get("/getAllMatches" , controller.getAllMatches);
router.post("/rewindSwipe" , controller.rewindSwipe);
router.get("/getAllSuperLikes" , controller.getAllSuperLikes);
router.put("/boostProfile" , controller.boost);
router.get("/getAllBoostedProfiles" , controller.getAllBoostedProfiles);
router.get("/getRightSwipesOfUser" , controller.getRightSwipesOfUser);
router.get("/getLeftSwipesOfUser" , controller.getLeftSwipesOfUser);
router.get("/getAllSuperLikedUsers" , controller.getAllSuperLikedUsers);
router.get("/getAllUserWhoLikedYou" , controller.getAllUserWhoLikedYou);
router.get("/getAllPlatformMatchesCount" , controller.getAllPlatformMatchesCount);






module.exports = router;