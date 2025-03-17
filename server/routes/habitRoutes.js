const express = require("express");
const {
  createHabit,
  getUserHabits,
  getDetailedHabit,
  saveHabit,
  saveDescription,
  saveCadence,
  saveReminder,
  completeHabit,
  saveReflection,
  getReflections,
} = require("../controllers/habitController");
const { protect } = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/:username", protect, createHabit);
router.get("/:username", protect, getUserHabits);
router.get(
  "/:username/:habit_id/get-detailed-habit",
  protect,
  getDetailedHabit
);
router.patch("/:username/:habit_id/habit", protect, saveHabit);
router.patch("/:username/:habit_id/description", protect, saveDescription);
router.patch("/:username/:habit_id/cadence", protect, saveCadence);
router.patch("/:username/:habit_id/reminder", protect, saveReminder);
router.patch("/:username/:habit_id/complete", protect, completeHabit);
router.post("/:username/:habit_id/reflection", protect, saveReflection);
router.get("/:habit_id/reflections", protect, getReflections);

module.exports = router;
