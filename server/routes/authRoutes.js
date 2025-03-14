const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const User = require("../models/User");
const {
  signup,
  login,
  logout,
  passwordResetRequest,
  passwordReset,
} = require("../controllers/authController");
const { protect } = require("../middlewares/authMiddleware");

router.post("/signup", signup);
router.post("/login", login);
router.get("/protected-route", protect, (req, res) => {
  res.json({ message: "You are authenticated", user: req.user });
});
router.post("/logout", logout);
router.post("/password-reset-request", passwordResetRequest);
router.post("/password-reset", passwordReset);

module.exports = router;
