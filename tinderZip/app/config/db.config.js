const { Pool } = require('pg');
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const schedule = require('node-schedule');



console.log(process.env.USER_NAME)

const pool = new Pool({
  host: process.env.HOST,
  port: process.env.DB_PORT,
  user: process.env.USER_NAME,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
  max: process.env.MAX
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

pool.query(initSql, async (err, result) => {
  if (!err) {
    console.log("All Database tables Initialilzed successfully : ")
  }
  else {
    console.log("Error Occurred While Initializing Database tables");
    console.log(err)
  }

  if (!err) {
    try {
      const result = await getSchedules();
      let scheduledJobs = result

      if(scheduledJobs){
        scheduledJobs.forEach(async (scheduledJob) => {
          const { user_id, executeat } = scheduledJob;
          console.log(user_id+ "AND" + executeat);
          const executeAtTime = new Date(executeat);
  
          console.log(new Date(Date.now()))
  
          // Check if the scheduled time has passed
          if (executeAtTime <= new Date()) {
            console.log("inside")
            const deleteQuery = 'DELETE FROM schedules_tables WHERE user_id =$1 RETURNING*';
            const deleteResult = await pool.query(deleteQuery, [user_id]);
            if (deleteResult.rowCount > 0) {
              console.log("Previous scheduled taske deleted");
              console.log(`Cancelled job: ${user_id}`);
  
              const isupdateUser = await updateUser(user_id);
              if (isupdateUser) {
                console.log("User boosted profile set to false as time is over")
              }
            }
          }
          else {
            // Reschedule the job with the remaining duration
            const remainingDuration = executeAtTime - Date.now();
            const job = schedule.scheduleJob(new Date(Date.now() + remainingDuration), async function () {
              const query = 'UPDATE users SET profile_boosted = $1 WHERE user_id = $2 RETURNING *';
              const result = await pool.query(query, [false, user_id]);
              console.log('Profile boosting time is over');
            });
  
            let executeat = new Date(Date.now() + remainingDuration);
            let start_at = new Date(Date.now());
  
  
            const updateTask = await updateScheduleTask(user_id, start_at, executeat);
            if (updateTask) {
              console.log(`Rescheduled job: ${user_id} for ${remainingDuration} milliseconds later.`);
            }
          }
        });
      }
    }
    catch (err) {
      console.log(err)
    }
  }
})


async function updateUser(user_id) {
  try {
    const query = 'UPDATE users SET profile_boosted = $1 WHERE user_id = $2 RETURNING *';
    const result = await pool.query(query, [false, user_id]);
    console.log(result.rows)
    if (result.rows[0]) {
      console.log("Boosted Profile turned to false")
      return true
    }
    else {
      return false
    }
  }
  catch (err) {
    console.log("error Occurred while boosting turning false")
    return false
  }
}

async function getSchedules() {
  try {
    const query = 'SELECT * FROM schedules_tables';
    const result = await pool.query(query);
    console.log("All Schedules logs", result.rows)
    if (result.rows) {
      return result.rows
    }
    else {
      null
    }
  }
  catch (err) {
    console.log("error Occurred ")
    return null

  }
}

async function updateScheduleTask(user_id, start_at, executeat) {
  try {
    const rescheduleTaskQuery = 'UPDATE schedules_tables SET start_at = $1 , executeat = $2 WHERE user_id = $3 RETURNING*'
    const result = await pool.query(rescheduleTaskQuery, [start_at, executeat , user_id]);
    console.log(result.rows)
    if (result.rows[0]) {
      console.log("Task updated")
      return true
    }
    else {
      return false
    }
  }
  catch (err) {
    console.log("error Occurred ")
    console.log(err)
    return false

  }
}




module.exports = { pool };

