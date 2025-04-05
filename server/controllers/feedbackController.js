const mongoose = require("mongoose");
const feedbackController = require("../controllers/feedbackController");
const { Habit } = require("../models/Habit");
const User = require("../models/User");
const sendEmail = require("../utils/emailSender");
// console.log("Habit Model:", Habit);

const Feedback = require("../models/Feedback");

exports.submitFeedback = async (req, res) => {
  console.log("I'm here to submit feedback...");
  try {
    const receivedData = req.params;
    console.log("Received Data: ", receivedData);
    const { feedbackRating } = req.body;

    console.log("✅ Username:", receivedData.username);
    console.log("✅ Habit ID:", receivedData.habit_id);
    console.log("✅ Team Member ID:", receivedData.teammemberId);
    console.log("✅ Feedback Rating:", feedbackRating);
    const username = receivedData.username;
    const habit_id = receivedData.habit_id;
    const teammemberId = receivedData.teammemberId;

    if (!habit_id || !teammemberId || !feedbackRating) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const habit = await Habit.findById(habit_id);
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

    // console.log(
    //   "Checking for existing feedback with habit id: ",
    //   habit_id,
    //   "and team member Id, ",
    //   teammemberId
    // );

    const existingFeedback = await Feedback.findOne({
      habitId: habit_id,
      teamMemberId: teammemberId,
    });

    // console.log("Existing Feedback: ", existingFeedback);

    if (existingFeedback) {
      // console.log("⚠️ Feedback already exists, attempting to send response...");

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

exports.editFeedbackTextRating = async (req, res) => {
  console.log("📝 Editing feedback text...");
  console.log("Incoming PATCH request:", req.params);
  console.log("Incoming Request Body:", req.body);

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

    console.log("✅ Successfully updated feedback text");
    return res.status(200).json({
      message: "Feedback text updated successfully",
      feedback: existingFeedback,
    });
  } catch (error) {
    console.error("❌ Error updating feedback text:", error);
    return res.status(500).json({ error: "Failed to update feedback text" });
  }
};

// exports.editFeedbackRating = async (req, res) => {
//   // console.log("Editing existing feedback...");
//   // console.log("Incoming PATCH request:", req.params);
//   // console.log("Incoming Request Body:", req.body);
//   // console.log("Team Member Id: ", req.body.teamMemberId);

//   try {
//     const { username, habit_id } = req.params;
//     // console.log("Username: ", username, "with habit id: ", habit_id);

//     const { feedbackRating, teamMemberId } = req.body;
//     // console.log("Feedback Rating: ", feedbackRating);

//     if (!habit_id || feedbackRating === undefined || !teamMemberId) {
//       return res.status(400).json({ error: "Missing required fields" });
//     }

//     const updatedFeedback = await Feedback.findOneAndUpdate(
//       { habitId: habit_id, teamMemberId },
//       { $set: { feedbackRating } },
//       { new: true }
//     );

//     if (!updatedFeedback) {
//       return res.status(404).json({ message: "Feedback not found" });
//     }

//     // console.log("Successfully updating feedback rating");
//     return res.status(200).json({
//       message: "Feedback rating updated successfully",
//       feedback: updatedFeedback,
//     });
//   } catch (error) {
//     console.error("Error updating feedback rating:", error);
//     if (!res.headersSent) {
//       return res
//         .status(500)
//         .json({ error: "Failed to update feedback rating." });
//     }
//   }
// };

// exports.editFeedbackThanksRating = async (req, res) => {
//   console.log("Editing feedback thanks rating...");
//   console.log("Incoming PATCH request:", req.params);
//   console.log("Incoming Request Body:", req.body);

//   try {
//     const { habit_id } = req.params;
//     console.log("Req Param: ", req.params);
//     const { feedbackThanksRating, teamMemberContextId } = req.body;
//     console.log("Req Body: ", req.body);
//     console.log(
//       "Feedback Thanks Rating: ",
//       feedbackThanksRating,
//       "Team Member ID: ",
//       teamMemberContextId
//     );
//     console.log("Team Member ID: ", teamMemberContextId);

//     const updatedFeedback = await Feedback.findOneAndUpdate(
//       { habitId: habit_id },
//       { $set: { feedbackThanksRating } },
//       { new: true }
//     );

//     console.log("Updated Feedback: ", updatedFeedback);

//     if (!updatedFeedback) {
//       return res.status(404).json({ message: "Feedback not found" });
//     }

//     console.log("Successfully updateing feedback thanks rating");
//     return res.status(200).json({
//       message: "Feedback thanks rating updated successfully",
//       feedback: updatedFeedback,
//     });
//   } catch (error) {
//     console.error("Error updating feedback thanks rating:", error);
//     return res
//       .status(500)
//       .json({ error: "Failed to update feedback thanks rating" });
//   }
// };

exports.editFeedbackThanksRating = async (req, res) => {
  console.log("🙏 Editing feedback thanks rating...");
  console.log("Incoming PATCH request:", req.params);
  console.log("Incoming Request Body:", req.body);

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

    console.log("✅ Successfully updated thanks rating");
    return res.status(200).json({
      message: "Thanks rating updated successfully",
      feedback: existingFeedback,
    });
  } catch (error) {
    console.error("❌ Error updating thanks rating:", error);
    return res.status(500).json({ error: "Failed to update thanks rating" });
  }
};

// exports.editFeedbackTextRating = async (req, res) => {
//   console.log("Editing feedback text...");
//   console.log("Incoming PATCH request:", req.params);
//   console.log("Incoming Request Body:", req.body);

//   try {
//     const { habit_id } = req.params;
//     const { feedbackText, teamMemberId } = req.body;
//     console.log("Req Body: ", req.body);

//     const updatedFeedback = await Feedback.findOneAndUpdate(
//       { habitId: habit_id, teamMemberId },
//       { $set: { feedbackText } },
//       { new: true }
//     );

//     if (!updatedFeedback) {
//       return res.status(404).json({ message: "Feedback not found" });
//     }

//     console.log("Successfully updated feedback text");
//     return res.status(200).json({
//       message: "Feedback text updated successfully",
//       feedback: updatedFeedback,
//     });
//   } catch (error) {
//     console.error("Error updating feedback text:", error);
//     return res.status(500).json({ error: "Failed to update feedback text" });
//   }
// };

exports.editFeedbackRating = async (req, res) => {
  console.log("⭐ Editing feedback rating...");
  console.log("Incoming PATCH request:", req.params);
  console.log("Incoming Request Body:", req.body);

  try {
    const { username, habit_id } = req.params;
    const { feedbackRating, teamMemberId } = req.body;

    if (!habit_id || !teamMemberId || feedbackRating === undefined) {
      return res.status(400).json({
        error: "Missing habit ID, team member ID, or rating.",
      });
    }

    // Step 1: Find existing feedback by habit and team member
    const existingFeedback = await Feedback.findOne({
      habitId: habit_id,
      teamMemberId,
    });

    if (!existingFeedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    // Step 2: Prevent overwriting if already submitted
    if (existingFeedback.feedbackRating !== undefined) {
      return res.status(400).json({
        message: "Rating has already been submitted.",
      });
    }

    // Step 3: Save new rating
    existingFeedback.feedbackRating = feedbackRating;
    await existingFeedback.save();

    console.log("✅ Successfully updated feedback rating");
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

    console.log("Received Params:", req.params);

    if (!mongoose.Types.ObjectId.isValid(habit_id)) {
      return res.status(400).json({ error: "Invalid habit ID format" });
    }

    const feedback = await Feedback.find({ habitId: habit_id });

    console.log("Feedback:", feedback);

    // if (!feedback.length) {
    //   return res
    //     .status(200)
    //     .json({ message: "No feedback found for this habit", feedback: [] });
    // }

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

exports.getAggregateFeedback = async (req, res) => {
  try {
    const { habit_id } = req.params; // Expecting habit ID as a route param

    if (!mongoose.Types.ObjectId.isValid(habit_id)) {
      return res.status(400).json({ error: "Invalid habit ID format" });
    }

    // console.log(`🔍 Fetching aggregated feedback for habit ID: ${habit_id}`);

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
