
const fs = require('fs');
let jobFile = '../../scheduled-jobs.json'; // Path to the JSON file
const schedule = require('node-schedule');


// Function to load scheduled jobs from the JSON file
 async function loadScheduledJobs() {
  try {
    const data =  fs.readFileSync(jobFile , 'utf8');
    const jobs = JSON.parse(data);
    console.log(jobs);
    return(jobs)
  } catch (error) {
    console.error('Error loading scheduled jobs:', error);
    return [];
  }
}

// Function to save scheduled jobs to the JSON file
 function saveScheduledJobs(jobs) {
  try {
    const jobsData = JSON.stringify(jobs);
     fs.writeFileSync(jobFile, jobsData, 'utf8');
  } catch (error) {
    console.error('Error saving scheduled jobs:', error);
  }
}


 async function reschedule(){
  try {
    const data = await loadScheduledJobs();
    console.log(data);

    // Rest of your code for rescheduling and saving jobs goes here...
  } catch (error) {
    console.error('Error occurred during rescheduling:', error);
  }

    //  let scheduledJobs =  loadScheduledJobs();
//   // Iterate over the scheduled jobs
//   scheduledJobs.forEach((scheduledJob) => {
//     const { user_id, executeAt } = scheduledJob;
//     const executeAtTime = new Date(executeAt);
//     console.log(user_id, executeAt)

//     // Check if the scheduled time has passed
//     if (executeAtTime <= new Date()) {
//         console.log("cancel the job")
//       // Cancel the job and remove it from the JSON file
//       //call update api here , 
//       scheduledJobs = scheduledJobs.filter((job) => job.user_id !== user_id);
//     } else {
//       // Reschedule the job with the remaining duration
//       console.log("in else")
//       const remainingDuration = executeAtTime - Date.now();
//       schedule.rescheduleJob(id, new Date(Date.now() + remainingDuration));
//       console.log(`Rescheduled job: ${id} for ${remainingDuration} milliseconds later.`);

//       scheduledJobs = scheduledJobs.map((job) => {
//         if (job.user_id === user_id) {
//           return { user_id: job.user_id, executeAt: new Date(Date.now() + remainingDuration).toISOString() };
//         }
//         return job;
//       });
//     }
//   });

//   // Save the updated scheduled jobs to the JSON file
//   console.log(scheduledJobs)
//   saveScheduledJobs(scheduledJobs);
}


module.exports = reschedule