const { Habit } = require("../models/Habit");
const User = require("../models/User");

console.log("User model:", User);

exports.createHabit = async (req, res) => {
  try {
    console.log("Incoming request to create habit for:", req.params.username);
    console.log("Reqeust Body: ", req.body);

    const { username } = req.params;
    console.log("Username:", username);

    const { habit, userId } = req.body;
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

    const newHabit = await Habit.create({
      habit,
      user: user._id,
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

exports.editedDetailedHabit = async (req, res) => {
  try {
    const { username, habitId } = req.params;
    console.log("Updating Habit:", habitId, "for User:", username);

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const habit = await Habit.findOne({ user });
    if (!habit) {
      return res.status(404).json({ message: "Habit not found" });
    }

    const updatedHabit = await Habit.findOneAndUpdate(
      { _id: habit._id, user: user._id },
      req.body,
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
    const { username, habitId } = req.params;
    console.log("Saving Reminder for Habit:", habitId, "User:", username);

    // Find user by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find habit by habitId and user
    const habit = await Habit.findOne({ _id: habitId, user: user._id });
    if (!habit) {
      return res.status(404).json({ message: "Habit not found" });
    }

    // Update the habit with the reminder details
    const updatedHabit = await Habit.findByIdAndUpdate(
      habitId,
      { $set: { reminder: req.body } },
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
