const express = require("express");
const { scheduleReminder } = require("../controllers/reminderController");
const { protect } = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/schedule", protect, scheduleReminder);

module.exports = router;
