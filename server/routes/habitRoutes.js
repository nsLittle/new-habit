const express = require("express");
const {
  createHabit,
  getUserHabits,
  getDetailedHabit,
  editedDetailedHabit,
  saveReminder,
  completeHabit,
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
router.patch(
  "/:username/:habit_id/edit-detailed-habit",
  protect,
  editedDetailedHabit
);

router.patch("/:username/:habitId/reminder", protect, saveReminder);
router.patch("/:username/:habit_id/complete", protect, completeHabit);

module.exports = router;
