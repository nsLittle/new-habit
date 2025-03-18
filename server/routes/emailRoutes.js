const express = require("express");
const {
  getScheduledEmails,
  sendTestEmail,
  triggerEmailRequest,
} = require("../controllers/emailController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/scheduled", protect, getScheduledEmails);

router.post("/send-test", protect, sendTestEmail);

router.post("/:username/:habit_id/trigger-email-request", triggerEmailRequest);

module.exports = router;
