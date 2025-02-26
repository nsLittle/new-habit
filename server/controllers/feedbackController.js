const mongoose = require("mongoose");
const Feedback = require("../models/Feedback");

exports.submitFeedback = async (req, res) => {
  console.log("I'm here to submit feedback...");
  try {
    const { habitId, teamMember_id, feedbackRating } = req.body;

    console.log("Request Body:", req.body);

    if (!habitId || !teamMember_id || !feedbackRating) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const newFeedback = new Feedback({
      habitId,
      teamMemberId: teamMember_id,
      feedbackRating,
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
  console.log("I'm here to edit feedback...");

  try {
    const { username, habit_id } = req.params;
    const { teamMemberId, feedbackThanksRating } = req.body;

    console.log("Received PATCH request:", req.params, req.body);

    if (!teamMemberId || feedbackThanksRating === undefined) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const feedback = await Feedback.findOneAndUpdate(
      { habitId: habit_id, teamMemberId },
      { feedbackThanksRating },
      { new: true }
    );

    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    console.log("Updated Feedback:", feedback);

    return res.status(200).json({
      message: "Feedback updated successfully",
      feedbackId: feedback._id,
      updatedFeedback: feedback,
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
        feedbackId: fb._id, // Returning feedbackId
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

// exports.editFeedback = async (req, res) => {
//   console.log("I'm here to edit feedback...");

//   try {
//     const { username, habit_id } = req.params;
//     const { teamMemberId, feedbackThanksRating } = req.body;

//     console.log("Received PATCH request:", req.params, req.body);

//     if (!teamMemberId || feedbackThanksRating === undefined) {
//       return res.status(400).json({ error: "Missing required fields" });
//     }

//     const feedback = await Feedback.findOneAndUpdate(
//       { username, habitId: habit_id, teamMemberId },
//       { feedbackThanksRating },
//       { new: true } // Return the updated document
//     );

//     if (!feedback) {
//       return res.status(404).json({ message: "Feedback not found" });
//     }

//     console.log("Updated Feedback:", feedback);

//     return res.status(200).json({
//       message: "Feedback updated successfully",
//       feedbackId: feedback._id,
//       updatedFeedback: feedback,
//     });
//   } catch (error) {
//     console.error("Error updating feedback:", error);

//     return res.status(500).json({ error: "Failed to update feedback" });
//   }
// };

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
