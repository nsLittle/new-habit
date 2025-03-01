const express = require('express');
const { signup, login, logout } = require('../controllers/authController');
const { protect } = require("../middlewares/authMiddleware");
const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get("/protected-route", protect, (req, res) => {
    res.json({ message: "You are authenticated", user: req.user });
  });
router.post("/logout", logout);

module.exports = router;