const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

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

    console.log("Username: ", user.username);
    console.log("Saved Password: ", user.password);
    console.log("Entered Password: ", password);

    console.log("Comparing passwords...");
    if (user.password === password) {
      console.log("It is a match");
    }

    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    console.log("Token: ", token);

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
