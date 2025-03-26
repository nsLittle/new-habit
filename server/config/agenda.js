const Agenda = require("agenda");
const sendEmail = require("../services/mailer");
const { Habit } = require("../models/Habit");
require("dotenv").config();

const agenda = new Agenda({
  db: { address: process.env.MONGO_URI, collection: "jobs" },
  processEvery: "1 minute",
});

agenda.define("send reminder email", async (job) => {
  const { email, subject, message } = job.attrs.data;

  if (!email) {
    console.error("No email provided for reminder job");
    return;
  }

  try {
    await sendEmail(email, subject, message);
  } catch (error) {
    console.error("Failed to send reminder email:", error);
  }
});

const scheduleUserReminders = async () => {
  try {
    const habits = await Habit.find({
      "reminders.isReminderEnabled": true,
    }).populate("userId");

    for (const habit of habits) {
      const { cadence, cadenceLength, reminders, userId } = habit;
      const userEmail = habit.userId.email;

      if (!userEmail) {
        console.error(`No email found for user ${userId}`);
        continue;
      }

      const interval = getCadenceInterval(cadence, cadenceLength);

      await agenda.every(interval, "send reminder email", {
        email: userEmail,
        subject: "Reminder Alert",
        message: `Reminder for your habit: ${habit.habit}`,
      });
    }
  } catch (error) {
    console.error("Error scheduling reminders:", error);
  }
};

const getCadenceInterval = (cadence, cadenceLength) => {
  switch (cadence) {
    case "Weekly":
      return "7 days";
    case "Every Other Week":
      return "14 days";
    case "Monthly":
      return "30 days";
    case "Quarterly":
      return "90 days";
    default:
      return `${cadenceLength} days`;
  }
};

(async function () {
  await agenda.start();
  await scheduleUserReminders();
})();

module.exports = agenda;
