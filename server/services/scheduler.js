const dotenv = require("dotenv");
const cron = require("node-cron");
const { connectDB, dbConnected } = require("../config/db");
const { sendEmail } = require("./emailService");
const { Feedback } = require("../models/Feedback");
const { Habit } = require("../models/Habit");
const User = require("../models/User");

dotenv.config();

// console.log("✅ Feedback email scheduler is loading...");

const runScheduler = async () => {
  if (!dbConnected) {
    // console.log(
    //   "🔄 Waiting for MongoDB connection before running scheduler..."
    // );
    await connectDB();
  }

  // console.log("🔄 Running scheduled feedback email check...");

  try {
    const habits = await Habit.find({ completed: false });
    // console.log(`👀 Found ${habits.length} active habits`);

    for (const habit of habits) {
      // console.log(`👀 Checking habit: ${habit.habit} (User: ${habit.userId})`);

      const user = await User.findById(habit.userId);
      // console.log("User: ", user);
      if (!user || !user.email) continue;
      // console.log(
      //   `👀  User: ${user.firstName} ${user.lastName}, Email: ${user.email}`
      // );

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const scheduleDates = getScheduleDates(habit.start_date, habit.cadence);
      for (const cadenceStart of scheduleDates) {
        let cadenceEnd = new Date(cadenceStart);
        cadenceEnd.setDate(cadenceEnd.getDate() + habit.cadenceLength);

        if (today.getTime() === cadenceStart.getTime()) {
          // console.log(`✅ Today matches cadence start date: ${cadenceStart}`);

          const existingRequest = await Feedback.findOne({
            habitId: habit._id,
            teamMemberId: user._id,
            cadenceStart,
            cadenceEnd,
          });

          if (existingRequest) {
            // console.log(`❌  Feedback request already exists, skipping email.`);
            continue;
          }

          // console.log(`✅ Sending feedback request email to ${user.email}`);
          const feedbackLink = `http://localhost:8081/feedback-request/${habit._id}`;
          await sendEmail(
            user.email,
            habit.habit,
            user.firstName,
            feedbackLink
          );

          await Feedback.create({
            habitId: habit._id,
            teamMemberId: user._id,
            habitStartDate: habit.start_date,
            cadenceStart,
            cadenceEnd,
            requestSentAt: new Date(),
            feedbackDate: new Date(),
            feedbackStatus: "pending",
          });

          console.log(`✅ Feedback request sent and logged.`);
        }
      }
    }
  } catch (error) {
    console.error("❌ Error in scheduler:", error);
  }
};

const getScheduleDates = (startDate, cadence) => {
  const cadenceMapping = {
    Weekly: 7,
    "Every Other Week": 14,
    Monthly: 30,
    Quarterly: 90,
  };
  const interval = cadenceMapping[cadence] || 30;

  let dates = [];
  let currentDate = new Date(startDate);

  for (let i = 0; i < 90 / interval; i++) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + interval);
  }

  return dates;
};

cron.schedule("0 9 * * *", async () => {
  await runScheduler();
});

// console.log("✅ Scheduler integrated into main app...");
module.exports = runScheduler;

// (async () => {
//   console.log("✅ Manually triggering scheduler for testing...");
//   await runScheduler();
// })();
