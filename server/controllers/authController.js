const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

exports.signup = async (req, res) => {
  console.log("Creating a new account...");
  try {
    console.log("Received Password at Signup:", req.body.password);
    const password = req.body.password;
    console.log("Password: ", password);

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
    console.log("Hashed Password: ", hashedPassword);

    const user = await User.create({
      username: req.body.username,
      password: hashedPassword,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      profilePic: req.body.profilePic,
    });

    const storedUser = await User.findOne({ username: req.body.username });

    console.log("🔹 Stored Hashed Password in DB:", storedUser.password);
    console.log(
      "🔹 Does Stored Hash Match Hashed Password Before Storing?:",
      storedUser.password === hashedPassword
    );

    const token = jwt.sign(
      { userId: user._id, username: user.username }, // ✅ Removed `password`
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    console.log("User created: ", user._id); // ✅ Safe logging

    res.status(201).json({ message: "User created successfully", user, token });
  } catch (error) {
    console.error("Signup error:", error.message); // ✅ Safe error logging
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
    console.log("🔹 Entered Password:", req.body.password);

    console.log("Entered Password Length:", password.length);
    console.log("Stored Password Hash Length:", user.password.length);

    console.log("Type of Entered Password:", typeof password);
    console.log("Type of Stored Hashed Password:", typeof user.password);

    console.log("Comparing passwords...");
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Is Match: ", isMatch);

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
