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
    habitLength: { type: Number, required: true, default: 90 },
    maxCycles: { type: Number, default: 3 },
    completed: { type: Boolean, default: false },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, required: true },
    reviewDate: {
      type: Date,
      default: function () {
        return new Date(this.startDate.getTime() + 90 * 24 * 60 * 60 * 1000);
      },
    },
    reflections: [
      {
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    habitCycles: [
      {
        cycleNumber: { type: Number, required: true },
        startDate: { type: Date, required: true },
        completionDate: { type: Date },
      },
    ],
    feedbackCycles: [
      {
        startDate: Date,
        endDate: Date,
      },
    ],
  },
  { timestamps: true }
);

HabitSchema.pre("save", async function (next) {
  const cadenceMapping = {
    Weekly: 7,
    "Every Other Week": 14,
    Monthly: 30,
    Quarterly: 90,
  };

  if (!this.cadenceLength || this.isNew) {
    this.cadenceLength = cadenceMapping[this.cadence] || 30;
  }

  if (this.isNew && !this.completed) {
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
