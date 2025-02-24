const mongoose = require("mongoose");
const Feedback = require("../models/Feedback");

exports.submitFeedback = async (req, res) => {
  console.log("I'm here to submit feedback...");
  try {
    const { habitId, teamMemberId, feedbackRating } = req.body;

    console.log("Request Body:", req.body);

    if (!habitId || !teamMemberId || !feedbackRating) {
      return res.status(400).json({ error: "All fields are required." });
    }

    console.log("Anything happen here?");

    const newFeedback = new Feedback({
      habitId,
      teamMemberId,
      feedbackRating,
    });

    await newFeedback.save();

    console.log("What about here?");

    console.log("New Feedback: ", newFeedback);

    res.status(201).json({
      message: "Feedback submitted successfully",
      feedback: newFeedback,
    });
  } catch (error) {
    console.error("Error details:", error);
    res.status(500).json({ error: "Failed to submit feedback" });
  }
};

exports.getFeedback = async (req, res) => {
  console.log("I'm here to get feedback...");
  try {
    const { username, habit_id } = req.params;

    console.log("Received Params:", req.params);

    const feedback = await Feedback.find({ username, habit_id });

    console.log("Feedback: ", feedback);

    if (!feedback.length) {
      return res
        .status(404)
        .json({ message: "No feedback found for this habit" });
    }

    res
      .status(200)
      .json({ message: "Feedback retrieved successfully", feedback });
  } catch (error) {
    console.error("Error fetching feedback:", error);
    res.status(500).json({ error: "Failed to retrieve feedback" });
  }
};

exports.editFeedback = async (req, res) => {
  console.log("I'm here to edit feedback...");
  try {
    const { username, habitId } = req.params;
    const { habit_id, teamMemberId, feedbackText } = req.body;

    const updatedFeedback = await Feedback.findByIdAndUpdate(
      feedbackId,
      { feedbackText, feedbackRating },
      { new: true }
    );

    if (!updatedFeedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    res.status(200).json({
      message: "Feedback edited successfully",
      feedback: updatedFeedback,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to edit feedback" });
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
