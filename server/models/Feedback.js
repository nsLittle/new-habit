const mongoose = require("mongoose");

const FeedbackSchema = new mongoose.Schema(
  {
    habitId: {
      type: String,
      required: true,
      index: true,
    },
    teamMemberId: {
      type: String,
      required: true,
      index: true,
    },
    feedbackRating: { type: Number, required: true, min: 1, max: 8 },
    feedbackText: { type: String, required: false, trim: true },
  },
  { timestamps: true }
);

const Feedback = mongoose.model("Feedback", FeedbackSchema);
module.exports = Feedback;
