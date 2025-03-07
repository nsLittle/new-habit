const mongoose = require("mongoose");
const { Habit } = require("../models/Habit");
console.log("Habit Model:", Habit);

const Feedback = require("../models/Feedback");

exports.submitFeedback = async (req, res) => {
  console.log("I'm here to submit feedback...");
  try {
    const { habitContextId, teamMemberContextId, feedbackRating } = req.body;

    console.log("✅ Received Habit ID:", habitContextId);
    console.log("✅ Received Team Member ID:", teamMemberContextId);
    console.log("✅ Received Feedback Rating:", feedbackRating);

    console.log("Full Request Body:", JSON.stringify(req.body, null, 2));

    if (!teamMemberContextId) {
      console.error("Error: teamMemberContextId is missing in the request!");
      return res.status(400).json({ error: "Team Member ID is required" });
    }

    console.log("Team Member Id (raw request):", req.body.teamMemberContextId);
    console.log("Resolved Team Member Id:", teamMemberContextId);

    const habitId = Array.isArray(habitContextId)
      ? String(habitContextId.flat()[0])
      : String(habitContextId);

    const teamMemberId = teamMemberContextId;

    console.log("Request Body:", req.body);
    console.log("Habit Id: ", habitId);
    console.log("Team Member Id: ", teamMemberId);
    console.log("Feedback Rating: ", feedbackRating);

    if (!habitId || !teamMemberId || !feedbackRating) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const habit = await Habit.findById(habitId);
    console.log("Found habit: ", habit);

    if (!habit) {
      return res.status(404).json({ error: "Habit not found" });
    }

    const cadenceLength = habit.cadenceLength || 7;
    const cadenceStart = new Date();
    const cadenceEnd = new Date();
    cadenceEnd.setDate(cadenceStart.getDate() + cadenceLength);

    console.log("Searching for habit with ID: ", habitId);

    const existingFeedback = await Feedback.findOne({
      habitId,
      teamMemberId,
      cadenceStart: { $lte: cadenceEnd },
      cadenceEnd: { $gte: cadenceStart },
    });

    console.log("Existing Feedback: ", existingFeedback);

    if (existingFeedback) {
      console.log("⚠️ Feedback already exists, attempting to send response...");

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
    console.error("❌ Error submitting feedback:", error);

    if (!res.headersSent) {
      return res.status(500).json({ error: "Failed to submit feedback" });
    } else {
      console.error("🚨 ERROR: Response already sent, cannot send another.");
    }
  }
};

exports.editFeedback = async (req, res) => {
  console.log("Editing existing feedback...");
  console.log("Incoming PATCH request:", req.params);
  console.log("Incoming Request Body:", req.body);
  console.log("Team Member Id: ", req.body.teamMemberId);

  try {
    const { username, habit_id } = req.params;
    console.log("Username: ", username, "with habit id: ", habit_id);

    const { feedbackRating, feedbackThanksRating, feedbackText } = req.body;
    console.log(
      "Feedback Rating: ",
      feedbackRating,
      "with Feedback ThanksRating: ",
      feedbackThanksRating
    );

    if (!habit_id) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const feedback = await Feedback.findOne({
      habitId: habit_id,
      teamMemberId: req.body.teamMemberId,
    });
    console.log("Found Feedback: ", feedback);

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
      { habitId: habit_id, teamMemberId: req.body.teamMemberId },
      { $set: updateFields },
      { new: true }
    );

    console.log("Updated Feedback: ", updatedFeedback);

    if (!updatedFeedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    console.log("Successfully updated feedback, sending response...");
    return res.status(200).json({
      message: "Feedback updated successfully",
      feedback: updatedFeedback,
    });
  } catch (error) {
    console.error("Error updating feedback:", error);
    if (!res.headersSent) {
      return res.status(500).json({ error: "Failed to update feedback" });
    }
  }
};

exports.getFeedback = async (req, res) => {
  console.log("I'm here to get feedback...");
  try {
    const { username, habit_id } = req.params;

    console.log("Received Params:", req.params);

    const feedback = await Feedback.find({ habitId: habit_id });

    console.log("Feedback: ", feedback);

    if (!feedback.length) {
      return res
        .status(200)
        .json({ message: "No feedback found for this habit", feedback: [] });
    }

    res.status(200).json({
      message: "Feedback retrieved successfully",
      feedback: feedback.map((fb) => ({
        feedbackId: fb._id,
        habitId: fb.habitId,
        teamMemberId: fb.teamMemberId,
        feedbackRating: fb.feedbackRating,
        feedbackThanksRating: fb.feedbackThanksRating,
        feedbackText: fb.feedbackText,
        cadenceStart: fb.cadenceStart,
        cadenceEnd: fb.cadenceEnd,
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
