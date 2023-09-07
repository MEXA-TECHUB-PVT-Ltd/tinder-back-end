const express = require('express');
const app = express();
const {pool} = require('./app/config/db.config');
const fs = require('fs');

const schedule = require('node-schedule');


const PORT = process.env.PORT || 3001;
const bodyParser = require('body-parser');
require('dotenv').config()
const auth = require('./app/middlewares/auth')


//  app.use("/tmp" , express.static("tmp"))
// app.use("/hairStyles" , express.static("hairStyles"))
 app.use("/user_profile_images" , express.static("user_profile_images"))
const cors = require("cors");

app.use(cors({
  methods: ['GET', 'POST', 'DELETE', 'UPDATE', 'PUT', 'PATCH']
}));


// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.json())

app.use(cors({
  methods: ['GET', 'POST', 'DELETE', 'UPDATE', 'PUT', 'PATCH']
}));

app.get("/" , (req,res)=>{
  res.json("Server is running this is Home Route(/)")
})


 app.use("/admin", require("./app/routes/Users/adminRoutes"))
app.use("/user", require("./app/routes/Users/userRoute"))
app.use("/emailVerification", require("./app/routes/EmailVerification/EmailVerificationRoute"))
app.use("/terms_and_condtions" , require("./app/routes/Main/terms_and_conditionsRoute"))
app.use("/privacy_policy" , require("./app/routes/Main/privacy_policyRoute"))
app.use("/about_us" , require("./app/routes/Main/about_usRoute"))
app.use("/swipes" , require("./app/routes/Swipes/swipeRoute"))
app.use("/posts" , require("./app/routes/Main/postsRoute"))
app.use('/messages', require("./app/routes/Chat/messageRoute"));
app.use('/chat_rooms', require("./app/routes/Chat/chatRoute"));
app.use('/school', require("./app/routes/Main/schoolRoute"));
app.use('/relation_type', require("./app/routes/Main/relation_typeRoute"));
app.use('/category', require("./app/routes/Main/categoryRoute"));
app.use('/interest', require("./app/routes/Main/interestRoute"));
app.use('/preference_type', require("./app/routes/Main/preference_typeRoute"));
app.use('/preference', require("./app/routes/Main/preferenceRoute"));
app.use('/reports', require("./app/routes/Main/report_user_route"));
app.use('/contacts', require("./app/routes/Main/contactRoute"));
app.use('/notification', require("./app/routes/Main/notificationsRoute"));
app.use('/search', require("./app/routes/Main/search_filterRoute"));
app.use('/incognito', require("./app/routes/Main/incognito_userRoute"));




//  app.use(auth)
 app.use("/imageUpload", require("./app/routes/ImageUpload/imageUploadRoute"))


