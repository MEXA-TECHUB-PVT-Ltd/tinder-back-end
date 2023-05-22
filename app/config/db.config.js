const { Pool } = require('pg');
require('dotenv').config();
const fs = require('fs');
const path = require('path');


console.log(process.env.USER_NAME)

const pool = new Pool ({
    host: process.env.HOST, 
    port : process.env.DB_PORT,
    user : process.env.USER_NAME ,
    password : process.env.PASSWORD,
    database :  process.env.DATABASE,
    max : process.env.MAX
});


pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
  });
  
  
  pool.connect((err, client, release) => {
    if (err) {
      console.error('Error connecting to database:', err);
    } else {
      console.log('Connected to database successfully');
      console.log('Initializing tables ... ');

      
      release();
    }
  });

  const initSql = fs.readFileSync("app/model/init.sql").toString();

  pool.query(initSql , (err , result)=>{
    if(!err){
      console.log("All Database tables Initialilzed successfully : ")
    }
    else{
      console.log("Error Occurred While Initializing Database tables");
      console.log(err)
    }
  })
  
  module.exports = { pool };

  