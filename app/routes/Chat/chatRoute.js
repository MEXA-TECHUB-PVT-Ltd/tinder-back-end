
const  express = require('express');

const router = express.Router();
const controller = require("../../controllers/Chat/chatController")


router.get('/getChatRoomsOfUser' , controller.getChatRoomsOfUser);
// router.put('/deleteChatRoom' , controller.deleteChatRoom);
// router.post('/pin_chatRoom' , controller.pin_chatRoom);
// router.post('/Unpin_chatRoom' , controller.Unpin_chatRoom);
// router.post('/archive_Chat_room' , controller.archive_Chat_room);
// router.post('/un_archive_Chat_room' , controller.un_archive_Chat_room);
// router.get('/getArchiveChatsOfUser' , controller.getArchiveChatsOfUser);
// router.put('/blockChatRoom' , controller.blockChatRoom);
// router.put('/unblockChatRoom' , controller.unblockChatRoom);
// router.put('/deleteChatRoom_inBulk' , controller.deleteChatRoom_inBulk);


module.exports= router