const nodemailer = require("nodemailer");
const sgMail = require("@sendgrid/mail");

const useSendGrid = process.env.SENDGRID_API_KEY ? true : false;

if (useSendGrid) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

const sendEmail = async (to, subject, text) => {
  try {
    if (useSendGrid) {
      const msg = {
        to,
        from: process.env.EMAIL_FROM,
        subject,
        text,
      };
      await sgMail.send(msg);
    } else {
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: process.env.EMAIL_SECURE === "true",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      await transporter.sendMail({
        from: `"Westsood Support" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        text,
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error: error.message };
  }
};

module.exports = sendEmail;
