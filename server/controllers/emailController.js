const Emails = require("../models/Email");
const User = require("../models/User");
const sendgrid = require("@sendgrid/mail");
const sendEmail = require("../utils/emailSender");
const jwt = require("jsonwebtoken");

function generateTeamMemberToken(teammemberId) {
  return jwt.sign({ teammemberId }, process.env.JWT_SECRET, {
    expiresIn: "24h",
  });
}

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
  // console.log("I'm here triggering emails...");

  const { username, habit_id } = req.params;
  const { teamMembers } = req.body;

  try {
    let failedEmails = [];

    for (const member of teamMembers) {
      const { firstName, lastName, email } = member;
      const token = generateTeamMemberToken(member.teamMember_id);
      const deepLink = `habitapp://FeedbackRequestWelcomeScreen/${member.teamMember_id}/${token}`;
      console.log("📨 Email deepLink:", deepLink);
      const recipientEmail = email;
      const subject = `Feedback Request for Habit ${habit_id}`;
      const html = `
      <p>Hi ${firstName} ${lastName},</p>
      <p>${username} is working on their habit and would love to get your feedback!</p>
      <p><a href="${deepLink}">Click here to give feedback</a></p>
      <p>Or copy and paste this link into your app:<br>${deepLink}</p>
      <p>Thank you!<br>Your Habit Formation Team</p>
    `;

      const msg = {
        to: recipientEmail,
        from: "notsolittle88@gmail.com",
        subject,
        html,
      };

      try {
        await sendgrid.send(msg);

        await Emails.create({
          recipient: recipientEmail,
          subject,
          html,
          sendAt: new Date(),
          status: "sent",
        });

        await User.findOneAndUpdate(
          { username },
          {
            $set: {
              lastFeedbackRequestDate: new Date(),
            },
          },
          { new: true }
        );
      } catch (error) {
        console.error(
          `❌ Error sending email to ${firstName} ${lastName}:`,
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
    lastFeedbackRequestDate = new Date();
    // console.log("Last Feedback Reqeust End Date: ", lastFeedbackRequestDate);

    return res.json({
      message: "Feedback requests sent successfully to all team members",
      lastFeedbackRequestDate: new Date(),
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    res
      .status(500)
      .json({ message: "Server error occurred", error: err.message });
  }
};
