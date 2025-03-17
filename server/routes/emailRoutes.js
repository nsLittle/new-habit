const express = require("express");
const {
  getScheduledEmails,
  sendTestEmail,
} = require("../controllers/emailController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/scheduled", protect, getScheduledEmails);

router.post("/send-test", protect, sendTestEmail);

module.exports = router;
