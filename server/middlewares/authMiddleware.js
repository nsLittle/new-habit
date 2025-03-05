const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.protect = async (req, res, next) => {
  console.log("I'm in an authorized area...");
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token)
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided" });
    console.log("Extracted token:", token);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token:", decoded);

    req.user = { id: decoded.id, username: decoded.username };

    next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized: Invalid or expired token" });
  }
};
