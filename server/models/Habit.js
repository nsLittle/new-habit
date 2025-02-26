const mongoose = require("mongoose");

const HabitSchema = new mongoose.Schema(
  {
    habit: { type: String, required: true },
    description: { type: String, required: false },
    reminders: {
      isReminderEnabled: { type: Boolean, default: false },
      isEmailReminderEnabled: { type: Boolean, default: false },
      isTextReminderEnabled: { type: Boolean, default: false },
      selectedDays: { type: [String], default: [] }, // Stores days like ["M", "W", "F"]
      selectedTime: {
        hour: { type: Number, default: 0 },
        minute: { type: Number, default: 0 },
        second: { type: Number, default: 0 },
      },
    },
    cadence: {
      type: String,
      enum: ["Weekly", "Every Other Week", "Monthly", "Quarterly", null],
      default: null,
    },
    cadenceLength: { type: Number, required: true, default: 7 },
    completed: { type: Boolean, default: false },
    startDate: { type: Date, default: Date.now },
    reviewDate: { type: Date },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

const Habit = mongoose.model("Habit", HabitSchema);
module.exports = { Habit, HabitSchema };