const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
const io = require("socket.io")(server, {
  cors: {
      origin: "*"
  },
});
let activeUsers = [];
io.on("connection" , (socket)=>{
   // add new User
   socket.on("new-user-add", (newUserId) => {
    // if user is not added previously
    if (!activeUsers.some((user) => user.userId === newUserId)) {
        activeUsers.push({ userId: newUserId, socketId: socket.id });
        console.log("New User Connected", activeUsers);

    }
    // send all active users to new user
    io.emit("get-users", activeUsers);
});

socket.on("disconnect", () => {
  // remove user from active users
  activeUsers = activeUsers.filter((user) => user.socketId !== socket.id);
  console.log("User Disconnected", activeUsers);
  // send all active users to all users
  io.emit("get-users", activeUsers);
});


socket.on("message", async (data) => {
  console.log(data)
  let media_type = data.media_type;
  let message_type = data.message_type;
  let message = data.message;
  let sender_id = data.sender_id;
  let receiver_id = data.receiver_id;
  let reply_on_message_id = null;

  if (message_type == 'reply') {
      reply_on_message_id = data.reply_on_message_id;
  }
  console.log(sender_id , receiver_id)

  const user = activeUsers.find((user) => user.userId == receiver_id);
  const chatRoomId = await getChatRoom_id(sender_id, receiver_id);
  console.log(chatRoomId);
  let messageStored = await storeMessage(sender_id, receiver_id, message_type, media_type, chatRoomId, message, reply_on_message_id);
  if (user) {
      console.log(user.socketId)
      io.to(user.socketId).emit("receive-message", messageStored);
  }
  else {
      console.log('no user')
  }

});

socket.on('typing', ({ chatRoomId, userId, receiverId }) => {
  const user = activeUsers.find((user) => user.userId == receiverId);
  if(user){
    socket.to(receiverId).emit('userTyping', { userId , chatRoomId });

  }
});

socket.on('stopTyping', ({ chatRoomId, userId, receiverId }) => {
  const user = activeUsers.find((user) => user.userId == receiverId);
  if(user){
    socket.to(receiverId).emit('userStoppedTyping', { userId , chatRoomId});

  }
});


socket.on('receipts' , async (data) => {
  let result;
  const {message_ids , receipt_type , sender_id , receiver_id}= data
  const user = activeUsers.find((user) => user.userId === sender_id);  // sending to sender of the messages
  if(receipt_type == 'delivered'){
      if (user) {
          console.log(user.socketId)
          io.to(user.socketId).emit("receive-receipts", {
              message_ids:message_ids ,
              delivered:true,
          });
      }
      else {
          console.log('no user')
      }

      let query = 'UPDATE messages SET delivered=$1 WHERE message_id = ALL($2) RETURNING*'
       result = await pool.query(query , [true , message_ids])
       console.log(result.rows)
  }
  else if(receipt_type == 'read'){
      if (user) {
          console.log(user.socketId)
          io.to(user.socketId).emit("receive-receipts", {
              message_ids:message_ids ,
              read:true,
          });
      }
      else {
          console.log('no user')
      }
      let query = 'UPDATE messages SET read=$1 WHERE message_id = ALL($2) RETURNING*'
      result = await pool.query(query , [true , message_ids])
      console.log(result.rows)

  }

})




//audio calling 

socket.on("join room", roomID => {
  if (rooms[roomID]) {
      rooms[roomID].push(socket.id);
  } else {
      rooms[roomID] = [socket.id];
  }
  const otherUser = rooms[roomID].find(id => id !== socket.id);
  if (otherUser) {
      socket.emit("other user", otherUser);
      socket.to(otherUser).emit("user joined", socket.id);
  }
});

socket.on("offer", payload => {
  io.to(payload.target).emit("offer", payload);
});

socket.on("answer", payload => {
  io.to(payload.target).emit("answer", payload);
});

socket.on("ice-candidate", incoming => {
  io.to(incoming.target).emit("ice-candidate", incoming.candidate);
});


})



async function updateUser(user_id){
  try{
    const query = 'UPDATE users SET profile_boosted = $1 WHERE user_id = $2 RETURNING *';
       const result = await pool.query(query, [false, user_id]);
       console.log(result.rows)
       if(result.rows[0]){
        console.log("Boosted Profile turned to false")
       }
  }
  catch(err){
    console.log("error Occurred while boosting turning false")
  }
}

async function getSchedules(user_id){
  try{
    const query = 'SELECT * FROM schedules_tables';
       const result = await pool.query(query);
       console.log(result.rows)
       if(result.rows){
        return result.rows
       }
       else{
        null
       }
  }
  catch(err){
    console.log("error Occurred ")
    return null

  }
}






async function getChatRoom_id(sender_id, receiver_id) {
  try {
      let chat_room_id;

      const query = `SELECT * FROM chatRoom
      WHERE 
          (user_1_id = $1 OR user_1_id = $2)
          AND
          (user_2_id = $1 OR user_2_id = $2)
      LIMIT 1;`

      const foundChatRoom = await pool.query(query , [sender_id , receiver_id]);



      if (foundChatRoom.rowCount>0) {
          chat_room_id = foundChatRoom.rows[0].chat_room_id
          console.log('found chat room :' + foundChatRoom.rows[0])

      }
      else {

        const query = `INSERT INTO chatRoom (user_1_id , user_2_id) VALUES ($1 , $2) RETURNING*`;
        const result = await pool.query(query , [sender_id , receiver_id]);
          if (result.rowCount>0) {
              chat_room_id = result.rows[0].chat_room_id;
          }
          else {
              console.log('could not able to create chat room')
          }


      }

      console.log('this is chat_room_id' + chat_room_id)

      if (chat_room_id) {
          return (chat_room_id)
      } else { return null }
  }
  catch (err) {
      console.log("error occurred while getting chat room id");
      console.log(err)
      return null
  }
}


async function storeMessage(sender_id, receiver_id, message_type, media_type, chat_room_id, message, reply_on_message_id) {

  try {
      const query = `INSERT INTO messages ( media_type, message_type, sender_id, receiver_id, chat_room_id, message, reply_on_message_id )
      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING*;
      `
      const values =[media_type, message_type, sender_id, receiver_id, chat_room_id, message, reply_on_message_id]
      let result = await pool.query(query , values)
      if (result.rowCount>0) {
          console.log("Your Message Saved")
          return result.rows[0];
      }
      else {
          console.log('could not save message')
          return null;
      }
  }
  catch (err) {
      console.log(err)
  }
}
