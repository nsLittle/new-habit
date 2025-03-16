const sgMail = require("@sendgrid/mail");
require("dotenv").config();

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const SENDGRID_SENDER_EMAIL = process.env.SENDGRID_SENDER_EMAIL;

sgMail.setApiKey(SENDGRID_API_KEY);

const sendEmail = async (toEmail) => {
  console.log("📧 Sending a test email via SendGrid...");

  const msg = {
    to: toEmail,
    from: {
      email: "notsolittle88@gmail.com", // Verified sender email
      name: "Your Name", // Optional: Name of the sender
    },
    subject: "Test Email from SendGrid",
    text: "This is a test email to confirm SendGrid works.",
    html: "<p>This is a test email to confirm SendGrid works.</p>",
  };

  try {
    console.log(`📨 Sending email to ${toEmail}...`);
    await sgMail.send(msg); // Send the email once using await
    console.log(`✅ Email successfully sent to ${toEmail}`);
  } catch (error) {
    console.error("❌ SendGrid Error:", error.response?.body || error.message);
  }
};

// Ensure function is available for use
sendEmail("notsolittle88@gmail.com");
