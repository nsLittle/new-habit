const mongoose = require("mongoose");

const FeedbackSchema = new mongoose.Schema(
  {
    habitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Habit",
      required: true,
      index: true,
    },
    teamMemberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    feedbackRating: {
      type: Number,
      min: 1,
      max: 8,
    },
    feedbackThanksRating: {
      type: Number,
      min: 1,
      max: 5,
    },
    feedbackText: {
      type: String,
      trim: true,
    },
    habitStartDate: { type: Date, required: true },
    cadenceStart: {
      type: Date,
      required: true,
    },
    cadenceEnd: {
      type: Date,
      required: true,
    },
    cadenceLength: { type: Number, required: true },
    requestSentAt: {
      type: Date,
      default: Date.now,
    },
    lastReminderSentAt: {
      type: Date,
    },
    feedbackStatus: {
      type: String,
      enum: ["pending", "submitted", "declined", "non-response"],
      default: "pending",
    },
    declineReason: {
      type: String,
      trim: true,
    },
    feedbackDate: { type: Date, required: true },
  },
  { timestamps: true }
);

FeedbackSchema.index(
  { habitId: 1, teamMemberId: 1, cadenceStart: 1, cadenceEnd: 1 },
  { unique: true }
);

const Feedback = mongoose.model("Feedback", FeedbackSchema);
module.exports = Feedback;
