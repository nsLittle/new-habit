const express = require("express");
const {
  getScheduledEmails,
  triggerEmailRequest,
} = require("../controllers/emailController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/scheduled", protect, getScheduledEmails);
router.post("/:username/:habit_id/trigger-email-request", triggerEmailRequest);

module.exports = router;
