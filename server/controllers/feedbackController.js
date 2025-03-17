const mongoose = require("mongoose");
const { Habit } = require("../models/Habit");
const User = require("../models/User");
const feedbackController = require("../controllers/feedbackController");
console.log("Habit Model:", Habit);

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

    console.log(
      "Checking for existing feedback with habit id: ",
      habit_id,
      "and team member Id, ",
      teammemberId
    );

    const existingFeedback = await Feedback.findOne({
      habitId: habit_id,
      teamMemberId: teammemberId,
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
      { habitId: habit_id },
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

exports.triggerFeedbackRequest = async (req, res) => {
  console.log("🔄 Triggering feedback request...");

  try {
    console.log("🟢 Received Request Body:", req.body);

    const { habitId, userId } = req.body;

    if (!habitId || !userId) {
      return res.status(400).json({ message: "Missing habitId or userId." });
    }

    console.log(`✅ Habit ID: ${habitId}`);
    console.log(`✅ User ID: ${userId}`);

    const habit = await Habit.findById(habitId);
    if (!habit) {
      console.log("❌ Habit not found.");
      return res.status(404).json({ message: "Habit not found." });
    }
    console.log("✅ Habit found:", habit);

    const user = await User.findById(userId).populate("teamMember");
    if (!user) {
      console.log("❌ User not found.");
      return res.status(404).json({ message: "User not found." });
    }
    console.log("✅ User found:", user);

    const teamMembersList = user.teamMember;
    if (!teamMembersList || teamMembersList.length === 0) {
      console.log("❌ No team members found.");
      return res.status(404).json({ message: "No team members found." });
    }
    console.log(`✅ Found ${teamMembersList.length} team members.`);

    const getScheduleDates = (startDate, cadence) => {
      const dates = [];
      let currentDate = new Date(startDate);

      if (cadence === "Weekly") {
        for (let i = 0; i < 12; i++) {
          dates.push(new Date(currentDate));
          currentDate.setDate(currentDate.getDate() + 7);
        }
      } else if (cadence === "Monthly") {
        for (let i = 0; i < 6; i++) {
          dates.push(new Date(currentDate));
          currentDate.setMonth(currentDate.getMonth() + 1);
        }
      }

      return dates;
    };

    const scheduleDates = getScheduleDates(habit.start_date, habit.cadence);
    console.log("📅 Scheduled email dates for this habit:", scheduleDates);

    const today = new Date();
    console.log("Today: ", today);
    today.setHours(0, 0, 0, 0);

    for (const teamMember of teamMembersList) {
      console.log("Team member: ", teamMember);
      for (const cadenceStart of scheduleDates) {
        let cadenceEnd = new Date(cadenceStart);
        console.log("Cadence Start: ", cadenceStart);

        // Add the cadence length to the cadence end date
        cadenceEnd.setDate(cadenceEnd.getDate() + habit.cadenceLength); // Adding cadence length to the end date
        console.log("Cadence End after adding cadence length: ", cadenceEnd);
        console.log("Today get Time: ", today.getTime());
        console.log("Cadence Start getTime: ", cadenceStart.getTime());

        if (today.getTime() === cadenceStart.getTime()) {
          console.log("Today get Time: ", today.getTime());
          console.log("Cadence Start getTime: ", cadenceStart.getTime());
          console.log(`✅ Today matches cadence start date: ${cadenceStart}`);

          const existingRequest = await Feedback.findOne({
            habitId: habit._id,
            teamMemberId: teamMember._id,
            cadenceStart,
            cadenceEnd,
          });

          if (existingRequest) {
            console.log(
              `🚫 Feedback request already exists for this period, skipping email.`
            );
            continue;
          }

          // Construct feedback link and send email
          const feedbackLink = `http://localhost:8081/feedback-request/${habit._id}`;
          const emailSent = await sendEmail(
            teamMember.teamMemberEmail, // Send email to team member
            habit.habit,
            teamMember.teamMemberFirstName,
            feedbackLink
          );

          console.log(`📨 Email send function returned:`, emailSent);

          // Log the feedback request in the database
          await Feedback.create({
            habitId: habit._id,
            teamMemberId: teamMember._id,
            habitStartDate: habit.start_date,
            cadenceStart,
            cadenceEnd,
            requestSentAt: new Date(),
            feedbackDate: new Date(),
            feedbackStatus: "pending",
          });

          console.log(`✅ Feedback request sent and logged.`);
        }
      }
    }

    return res
      .status(200)
      .json({ message: "Feedback request triggered successfully." });
  } catch (error) {
    console.error("❌ Error in triggering feedback request:", error);
    return res
      .status(500)
      .json({ message: "Failed to trigger feedback request." });
  }
};

exports.getAggregateFeedback = async (req, res) => {
  try {
    const { habit_id } = req.params; // Expecting habit ID as a route param

    if (!mongoose.Types.ObjectId.isValid(habit_id)) {
      return res.status(400).json({ error: "Invalid habit ID format" });
    }

    console.log(`🔍 Fetching aggregated feedback for habit ID: ${habit_id}`);

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
