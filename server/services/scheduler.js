const cron = require("node-cron");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const { sendEmail } = require("../services/emailService");
const { Habit } = require("../models/Habit");
const { Feedback } = require("../models/Feedback");
const User = require("../models/User");

dotenv.config();

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/new-habit";

console.log("⏳ Feedback email scheduler is loading...");

// ✅ Ensure MongoDB is connected before running the scheduler
const connectToDB = async () => {
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log("✅ MongoDB connected for scheduler");
    } else {
      console.log("🔄 MongoDB already connected");
    }
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
    process.exit(1); // Prevent scheduler from running without DB connection
  }
};

// **Run the scheduler job**
const runScheduler = async () => {
  await connectToDB(); // Ensure DB is connected before executing

  console.log("🔄 Running scheduled feedback email check...");

  try {
    const habits = await Habit.find({ completed: false });
    console.log(`📋 Found ${habits.length} active habits`);

    for (const habit of habits) {
      console.log(`🟡 Checking habit: ${habit.habit} (User: ${habit.userId})`);

      const user = await User.findById(habit.userId);
      if (!user) {
        console.log(`⚠️ No user found for habit ${habit.habit}, skipping.`);
        continue;
      }

      console.log(
        `👤 User found: ${user.firstName} ${user.lastName}, Email: ${user.email}`
      );

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const scheduleDates = getScheduleDates(habit.start_date, habit.cadence);
      for (const cadenceStart of scheduleDates) {
        let cadenceEnd = new Date(cadenceStart);
        cadenceEnd.setDate(cadenceEnd.getDate() + habit.cadenceLength);

        if (today.getTime() === cadenceStart.getTime()) {
          console.log(`✅ Today matches cadence start date: ${cadenceStart}`);

          const existingRequest = await Feedback.findOne({
            habitId: habit._id,
            teamMemberId: user._id,
            cadenceStart,
            cadenceEnd,
          });

          if (existingRequest) {
            console.log(`🚫 Feedback request already exists, skipping email.`);
            continue;
          }

          console.log(`📧 Sending feedback request email to ${user.email}`);
          const feedbackLink = `https://your-app.com/feedback-request/${habit._id}`;
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

// Function to calculate feedback request dates based on habit cadence
const getScheduleDates = (startDate, cadence) => {
  const cadenceMapping = {
    Weekly: 7,
    "Every Other Week": 14,
    Monthly: 30,
    Quarterly: 90,
  };
  const interval = cadenceMapping[cadence] || 30; // Default to 30 days

  let dates = [];
  let currentDate = new Date(startDate);

  for (let i = 0; i < 90 / interval; i++) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + interval);
  }

  return dates;
};

// **Run scheduler every day at 9 AM**
cron.schedule("0 9 * * *", async () => {
  await runScheduler();
});

console.log("✅ Scheduler is now integrated into the main app.");
module.exports = runScheduler; // Export function for controlled execution

(async () => {
  console.log("🚀 Manually triggering scheduler for testing...");
  await runScheduler();
})();
