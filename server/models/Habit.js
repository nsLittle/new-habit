const mongoose = require("mongoose");

const HabitSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    habit: { type: String, required: true },
    description: { type: String, required: false },
    reminders: {
      isReminderEnabled: { type: Boolean, default: false },
      isEmailReminderEnabled: { type: Boolean, default: false },
      isTextReminderEnabled: { type: Boolean, default: false },
      selectedDays: { type: [String], default: [] },
      selectedTime: {
        hour: { type: String, default: "12" },
        minute: { type: String, default: "00" },
        period: { type: String, enum: ["AM", "PM"], default: "PM" },
      },
    },
    cadence: {
      type: String,
      enum: ["Weekly", "Every Other Week", "Monthly", "Quarterly", null],
      default: null,
    },
    cadenceLength: { type: Number, required: true, default: 30 },
    completed: { type: Boolean, default: false },
    start_date: { type: Date, default: Date.now }, // Default to now
    review_due_date: {
      type: Date,
      default: function () {
        return new Date(this.start_date.getTime() + 90 * 24 * 60 * 60 * 1000);
      },
    },
  },
  { timestamps: true }
);

HabitSchema.pre("save", function (next) {
  const cadenceMapping = {
    Weekly: 7,
    "Every Other Week": 14,
    Monthly: 30,
    Quarterly: 90,
  };

  this.cadenceLength = cadenceMapping[this.cadence] || 30; // Default to 30 (Monthly) if null/invalid

  next();
});

HabitSchema.pre("save", async function (next) {
  const cadenceMapping = {
    Weekly: 7,
    "Every Other Week": 14,
    Monthly: 30,
    Quarterly: 90,
  };

  this.cadenceLength = cadenceMapping[this.cadence] || 30;

  // Prevent user from creating a new habit if an incomplete habit exists
  if (!this.completed) {
    const existingHabit = await Habit.findOne({
      userId: this.userId,
      completed: false,
    });

    if (existingHabit) {
      const error = new Error(
        "You already have an incomplete habit. Complete it before creating a new one."
      );
      return next(error);
    }
  }

  next();
});

const Habit = mongoose.model("Habit", HabitSchema);
module.exports = { Habit, HabitSchema };
