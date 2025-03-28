const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

exports.signup = async (req, res) => {
  // console.log("Creating a new account...");
  try {
    // console.log("Received Password at Signup:", req.body.password);
    const password = req.body.password;
    // console.log("Password: ", password);

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
    // console.log("Hashed Password: ", hashedPassword);

    const user = await User.create({
      username: req.body.username,
      password: hashedPassword,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      profilePic: req.body.profilePic,
    });

    const storedUser = await User.findOne({ username: req.body.username });

    // console.log("🔹 Stored Hashed Password in DB:", storedUser.password);
    // console.log(
    //   "🔹 Does Stored Hash Match Hashed Password Before Storing?:",
    //   storedUser.password === hashedPassword
    // );

    const token = jwt.sign(
      { userId: user._id, username: user.username }, // ✅ Removed `password`
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // console.log("User created: ", user._id); // ✅ Safe logging

    res.status(201).json({ message: "User created successfully", user, token });
    // console.log("User created beautifully.");
  } catch (error) {
    console.error("Signup error:", error.message); // ✅ Safe error logging
    res.status(400).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  // console.log("I'm in the back logging in ...");
  try {
    const { username, password } = req.body;
    // console.log("Username: ", username);
    // console.log("Password: ", password);

    const user = await User.findOne({ username });
    // console.log("User found:", user);

    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    // console.log("Found Username: ", user.username);
    // console.log("Found Password: ", user.password);
    // console.log("Entered Password: ", password);
    // console.log("🔹 Entered Password:", req.body.password);

    // console.log("Entered Password Length:", password.length);
    // console.log("Stored Password Hash Length:", user.password.length);

    // console.log("Type of Entered Password:", typeof password);
    // console.log("Type of Stored Hashed Password:", typeof user.password);

    // console.log("Comparing passwords...");
    const isMatch = await bcrypt.compare(password, user.password);
    // console.log("Is Match: ", isMatch);

    if (!isMatch) {
      // console.log("Password does not match");
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // console.log("Password matched!");

    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // console.log("Token: ", token);
    // console.log("Login succesfukl");
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

const crypto = require("crypto");

exports.passwordResetRequest = async (req, res) => {
  // console.log("I'm in the back requesting password reset ...");
  const { email } = req.body;
  // console.log("Email: ", email);

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const resetToken = crypto.randomBytes(32).toString("hex");
    // console.log("Reset TOken? : ", resetToken);
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = Date.now() + 3600000;
    await user.save();

    const resetLink = `habitapp://password-reset/${user.username}/${resetToken}`;

    res.json({
      message: "Password reset token generated",
      resetToken,
    });
  } catch (error) {
    res.status(500).json({ error: "Error generating password reset token" });
  }
};

exports.passwordReset = async (req, res) => {
  // console.log("I'm in the back resetting passwrord ...");
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
