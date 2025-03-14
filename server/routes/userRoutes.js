const express = require("express");
const {
  getUserProfile,
  updateUserProfile,
  deleteUserProfile,
  checkAllUsernames,
  checkAllEmails,
} = require("../controllers/userController");
const { protect } = require("../middlewares/authMiddleware");
const router = express.Router();

router.get("/check/:username", checkAllUsernames);
router.get("/check-email/:email", checkAllEmails);
router.get("/:username", getUserProfile);
router.patch("/:username", protect, updateUserProfile);
router.delete("/:username", protect, deleteUserProfile);

module.exports = router;
