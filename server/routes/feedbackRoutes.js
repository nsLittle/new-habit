const express = require("express");
const {
  submitFeedback,
  getFeedback,
  editFeedbackRating,
  editFeedbackThanksRating,
  editFeedbackTextRating,
  deleteFeedback,
  getAggregateFeedback,
} = require("../controllers/feedbackController");
const { protect } = require("../middlewares/authMiddleware");
const router = express.Router();

router.get("/aggregate/:habit_id", protect, getAggregateFeedback);
router.get("/:username/:habit_id", protect, getFeedback);

router.post(
  "/:username/:habit_id/:teammemberId/submit",
  protect,
  submitFeedback
);
router.patch("/:username/:habit_id/rating", protect, editFeedbackRating);
router.patch(
  "/:username/:habit_id/thanks-rating",
  protect,
  editFeedbackThanksRating
);
router.patch("/:username/:habit_id/text", editFeedbackTextRating);
router.delete("/:username/:habit_id", protect, deleteFeedback);

module.exports = router;
