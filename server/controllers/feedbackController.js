const mongoose = require("mongoose");
const feedbackController = require("../controllers/feedbackController");
const { Habit } = require("../models/Habit");
const User = require("../models/User");
const sendEmail = require("../utils/emailSender");

const Feedback = require("../models/Feedback");

exports.submitFeedback = async (req, res) => {
  try {
    const receivedData = req.params;
    const { feedbackRating } = req.body;
    const username = receivedData.username;
    const habit_id = receivedData.habit_id;
    const teammemberId = receivedData.teammemberId;

    if (!habit_id || !teammemberId || !feedbackRating) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const habit = await Habit.findById(habit_id);

    if (!habit) {
      return res.status(404).json({ error: "Habit not found" });
    }

    const userId = habit.userId;
    const habitStartDate = habit.start_date;
    const feedbackDate = new Date();

    const cadenceLength = habit.cadenceLength || 7;
    const cadenceStart = new Date();
    const cadenceEnd = new Date();
    cadenceEnd.setDate(cadenceStart.getDate() + cadenceLength);

    const existingFeedback = await Feedback.findOne({
      habitId: habit_id,
      teamMemberId: teammemberId,
    });

    if (existingFeedback) {
      if (res.headersSent) {
        console.error(
          "🚨 ERROR: Response already sent. Avoiding double response."
        );
        return;
      }

      return res.status(400).json({
        message: "Feedback already exists for this cadence period.",
      });
    }

    const newFeedback = new Feedback({
      userId,
      habitId: habit_id,
      teamMemberId: teammemberId,
      feedbackRating,
      feedbackDate,
      habitStartDate,
      cadenceStart,
      cadenceEnd,
    });

    await newFeedback.save();

    res.status(201).json({
      message: "Feedback submitted successfully",
      feedbackId: newFeedback._id,
      feedback: newFeedback,
    });
  } catch (error) {
    console.error("❌ Error submitting feedback:", error);

    if (!res.headersSent) {
      return res.status(500).json({ error: "Failed to submit feedback" });
    } else {
      console.error("❌ ERROR: Response already sent, cannot send another.");
    }
  }
};

exports.editFeedbackTextRating = async (req, res) => {
  try {
    const { habit_id } = req.params;
    const { feedbackText, teamMemberId } = req.body;

    if (!habit_id || !teamMemberId || !feedbackText) {
      return res.status(400).json({
        error: "Missing habit ID, team member ID, or feedback text.",
      });
    }

    const existingFeedback = await Feedback.findOne({
      habitId: habit_id,
      teamMemberId,
    });

    if (!existingFeedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    if (existingFeedback.feedbackText) {
      return res.status(400).json({
        message: "Feedback text has already been submitted.",
      });
    }

    existingFeedback.feedbackText = feedbackText;
    await existingFeedback.save();
    return res.status(200).json({
      message: "Feedback text updated successfully",
      feedback: existingFeedback,
    });
  } catch (error) {
    console.error("❌ Error updating feedback text:", error);
    return res.status(500).json({ error: "Failed to update feedback text" });
  }
};

exports.editFeedbackThanksRating = async (req, res) => {
  try {
    const { habit_id } = req.params;
    const { feedbackThanksRating, teamMemberContextId } = req.body;
    const teamMemberId = teamMemberContextId;

    if (!habit_id || !teamMemberId || feedbackThanksRating === undefined) {
      return res.status(400).json({
        error: "Missing habit ID, team member ID, or thanks rating.",
      });
    }

    const existingFeedback = await Feedback.findOne({
      habitId: habit_id,
      teamMemberId,
    });

    if (!existingFeedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    if (existingFeedback.feedbackThanksRating !== undefined) {
      return res.status(400).json({
        message: "Thanks rating has already been submitted.",
      });
    }

    existingFeedback.feedbackThanksRating = feedbackThanksRating;
    await existingFeedback.save();
    return res.status(200).json({
      message: "Thanks rating updated successfully",
      feedback: existingFeedback,
    });
  } catch (error) {
    console.error("❌ Error updating thanks rating:", error);
    return res.status(500).json({ error: "Failed to update thanks rating" });
  }
};

exports.editFeedbackRating = async (req, res) => {
  try {
    const { username, habit_id } = req.params;
    const { feedbackRating, teamMemberId } = req.body;

    if (!habit_id || !teamMemberId || feedbackRating === undefined) {
      return res.status(400).json({
        error: "Missing habit ID, team member ID, or rating.",
      });
    }

    const existingFeedback = await Feedback.findOne({
      habitId: habit_id,
      teamMemberId,
    });

    if (!existingFeedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    if (existingFeedback.feedbackRating !== undefined) {
      return res.status(400).json({
        message: "Rating has already been submitted.",
      });
    }

    existingFeedback.feedbackRating = feedbackRating;
    await existingFeedback.save();

    return res.status(200).json({
      message: "Feedback rating updated successfully",
      feedback: existingFeedback,
    });
  } catch (error) {
    console.error("❌ Error updating feedback rating:", error);
    return res.status(500).json({ error: "Failed to update feedback rating." });
  }
};

exports.getFeedback = async (req, res) => {
  console.log("I'm here to get feedback...");
  try {
    const { username, habit_id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(habit_id)) {
      return res.status(400).json({ error: "Invalid habit ID format" });
    }

    const feedback = await Feedback.find({ habitId: habit_id });

    res.status(200).json({
      message: "Feedback retrieved successfully",
      feedback,
    });
  } catch (error) {
    console.error("❌ Error fetching feedback:", error);
    res.status(500).json({ error: "Failed to retrieve feedback" });
  }
};

exports.deleteFeedback = async (req, res) => {
  try {
    const { feedbackId } = req.params;

    const deletedFeedback = await Feedback.findByIdAndDelete(feedbackId);

    if (!deletedFeedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    res.status(200).json({ message: "Feedback deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete feedback" });
  }
};

exports.getAggregateFeedback = async (req, res) => {
  try {
    const { habit_id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(habit_id)) {
      return res.status(400).json({ error: "Invalid habit ID format" });
    }

    const aggregatedData = await aggregateFeedbackData(habit_id);

    if (!aggregatedData || aggregatedData.length === 0) {
      return res
        .status(200)
        .json({ message: "No feedback available", feedback: [] });
    }

    return res.status(200).json({
      message: "Aggregated feedback retrieved successfully",
      feedback: aggregatedData,
    });
  } catch (error) {
    console.error("❌ Error retrieving aggregated feedback:", error);
    return res
      .status(500)
      .json({ error: "Failed to retrieve aggregated feedback" });
  }
};
