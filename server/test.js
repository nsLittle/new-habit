const mongoose = require("mongoose");
const { Habit } = require("./models/Habit"); // Adjust path if needed

const habitId = "67d70ee46dc1ab2bd2ecddf7"; // Replace with this valid ID from your database
const markComplete = false; // Change to true if testing completion

async function testProgressHabit() {
  try {
    await mongoose.connect("mongodb://localhost:27017/new-habit"); // Ensure database name is correct

    const habit = await Habit.findById(habitId);
    if (!habit) {
      console.log("❌ Habit not found. Check the ID.");
      return;
    }

    console.log("Before update:", habit);

    if (markComplete) {
      // Mark habit as complete
      habit.completed = true;
      habit.habitCycles.push({
        cycleNumber: habit.currentCycle,
        startDate: habit.startDate,
        completionDate: new Date(),
      });
    } else {
      // Extend cycle if not completed
      if (habit.currentCycle < 3) {
        habit.habitCycles.push({
          cycleNumber: habit.currentCycle,
          startDate: new Date(),
        });
        habit.currentCycle += 1;
      } else {
        console.log("Max cycle limit reached. Consider marking complete.");
        return;
      }
    }

    await habit.save();
    console.log("After update:", habit);
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    mongoose.disconnect();
  }
}

testProgressHabit();
