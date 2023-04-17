const express = require('express');
const app = express();
const dbConfig = require('./app/config/db.config')

const PORT = process.env.PORT || 3000;
const bodyParser = require('body-parser');
require('dotenv').config()
const auth = require('./app/middlewares/auth')


//  app.use("/tmp" , express.static("tmp"))
// app.use("/hairStyles" , express.static("hairStyles"))
// app.use("/admin_profile_images" , express.static("admin_profile_images"))

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



// app.use("/admin", require("./app/routes/Users/adminRouts"))
app.use("/user", require("./app/routes/Users/userRoute"))
app.use("/emailVerification", require("./app/routes/EmailVerification/EmailVerificationRoute"))
app.use("/terms_and_condtions" , require("./app/routes/Main/terms_and_conditionsRoute"))
app.use("/privacy_policy" , require("./app/routes/Main/privacy_policyRoute"))
app.use("/about_us" , require("./app/routes/Main/about_usRoute"))
app.use("/swipes" , require("./app/routes/Swipes/swipeRoute"))
app.use("/posts" , require("./app/routes/Main/postsRoute"))




 app.use(auth)
 app.use("/imageUpload", require("./app/routes/ImageUpload/imageUploadRoute"))




app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});


