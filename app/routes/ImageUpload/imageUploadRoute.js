const  express = require('express');

const router = express.Router();
const controller = require("../../controllers/ImageUpload/imageUpload")

router.post('/upload' ,auth ,controller.uploadImage);

module.exports= router