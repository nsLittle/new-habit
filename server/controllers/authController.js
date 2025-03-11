const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const sgMail = require("@sendgrid/mail");
const { clear } = require("console");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.signup = async (req, res) => {
  console.log("I'm creating a new account...");
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    console.log("Entered Password: ", req.body.password);
    console.log("Hashed Password: ", hashedPassword);

    const user = await User.create({
      username: req.body.username,
      password: hashedPassword,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      profilePic: req.body.profilePic,
    });

    const token = jwt.sign(
      { userId: user._id, username: user.username, password: user.password },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    console.log("Token: ", token);
    console.log("UserId: ", user._id);
    console.log("Username: ", user.username);
    console.log("Password: ", user.password);

    res.status(201).json({ message: "User created successfully", user, token });
    console.log("User created beautifully.");
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  console.log("I'm in the back logging in ...");
  try {
    const { username, password } = req.body;
    console.log("Username: ", username);
    console.log("Password: ", password);

    const user = await User.findOne({ username });
    console.log("User found:", user);
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    console.log("Found Username: ", user.username);
    console.log("Found Password: ", user.password);
    console.log("Entered Password: ", password);

    console.log("Comparing passwords...");
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      console.log("Password does not match");
      return res.status(401).json({ message: "Invalid credentials" });
    }

    console.log("Password matched!");

    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    console.log("Token: ", token);
    console.log("Login succesfukl");
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

exports.passwordReset = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    user.password = hashedPassword;
    await user.save();

    res.json({ message: "Password successfully reset" });
  } catch (error) {
    res.status(400).json({ message: "Invalid or expired token" });
  }
};
