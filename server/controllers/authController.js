const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const sendgrid = require("@sendgrid/mail");
const User = require("../models/User");
sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

exports.signup = async (req, res) => {
  try {
    const password = req.body.password;
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

    const user = await User.create({
      username: req.body.username,
      password: hashedPassword,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      profilePic: req.body.profilePic,
    });

    const storedUser = await User.findOne({ username: req.body.username });

    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(201).json({ message: "User created successfully", user, token });
  } catch (error) {
    console.error("Signup error:", error.message);
    res.status(400).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });

    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      username: user.username,
      userId: user._id,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.logout = async (req, res) => {
  res
    .status(200)
    .json({ message: "Logged out successfully. Remove token on client-side." });
};

exports.passwordResetRequest = async (req, res) => {
  console.log("Request received at /password-reset-request");
  console.log("Request body:", req.body);
  const { email } = req.body;
  console.log("Extracted email:", email);

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = Date.now() + 3600000;
    await user.save();

    const resetLink = `habitapp://password-reset/${user.username}/${resetToken}`;

    const msg = {
      to: user.email,
      from: { email: process.env.SENDGRID_FROM_EMAIL }, // CHANGE TO WESTWOOD EMAIL!!!
      subject: "Your Habit App Password Reset Link",
      text: `Use the following link to reset your password: ${resetLink}`,
      html: `<p>Use the following link to reset your password:</p><a href="${resetLink}">${resetLink}</a>`,
    };

    try {
      await sendgrid.send(msg);
      console.log("✅ Email sent via SendGrid to", user.email);
    } catch (err) {
      console.error(
        "❌ SendGrid send error:",
        err.response?.body || err.message
      );
    }

    res.json({
      message: "Password reset token generated",
      resetToken,
    });
  } catch (error) {
    res.status(500).json({ error: "Error generating password reset token" });
  }
};

exports.passwordReset = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.json({ message: "Password successfully reset" });
  } catch (error) {
    res.status(500).json({ error: "Error resetting password" });
  }
};
