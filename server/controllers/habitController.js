const { Habit } = require("../models/Habit");
const User = require("../models/User");

console.log("User model:", User);

exports.createHabit = async (req, res) => {
  try {
    console.log("Incoming request to create habit for:", req.params.username);
    console.log("Reqeust Body: ", req.body);

    const { username } = req.params;
    console.log("Username:", username);

    const { habit, userId, completed } = req.body;
    console.log("Habit: ", habit);
    console.log("User Id: ", userId);

    if (!habit) {
      return res.status(400).json({ message: "Habit is required" });
    }

    let user;
    if (userId) {
      user = await User.findById(userId);
    } else {
      user = await User.findOne({ username });
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!completed) {
      const activeHabit = await Habit.findOne({
        user: user._id,
        completed: false,
      });

      if (activeHabit) {
        return res
          .status(400)
          .json({ message: "Only one active habit is allowed at a time." });
      }
    }

    const newHabit = await Habit.create({
      habit,
      user: user._id,
      completed, // Defaults to false unless specified otherwise
    });

    console.log("New Habit: ", newHabit);

    res.status(201).json({
      habit: newHabit.habit,
      habitId: newHabit._id,
      message: "Habit created successfully",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getUserHabits = async (req, res) => {
  try {
    console.log("Incoming request to get habit for:", req.params.username);
    const { username } = req.params;
    console.log("Fetching habits for: ", username);

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const habits = await Habit.find({ user: user._id });

    res.status(200).json({
      message: "Habits retrieved successfully",
      habits,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getDetailedHabit = async (req, res) => {
  try {
    console.log(
      "Incoming request to get description for:",
      req.params.username
    );
    console.log("Incoming request to get description for:", req.params.habitId);
    const { username, habitId } = req.params;
    console.log("Fetching descriptions for: ", username);

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    const descriptions = await Habit.find({ user: user._id });

    res.status(200).json({
      message: "Descpription retrieved successfully",
      descriptions,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.saveHabit = async (req, res) => {
  try {
    console.log("Fetching edited habit for:", req.params.username);
    console.log("Request Body: ", req.body);

    const { username, habit_id } = req.params;
    console.log("Req Params: ", req.params);
    console.log("Updating Habit:", habit_id, "for User:", username);

    const user = await User.findOne({ username });
    console.log("User: ", user);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const updatedHabit = await Habit.findOneAndUpdate(
      { _id: habit_id, user: user._id },
      { $set: { Habit: req.body.habit } },
      { new: true }
    );

    if (!updatedHabit) {
      return res.status(404).json({ message: "Habit not found" });
    }

    res.status(200).json({
      message: "Detailed habit updated successfully",
      updatedHabit,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.saveDescription = async (req, res) => {
  try {
    console.log("Fetching edited detailed habit for:", req.params.username);
    console.log("Request Body: ", req.body);

    const { username, habit_id } = req.params;
    console.log("Req Params: ", req.params);
    console.log("Updating Habit:", habit_id, "for User:", username);

    const user = await User.findOne({ username });
    console.log("User: ", user);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Ensure only the "description" field is updated
    const updatedHabit = await Habit.findOneAndUpdate(
      { _id: habit_id, user: user._id },
      { $set: { description: req.body.description } }, // Only update the description field
      { new: true }
    );

    if (!updatedHabit) {
      return res.status(404).json({ message: "Habit not found" });
    }

    res.status(200).json({
      message: "Detailed habit updated successfully",
      updatedHabit,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.completeHabit = async (req, res) => {
  try {
    const { habitId } = req.params;

    const completedHabit = await Habit.findByIdAndUpdate(
      habitId,
      { completed: true },
      { new: true }
    );

    if (!completedHabit) {
      return res.status(404).json({ message: "Habit not found" });
    }

    res.status(200).json({
      message: "Habit marked as complete successfully",
      completedHabit,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.saveReminder = async (req, res) => {
  try {
    console.log("Request Params:", req.params);
    const { username, habit_id } = req.params;
    console.log(
      "Saving Reminder for Habit Id:",
      habit_id,
      "for username:",
      username
    );
    console.log("Request Body:", req.body);

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const habit = await Habit.findOne({ _id: habit_id, user: user._id });
    console.log("Habit Id: ", habit_id, "for user: ", user._id);

    if (!habit) {
      return res.status(404).json({ message: "Habit not found" });
    }

    const { reminderTime, selectedDays, ...otherFields } = req.body;

    const requestData = {
      ...otherFields,
      selectedDays: Array.isArray(selectedDays)
        ? selectedDays
        : selectedDays.split(",").map((day) => day.trim()),
      selectedTime: {
        hour: Number(reminderTime.hour) || 0,
        minute: Number(reminderTime.minute) || 0,
        second: Number(reminderTime.second) || 0,
      },
    };

    const updatedHabit = await Habit.findByIdAndUpdate(
      habit_id,
      { $set: { reminders: requestData } },
      { new: true, runValidators: true }
    );

    if (!updatedHabit) {
      return res.status(500).json({ message: "Failed to save reminder" });
    }

    res.status(200).json({
      message: "Reminder saved successfully",
      updatedHabit,
    });
  } catch (error) {
    console.error("Error saving reminder:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.saveCadence = async (req, res) => {
  try {
    const { username, habit_id } = req.params;
    const { feedbackCadence } = req.body;

    console.log(
      `Updating feedbackCadence for habit: ${habit_id}, user: ${username}`
    );
    console.log("Received cadence:", feedbackCadence);

    // Validate feedbackCadence
    const validCadences = [
      "Weekly",
      "Every Other Week",
      "Monthly",
      "Quarterly",
      null,
    ];
    if (!validCadences.includes(feedbackCadence)) {
      return res
        .status(400)
        .json({ message: "Invalid feedback cadence value" });
    }

    // Find user
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find habit and update feedbackCadence
    const updatedHabit = await Habit.findOneAndUpdate(
      { _id: habit_id, user: user._id },
      { $set: { feedbackCadence } }, // Update only the feedbackCadence field
      { new: true, runValidators: true }
    );

    if (!updatedHabit) {
      return res.status(404).json({ message: "Habit not found" });
    }

    res.status(200).json({
      message: "Feedback cadence updated successfully",
      updatedHabit,
    });
  } catch (error) {
    console.error("Error updating feedback cadence:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
