const mongoose = require("mongoose");
const { Habit } = require("../models/Habit");
console.log("Habit Model:", Habit);

const Feedback = require("../models/Feedback");

exports.submitFeedback = async (req, res) => {
  console.log("I'm here to submit feedback...");
  try {
    const { habitId, teamMemberId, feedbackRating } = req.body;

    console.log("Request Body:", req.body);

    if (!habitId || !teamMemberId || !feedbackRating) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const habit = await Habit.findById(habitId);

    if (!habit) {
      return res.status(404).json({ error: "Habit not found" });
    }

    const cadenceLength = habit.cadenceLength || 7;
    const cadenceStart = new Date();
    const cadenceEnd = new Date();
    cadenceEnd.setDate(cadenceStart.getDate() + cadenceLength);

    const newFeedback = new Feedback({
      habitId,
      teamMemberId,
      feedbackRating,
      cadenceStart,
      cadenceEnd,
    });

    await newFeedback.save();

    console.log("New Feedback: ", newFeedback);

    res.status(201).json({
      message: "Feedback submitted successfully",
      feedbackId: newFeedback._id,
      feedback: newFeedback,
    });
  } catch (error) {
    console.error("Error details:", error);
    res.status(500).json({ error: "Failed to submit feedback" });
  }
};

exports.editFeedback = async (req, res) => {
  console.log("Editing existing feedback...");

  try {
    const { username, habitId } = req.params;
    const { feedbackRating, feedbackThanksRating, feedbackText } = req.body;

    if (!habitId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const feedback = await Feedback.findOne({ habitId: habitId });

    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    const updateFields = {};
    if (feedbackRating !== undefined)
      updateFields.feedbackRating = feedbackRating;
    if (feedbackThanksRating !== undefined)
      updateFields.feedbackThanksRating = feedbackThanksRating;
    if (feedbackText !== undefined) updateFields.feedbackText = feedbackText;

    const updatedFeedback = await Feedback.findOneAndUpdate(
      { habitId: habitId, teamMemberId: teamMemberId },
      { $set: updateFields },
      { new: true }
    );

    if (!updatedFeedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    return res.status(200).json({
      message: "Feedback updated successfully",
      feedback: updatedFeedback,
    });
  } catch (error) {
    console.error("Error updating feedback:", error);
    return res.status(500).json({ error: "Failed to update feedback" });
  }
};

exports.getFeedback = async (req, res) => {
  console.log("I'm here to get feedback...");
  try {
    const { username, habit_id } = req.params;

    console.log("Received Params:", req.params);

    const feedback = await Feedback.find({ habit_id });

    console.log("Feedback: ", feedback);

    if (!feedback.length) {
      return res
        .status(404)
        .json({ message: "No feedback found for this habit" });
    }

    res.status(200).json({
      message: "Feedback retrieved successfully",
      feedback: feedback.map((fb) => ({
        feedbackId: fb._id,
        habitId: fb.habitId,
        teamMemberId: fb.teamMemberId,
        feedbackRating: fb.feedbackRating,
      })),
    });
  } catch (error) {
    console.error("Error fetching feedback:", error);
    res.status(500).json({ error: "Failed to retrieve feedback" });
  }
};

exports.deleteFeedback = async (req, res) => {
  try {
    const { feedbackId } = req.params; // Use feedbackId in params

    const deletedFeedback = await Feedback.findByIdAndDelete(feedbackId);

    if (!deletedFeedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    res.status(200).json({ message: "Feedback deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete feedback" });
  }
};
