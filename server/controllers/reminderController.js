const agenda = require("../config/agenda");
const { Habit } = require("../models/Habit");
const { User } = require("../models/User");

exports.scheduleReminder = async (req, res) => {
  try {
    const { userId, habitId } = req.body;

    // Fetch habit and user email dynamically
    const habit = await Habit.findById(habitId).populate("userId", "email");

    if (!habit || !habit.reminders.isReminderEnabled) {
      return res
        .status(404)
        .json({ error: "Habit not found or reminders disabled" });
    }

    if (!habit.userId.email) {
      return res.status(400).json({ error: "User email not found" });
    }

    const email = habit.userId.email;
    const subject = "Habit Reminder";
    const message = `Reminder for your habit: ${habit.habit}`;
    const interval = getCadenceInterval(habit.cadence, habit.cadenceLength);

    await agenda.every(interval, "send reminder email", {
      email,
      subject,
      message,
    });

    res
      .status(200)
      .json({ message: `Reminder scheduled for ${email} every ${interval}` });
  } catch (error) {
    console.error("Error scheduling reminder:", error);
    res.status(500).json({ error: "Failed to schedule reminder" });
  }
};
