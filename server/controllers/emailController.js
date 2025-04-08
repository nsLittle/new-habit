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
  const { username, habit_id } = req.params;
  const { teamMembers } = req.body;

  try {
    let failedEmails = [];

    for (const member of teamMembers) {
      const { firstName, lastName, email } = member;
      const token = generateTeamMemberToken(member.teamMember_id);
      const deepLink = `habitapp://FeedbackRequestWelcomeScreen/${member.teamMember_id}/${token}`;
      const recipientEmail = email;
      const subject = `Feedback Request for Habit ${habit_id}`;
      const htmlContent = `
  <p>Hi ${firstName} ${lastName},</p>
  <p>${username} is working on their habit and would love to get your feedback!</p>

  <p>
Until the app is available in the Apple App Store, the link below won’t open automatically when tapped. But you can still help:</p>
<ul>  
<li>1. Open the Habit App manually (via Expo Go or Android install).</li>
<li>2. Navigate to the “Feedback Request” screen.</li>
<li>3. Web preview (for testers only):</li>
<li>http://localhost:8081/feedback-request/${member.teamMember_id}/${token}
</li>
</ul>
  <p><a href="${deepLink}">Click here to give feedback</a></p>
  <p>Or copy and paste this link into your app:<br>${deepLink}</p>
  <p>Thank you!<br>Your Habit Formation Team</p>
`;

      const msg = {
        to: recipientEmail,
        from: "notsolittle88@gmail.com",
        subject,
        text: `Hi ${firstName} ${lastName},
    
    ${username} is working on their habit and would love to get your feedback!
    
    Click here to give feedback:
    ${deepLink}
    
    Or copy and paste this link into your app:
    ${deepLink}
    
    Thank you!
    Your Habit Formation Team`,
        html: htmlContent,
      };

      try {
        await sendgrid.send(msg);

        await Emails.create({
          recipient: recipientEmail,
          subject,
          html: htmlContent,
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
