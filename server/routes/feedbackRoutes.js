const express = require("express");
const {
  submitFeedback,
  getFeedbackForHabit,
} = require("../controllers/feedbackController");
const { protect } = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/:username", protect, submitFeedback);
router.get("/:username/:habit_id", protect, getFeedbackForHabit);
router.patch("/:username/:habit_id", protect, editFeedback);
router.delete("/:username/:habit_id", protect, deleteFeedback);

module.exports = router;
