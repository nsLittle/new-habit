const Emails = require("../models/Email");
const sendEmail = require("../utils/emailSender");

const getScheduledEmails = async (req, res) => {
  try {
    const emails = await ScheduledEmails.find({ status: "pending" });
    res.json(emails);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch scheduled emails" });
  }
};

const sendTestEmail = async (req, res) => {
  try {
    const { recipientEmail } = req.body;
    if (!recipientEmail)
      return res.status(400).json({ error: "Email is required" });

    await sendEmail(recipientEmail, "Test Email", "This is a test email.");
    res.json({ message: `Test email sent to ${recipientEmail}` });
  } catch (err) {
    res.status(500).json({ error: "Failed to send test email" });
  }
};

module.exports = { getScheduledEmails, sendTestEmail };
