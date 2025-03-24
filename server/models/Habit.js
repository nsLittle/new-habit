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
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, required: true },
    reviewDate: {
      type: Date,
      default: function () {
        return new Date(this.start_date.getTime() + 90 * 24 * 60 * 60 * 1000);
      },
    },
    reflections: [
      {
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
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

  this.cadenceLength = cadenceMapping[this.cadence] || 30;

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

// const mongoose = require("mongoose");

// const HabitSchema = new mongoose.Schema(
//   {
//     userId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//     habit: { type: String, required: true },
//     description: { type: String, required: false },
//     reminders: {
//       isReminderEnabled: { type: Boolean, default: false },
//       isEmailReminderEnabled: { type: Boolean, default: false },
//       isTextReminderEnabled: { type: Boolean, default: false },
//       selectedDays: { type: [String], default: [] },
//       selectedTime: {
//         hour: { type: String, default: "12" },
//         minute: { type: String, default: "00" },
//         period: { type: String, enum: ["AM", "PM"], default: "PM" },
//       },
//     },
//     cadence: {
//       type: String,
//       enum: ["Weekly", "Every Other Week", "Monthly", "Quarterly", null],
//       default: null,
//     },
//     cadenceLength: { type: Number, required: true, default: 30 },
//     completed: { type: Boolean, default: false },
//     startDate: { type: Date, default: Date.now },
//     endDate: {
//       type: Date,
//       default: function () {
//         return new Date(this.startDate.getTime() + 90 * 24 * 60 * 60 * 1000);
//       },
//     },
//     reviewDate: {
//       type: Date,
//       default: function () {
//         return new Date(this.startDate.getTime() + 90 * 24 * 60 * 60 * 1000);
//       },
//     },
//     reflections: [
//       {
//         text: { type: String, required: true },
//         createdAt: { type: Date, default: Date.now },
//       },
//     ],
//     currentCycle: { type: Number, default: 1, min: 1, max: 3 }, // Limit to 3 cycles
//     habitCycles: [
//       {
//         cycleNumber: { type: Number, required: true },
//         startDate: { type: Date, required: true },
//         completionDate: { type: Date },
//       },
//     ],
//   },
//   { timestamps: true }
// );

// HabitSchema.pre("save", async function (next) {
//   const cadenceMapping = {
//     Weekly: 7,
//     "Every Other Week": 14,
//     Monthly: 30,
//     Quarterly: 90,
//   };

//   this.cadenceLength = cadenceMapping[this.cadence] || 30;

//   if (this.habitCycles.length > 0) {
//     const openCycles = this.habitCycles.filter(
//       (cycle) => !cycle.completionDate
//     );
//     if (openCycles.length > 1) {
//       throw new Error("Only one habit cycle can be open at a time.");
//     }
//   }

//   next();
// });

// const Habit = mongoose.model("Habit", HabitSchema);
// module.exports = { Habit, HabitSchema };
