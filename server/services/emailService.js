const sgMail = require("@sendgrid/mail");
require("dotenv").config();

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const SENDGRID_SENDER_EMAIL = process.env.SENDGRID_SENDER_EMAIL;

sgMail.setApiKey(SENDGRID_API_KEY);

const sendEmail = async (toEmail, firstName, habitName, feedbackLink) => {
  console.log("Sending a test email via SendGrid...");

  const msg = {
    to: toEmail,
    from: {
      email: SENDGRID_SENDER_EMAIL,
      name: "Your Habit App Team",
    },
    subject: `Feedback Request for ${habitName}`,
    text: "This is a test email to confirm SendGrid works.",
    html: `<p>Hi ${firstName},</p><p>We'd love your feedback on ${habitName}. Click <a href='${feedbackLink}'>here</a> to submit your feedback.</p>`,
  };

  try {
    console.log(`Sending email to ${toEmail}...`);
    await sgMail.send(msg);
    console.log(`✅ Email successfully sent to ${toEmail}`);
  } catch (error) {
    console.error("❌ SendGrid Error:", error.response?.body || error.message);
  }
};

// sendEmail("notsolittle88@gmail.com"); // Test the email
