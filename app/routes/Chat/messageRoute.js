
const  express = require('express');

const router = express.Router();
const controller = require("../../controllers/Chat/messageController")


router.get('/getMessages_for_currentUser' , controller.getMessages);
router.put('/deleteMessage' , controller.deleteMessage);


module.exports= router