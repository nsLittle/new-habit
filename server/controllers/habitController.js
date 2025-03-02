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
    console.log("User: ", user);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!completed) {
      const activeHabit = await Habit.findOne({
        user: userId,
        completed: false,
      });

      if (activeHabit) {
        return res
          .status(400)
          .json({ message: "Only one active habit is allowed at a time." });
      }
    }

    const newHabit = await Habit.create({
      userId: userId,
      habit,
      completed: completed ?? false,
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

    const habits = await Habit.find({ userId: user._id });

    console.log("User ID from User Model:", user._id);
    console.log(
      "User ID stored in Habit:",
      habits.map((h) => h.userId)
    );

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
    console.log("Fetching saved habit for:", req.params.username);
    console.log("Request Body: ", req.body);

    const { username, habit_id } = req.params;
    console.log("Req Params: ", req.params);
    console.log("Saving Habit:", habit_id, "for User:", username);

    const user = await User.findOne({ username });
    console.log("User: ", user);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log("User ID Type:", typeof user._id);
    console.log("User ID:", user._id);

    const updatedHabit = await Habit.findOneAndUpdate(
      { _id: habit_id },
      { $set: { habit: req.body.habit } },
      { new: true }
    );

    console.log("Updated Habit: ", updatedHabit);

    if (!updatedHabit) {
      return res.status(404).json({ message: "Habit not found" });
    }

    console.log("Habit updated successfully.");

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
    const { username, habit_id } = req.params;
    const { description } = req.body;

    console.log("Fetching habit for:", username, "Habit ID:", habit_id);
    console.log("Received Description:", description);

    if (!description || description.trim() === "") {
      return res.status(400).json({ message: "Description cannot be empty." });
    }

    const user = await User.findOne({ username });
    if (!user) {
      console.log("User not found:", username);
      return res.status(404).json({ message: "User not found" });
    }

    const updatedDescription = await Habit.findOneAndUpdate(
      { _id: habit_id },
      { $set: { description: description } },
      { new: true }
    );

    if (!updatedDescription) {
      console.log("Habit not found:", habit_id);
      return res.status(404).json({ message: "Habit not found" });
    }

    console.log("Updated Description:", updatedDescription);
    return res.status(200).json({
      message: "Description updated successfully",
      updatedDescription,
    });
  } catch (error) {
    console.error("Error updating description:", error);
    return res.status(500).json({ error: "Internal Server Error" });
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
    console.log("Extracted reminders object:", req.body.reminders);

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const habit = await Habit.findOne({ _id: habit_id, user: user._id });
    if (!habit) {
      return res.status(404).json({ message: "Habit not found" });
    }

    // Ensure reminders exist in request body
    if (!req.body.reminders) {
      return res.status(400).json({ message: "Reminders data is missing" });
    }

    const { reminders } = req.body;

    // Normalize selectedDays array
    let selectedDays = reminders.selectedDays;
    if (typeof selectedDays === "string") {
      selectedDays = selectedDays.split(",").map((day) => day.trim());
    } else if (!Array.isArray(selectedDays)) {
      selectedDays = [];
    }

    // Normalize selectedTime
    const selectedTime = {
      hour: String(reminders.selectedTime?.hour) || "00",
      minute: String(reminders.selectedTime?.minute) || "00",
      period: String(reminders.selectedTime?.period) || "AM",
    };

    console.log("Final selectedDays:", selectedDays);
    console.log("Final selectedTime:", selectedTime);

    const updatedHabit = await Habit.findByIdAndUpdate(
      habit_id,
      {
        $set: {
          "reminders.selectedDays": selectedDays,
          "reminders.selectedTime": selectedTime,
          "reminders.isReminderEnabled": reminders.isReminderEnabled ?? false,
          "reminders.isEmailReminderEnabled":
            reminders.isEmailReminderEnabled ?? false,
          "reminders.isTextReminderEnabled":
            reminders.isTextReminderEnabled ?? false,
        },
      },
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
  console.log("Saving on the back end with cadence...");
  try {
    const { username, habit_id } = req.params;
    const { cadence } = req.body;
    console.log("Request Params:", req.params);
    console.log("Request Body:", req.body);
    console.log(`Updating cadence for habit: ${habit_id}, user: ${username}`);
    console.log("Received cadence:", cadence);

    const validCadences = [
      "Weekly",
      "Every Other Week",
      "Monthly",
      "Quarterly",
      null,
    ];
    if (!validCadences.includes(cadence)) {
      return res
        .status(400)
        .json({ message: "Invalid feedback cadence value" });
    }

    const user = await User.findOne({ username });
    console.log("User: ", user);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const updatedHabit = await Habit.findOneAndUpdate(
      { _id: habit_id, user: user._id },
      { $set: { cadence } },
      { new: true, runValidators: true }
    );

    console.log("Updated Habit: ", updatedHabit);

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
