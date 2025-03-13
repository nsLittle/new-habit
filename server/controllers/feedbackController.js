const mongoose = require("mongoose");
const { Habit } = require("../models/Habit");
const feedbackController = require("../controllers/feedbackController");
console.log("Habit Model:", Habit);

const Feedback = require("../models/Feedback");

exports.submitFeedback = async (req, res) => {
  console.log("I'm here to submit feedback...");
  try {
    const { habitContextId, teamMemberContextId, feedbackRating } = req.body;

    console.log("✅ Received Habit ID:", habitContextId);
    console.log("✅ Received Team Member ID:", teamMemberContextId);
    console.log("✅ Received Feedback Rating:", feedbackRating);

    console.log("Full Request Body:", req.body);

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

    const habit = await Habit.findById(habitContextId);
    console.log("Found habit: ", habit);

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

    console.log(
      "Checkign for exisgint feedback with habit id: ",
      habitContextId,
      "and team member Id, ",
      teamMemberContextId
    );

    const existingFeedback = await Feedback.findOne({
      habitId,
      teamMemberId,
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
      userId,
      habitId,
      teamMemberId,
      feedbackRating,
      feedbackDate,
      habitStartDate,
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

exports.editFeedbackRating = async (req, res) => {
  console.log("Editing existing feedback...");
  console.log("Incoming PATCH request:", req.params);
  console.log("Incoming Request Body:", req.body);
  console.log("Team Member Id: ", req.body.teamMemberId);

  try {
    const { username, habit_id } = req.params;
    console.log("Username: ", username, "with habit id: ", habit_id);

    const { feedbackRating, teamMemberId } = req.body;
    console.log("Feedback Rating: ", feedbackRating);

    if (!habit_id || feedbackRating === undefined || !teamMemberId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const updatedFeedback = await Feedback.findOneAndUpdate(
      { habitId: habit_id, teamMemberId },
      { $set: { feedbackRating } },
      { new: true }
    );

    if (!updatedFeedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    console.log("Successfully updating feedback rating");
    return res.status(200).json({
      message: "Feedback rating updated successfully",
      feedback: updatedFeedback,
    });
  } catch (error) {
    console.error("Error updating feedback rating:", error);
    if (!res.headersSent) {
      return res
        .status(500)
        .json({ error: "Failed to update feedback rating." });
    }
  }
};

exports.editFeedbackThanksRating = async (req, res) => {
  console.log("Editing feedback thanks rating...");
  console.log("Incoming PATCH request:", req.params);
  console.log("Incoming Request Body:", req.body);

  try {
    const { habit_id } = req.params;
    console.log("Req Param: ", req.params);
    const { feedbackThanksRating, teamMemberContextId } = req.body;
    console.log("Req Body: ", req.body);
    console.log(
      "Feedback Thanks Rating: ",
      feedbackThanksRating,
      "Team Member ID: ",
      teamMemberContextId
    );
    console.log("Team Member ID: ", teamMemberContextId);

    const updatedFeedback = await Feedback.findOneAndUpdate(
      { habitId: habit_id },
      { $set: { feedbackThanksRating } },
      { new: true }
    );

    console.log("Updated Feedback: ", updatedFeedback);

    if (!updatedFeedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    console.log("Successfully updateing feedback thanks rating");
    return res.status(200).json({
      message: "Feedback thanks rating updated successfully",
      feedback: updatedFeedback,
    });
  } catch (error) {
    console.error("Error updating feedback thanks rating:", error);
    return res
      .status(500)
      .json({ error: "Failed to update feedback thanks rating" });
  }
};

exports.editFeedbackTextRating = async (req, res) => {
  console.log("Editing feedback text...");
  console.log("Incoming PATCH request:", req.params);
  console.log("Incoming Request Body:", req.body);

  try {
    const { habit_id } = req.params;
    const { feedbackText, teamMemberId } = req.body;
    console.log("Req Body: ", req.body);

    const updatedFeedback = await Feedback.findOneAndUpdate(
      { habitId: habit_id, teamMemberId },
      { $set: { feedbackText } },
      { new: true }
    );

    if (!updatedFeedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    console.log("Successfully updated feedback text");
    return res.status(200).json({
      message: "Feedback text updated successfully",
      feedback: updatedFeedback,
    });
  } catch (error) {
    console.error("Error updating feedback text:", error);
    return res.status(500).json({ error: "Failed to update feedback text" });
  }
};

exports.getFeedback = async (req, res) => {
  console.log("I'm here to get feedback...");
  try {
    const { habit_id } = req.params;

    console.log("Received Params:", req.params);

    if (!mongoose.Types.ObjectId.isValid(habit_id)) {
      return res.status(400).json({ error: "Invalid habit ID format" });
    }

    const feedback = await Feedback.find({ habitId: habit_id });

    console.log("Feedback:", feedback);

    if (!feedback.length) {
      return res
        .status(200)
        .json({ message: "No feedback found for this habit", feedback: [] });
    }

    console.log("Right before sneding feedback response...");

    res.status(200).json({
      message: "Feedback retrieved successfully",
      feedback,
    });
    console.log("Right afetr sneding feedback response...");
  } catch (error) {
    console.error("❌ Error fetching feedback:", error);
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
