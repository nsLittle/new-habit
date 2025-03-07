const express = require("express");
const {
  submitFeedback,
  getFeedback,
  editFeedbackRating,
  editFeedbackThanksRating,
  editFeedbackTextRating,
  deleteFeedback,
} = require("../controllers/feedbackController");
const { protect } = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/:username", protect, submitFeedback);
router.get("/:username/:habit_id", protect, getFeedback);
router.patch("/:username/:habit_id/rating", editFeedbackRating);
router.patch("/:username/:habit_id/thanks-rating", editFeedbackThanksRating);
router.patch("/:username/:habit_id/text", editFeedbackTextRating);

router.delete("/:username/:habit_id", protect, deleteFeedback);

module.exports = router;
