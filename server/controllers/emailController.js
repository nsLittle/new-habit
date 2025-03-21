const Emails = require("../models/Email");
const sendgrid = require("@sendgrid/mail");
const sendEmail = require("../utils/emailSender");

// Ensure SendGrid API key is set
sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

exports.getScheduledEmails = async (req, res) => {
  try {
    const emails = await Emails.find({ status: "pending" });
    res.json(emails);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch scheduled emails" });
  }
};

exports.triggerEmailRequest = async (req, res) => {
  console.log("I'm here triggering emails...");

  const { username, habit_id } = req.params;
  const { teamMembers } = req.body;
  console.log("Req Params: ", req.params);
  console.log("Req Body: ", req.body);

  try {
    let failedEmails = [];

    for (const member of teamMembers) {
      const { firstName, lastName, email } = member;

      const recipientEmail = `${email}`; // Replace with member.email when available
      const subject = `Feedback Request for Habit ${habit_id}`;
      const body = `Hi ${firstName} ${lastName},\n\n
      ${username} is working on their habit and would love to get your feedback!\n
      Click the link below to provide your thoughts:\n
      http://localhost:8081/FeedbackRequestWelcomeScreen\n\n
      Thank you!\nYour Habit Formation Team`;

      const msg = {
        to: recipientEmail,
        from: "notsolittle88@gmail.com", // Must be a verified SendGrid sender
        subject: subject,
        text: body,
      };

      try {
        await sendgrid.send(msg);
        console.log(`Email sent successfully to ${firstName} ${lastName}`);
      } catch (error) {
        console.error(
          `Error sending email to ${firstName} ${lastName}:`,
          error.response?.body?.errors || error
        );
        failedEmails.push({ firstName, lastName, error: error.response?.body });
      }
    }

    if (failedEmails.length > 0) {
      return res.status(500).json({
        message: "Some emails failed to send",
        failedEmails,
      });
    }

    res.json({
      message: "Feedback requests sent successfully to all team members",
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    res
      .status(500)
      .json({ message: "Server error occurred", error: err.message });
  }
};

exports.sendTestEmail = async (req, res) => {
  try {
    const { recipientEmail } = req.body;
    if (!recipientEmail) {
      return res.status(400).json({ error: "Email is required" });
    }

    await sendEmail(recipientEmail, "Test Email", "This is a test email.");
    res.json({ message: `Test email sent to ${recipientEmail}` });
  } catch (err) {
    console.error("Error sending test email:", err);
    res.status(500).json({ error: "Failed to send test email" });
  }
};
