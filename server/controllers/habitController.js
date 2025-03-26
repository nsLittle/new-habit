const { Habit } = require("../models/Habit");
const Feedback = require("../models/Feedback");
const User = require("../models/User");

// console.log("User model:", User);

exports.createHabit = async (req, res) => {
  try {
    // console.log("Incoming request to create habit for:", req.params.username);
    // console.log("Reqeust Body: ", req.body);

    const { username } = req.params;
    // console.log("Username:", username);

    let { habit, userId, completed } = req.body;
    // console.log("Habit: ", habit);
    // console.log("User Id: ", userId);

    if (!habit) {
      return res.status(400).json({ message: "Habit is required" });
    }

    let user;
    if (userId) {
      user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found by userId" });
      }
    } else {
      user = await User.findOne({ username });
      if (!user) {
        return res.status(404).json({ message: "User not found by username" });
      }
      userId = user._id;
    }

    // console.log("User: ", user);
    // console.log("Final User Id (ensured from User model):", userId);

    const existingHabit = await Habit.findOne({ userId, completed: false });
    // console.log("Existing Habit: ", existingHabit);

    if (existingHabit) {
      return res
        .status(400)
        .json({ message: "Only one active habit is allowed at a time." });
    }

    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 30);

    const newHabit = await Habit.create({
      userId,
      habit,
      completed: completed ?? false,
      startDate,
      endDate,
    });

    // console.log("New Habit: ", newHabit);

    res.status(201).json({
      habit: newHabit.habit,
      habitId: newHabit._id,
      endDate: newHabit.endDate,
      message: "Habit created successfully",
    });
  } catch (error) {
    console.error("🔥 Error in createHabit:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getUserHabits = async (req, res) => {
  console.log("I'm here to get habit....");
  try {
    // console.log("Incoming request to get habit for:", req.params.username);
    const { username } = req.params;
    // console.log("Fetching habits for: ", username);

    const user = await User.findOne({ username });
    // console.log("User: ", user);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const habits = await Habit.find({ userId: user._id });

    // console.log("Habit: ", habits);

    res.status(200).json({ habits });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getDetailedHabit = async (req, res) => {
  try {
    // console.log(
    //   "Incoming request to get description for:",
    //   req.params.username
    // );
    // console.log(
    //   "Incoming request to get description for:",
    //   req.params.habit_id
    // );
    // console.log("Req Params: ", req.params);
    // const { username, habit_id } = req.params;
    // console.log(
    //   "Fetching descriptions for: ",
    //   username,
    //   "with habit id: ",
    //   habit_id
    // );

    const user = await User.findOne({ username });
    // console.log("User: ", user);
    // console.log("User Id: ", user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    const habit = await Habit.findOne({ _id: habit_id, userId: user._id });
    if (!habit) {
      return res.status(404).json({ message: "Habit not found!" });
    }

    // console.log("Habits: ", habit);
    // console.log("Habit successfully retrieved...");
    res.status(200).json({
      message: "Habit retrieved successfully",
      habit,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.saveHabit = async (req, res) => {
  try {
    // console.log("Fetching saved habit for:", req.params.username);
    // console.log("Request Body: ", req.body);

    const { username, habit_id } = req.params;
    // console.log("Req Params: ", req.params);
    // console.log("Saving Habit:", habit_id, "for User:", username);

    const user = await User.findOne({ username });
    // console.log("User: ", user);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // console.log("User ID Type:", typeof user._id);
    // console.log("User ID:", user._id);

    const updatedHabit = await Habit.findOneAndUpdate(
      { _id: habit_id },
      { $set: { habit: req.body.habit } },
      { new: true }
    );

    // console.log("Updated Habit: ", updatedHabit);

    if (!updatedHabit) {
      return res.status(404).json({ message: "Habit not found" });
    }

    // console.log("Habit updated successfully.");

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

    // console.log("Fetching habit for:", username, "Habit ID:", habit_id);
    // console.log("Received Description:", description);

    if (!description || description.trim() === "") {
      return res.status(400).json({ message: "Description cannot be empty." });
    }

    const user = await User.findOne({ username });
    if (!user) {
      // console.log("User not found:", username);
      return res.status(404).json({ message: "User not found" });
    }

    const updatedDescription = await Habit.findOneAndUpdate(
      { _id: habit_id },
      { $set: { description: description } },
      { new: true }
    );

    if (!updatedDescription) {
      // console.log("Habit not found:", habit_id);
      return res.status(404).json({ message: "Habit not found" });
    }

    // console.log("Updated Description:", updatedDescription);
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
    // console.log("Request Params:", req.params);
    const { username, habit_id } = req.params;

    // console.log(
    //   "Saving Reminder for Habit Id:",
    //   habit_id,
    //   "for username:",
    //   username
    // );

    // console.log("Request Body:", req.body);
    // console.log("Extracted reminders object:", req.body.reminders);

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // console.log("User: ", user);

    const habit = await Habit.findOne({ _id: habit_id });
    if (!habit) {
      return res.status(404).json({ message: "Habit not found" });
    }

    // console.log("Habit: ", habit);

    if (!req.body.reminders) {
      return res.status(400).json({ message: "Reminders data is missing" });
    }

    const { reminders } = req.body;

    let selectedDays = reminders.selectedDays;
    if (typeof selectedDays === "string") {
      selectedDays = selectedDays.split(",").map((day) => day.trim());
    } else if (!Array.isArray(selectedDays)) {
      selectedDays = [];
    }

    const selectedTime = {
      hour: String(reminders.selectedTime?.hour) || "00",
      minute: String(reminders.selectedTime?.minute) || "00",
      period: String(reminders.selectedTime?.period) || "AM",
    };

    // console.log("Final selectedDays:", selectedDays);
    // console.log("Final selectedTime:", selectedTime);

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
  // console.log("Saving on the back end with cadence...");
  try {
    const { username, habit_id } = req.params;
    const { cadence } = req.body;
    // console.log("Request Params:", req.params);
    // console.log("Request Body:", req.body);
    // console.log(`Updating cadence for habit: ${habit_id}, user: ${username}`);
    // console.log("Received cadence:", cadence);

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
    // console.log("User: ", user);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const updatedHabit = await Habit.findOneAndUpdate(
      { _id: habit_id },
      { $set: { cadence } },
      { new: true, runValidators: true }
    );

    // console.log("Updated Habit: ", updatedHabit);

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

exports.saveReflection = async (req, res) => {
  console.log("📝 Saving user reflection...");

  try {
    const { username, habit_id } = req.params;
    const { text, mastered } = req.body;

    if (!text?.trim()) {
      return res.status(400).json({ message: "Reflection text is required" });
    }

    const habit = await Habit.findById(habit_id);
    // console.log("Habit: ", habit);
    // console.log("Habit End: ", habit.endDate);
    if (!habit) {
      return res.status(404).json({ message: "Habit not found" });
    }

    const today = new Date();
    const finalPeriodEnd = new Date(habit.endDate);
    const finalPeriodOver = today >= finalPeriodEnd;

    // console.log("📅 Today:", today.toISOString());
    // console.log("📅 Final Period End:", finalPeriodEnd.toISOString());
    // console.log("✅ Final Period is Over:", finalPeriodOver);

    if (!finalPeriodOver) {
      return res.status(400).json({
        message:
          "You cannot submit a reflection before the final feedback period ends.",
      });
    }

    const feedbacks = await Feedback.find({ habitId: habit._id });
    const hasFinalFeedback = feedbacks.some((fb) => {
      const fbDate = new Date(fb.createdAt);
      return (
        fbDate <= today &&
        fbDate >=
          finalPeriodEnd.setDate(finalPeriodEnd.getDate() - habit.cadenceLength)
      );
    });

    if (!hasFinalFeedback) {
      return res.status(400).json({
        message:
          "You must have at least one feedback from the final period before submitting a reflection.",
      });
    }

    habit.reflections.push({
      text,
      createdAt: new Date(),
    });

    const current = habit.currentCycle;
    const isNumber = typeof current === "number" && !isNaN(current);
    const nextCycle = isNumber ? current + 1 : 2;

    if (mastered || current >= habit.maxCycles) {
      // console.log("✅ Marking habit as complete");
      habit.completed = true;

      habit.habitCycles.push({
        cycleNumber: current,
        startDate: habit.startDate,
        completionDate: today,
      });
    } else {
      // console.log("🔄 Extending to next cycle:", nextCycle);

      const newStart = new Date();
      const newEnd = new Date(newStart);
      newEnd.setDate(newEnd.getDate() + habit.cadenceLength);

      habit.currentCycle = nextCycle;
      habit.startDate = newStart;
      habit.endDate = newEnd;
      habit.reviewDate = newEnd;

      habit.habitCycles.push({
        cycleNumber: nextCycle,
        startDate: newStart,
      });
    }

    await habit.save();

    return res.status(201).json({ message: "Reflection saved!", habit });
  } catch (error) {
    console.error("💥 Error saving reflection:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

exports.getReflections = async (req, res) => {
  // console.log("I'm here in teh back getting reflecdtions...");
  try {
    const { habit_id } = req.params;

    const habit = await Habit.findById(habit_id);
    if (!habit) {
      f;
      return res.status(404).json({ message: "Habit not found" });
    }

    res.status(200).json({
      habit,
      habitEndDate: habit.habitEndDate,
    });
  } catch (error) {
    console.error("Error fetching reflections:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.completeCycle = async (req, res) => {
  // console.log("🔄 Completing habit cycle...");
  try {
    const { username, habit_id } = req.params;
    // console.log("REq Param: ", req.params);

    const habit = await Habit.findById(habit_id);
    // console.log("Habit Retreived: ", habit);

    if (!habit) {
      return res.status(404).json({ message: "Habit not found" });
    }

    if (habit.currentCycle < 3) {
      habit.habitCycles.push({
        cycleNumber: habit.currentCycle,
        startDate: new Date(),
      });
      habit.currentCycle += 1;
    } else {
      habit.completed = true;
      habit.habitCycles.push({
        cycleNumber: habit.currentCycle,
        startDate: new Date(),
        completionDate: new Date(),
      });
    }

    if (habit.completed) {
      // console.log("Habit successbully complete in back ednd..");
      return res
        .status(400)
        .json({ message: "Habit successfully marked as complete." });
    }

    await habit.save();
    // console.log("✅ Habit cycle updated successfully.");

    res
      .status(200)
      .json({ message: "Habit cycle updated successfully", habit });
  } catch (error) {
    console.error("❌ Error updating habit cycle:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.createNewHabitCycle = async (req, res) => {
  try {
    const { habitId } = req.params;

    const habit = await Habit.findById(habitId);
    if (!habit) return res.status(404).json({ error: "Habit not found" });

    const nextCycle = habit.currentCycle + 1;

    if (nextCycle > habit.maxCycles) {
      return res.status(400).json({ error: "Max cycles reached" });
    }

    const now = new Date();
    const newReviewDate = new Date(now);
    newReviewDate.setDate(now.getDate() + habit.cadenceLength);

    habit.habitCycles.push({
      cycleNumber: nextCycle,
      startDate: now,
    });

    habit.currentCycle = nextCycle;
    habit.startDate = now;
    habit.reviewDate = newReviewDate;
    habit.endDate = newReviewDate;
    habit.completed = false;

    await habit.save();

    res.status(200).json({ message: "New habit cycle started", habit });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
