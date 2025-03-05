const express = require("express");
const {
  getUserProfile,
  updateUserProfile,
  deleteUserProfile,
  getAllUsernames,
} = require("../controllers/userController");
const { protect } = require("../middlewares/authMiddleware");
const router = express.Router();

router.get("/", getAllUsernames);
router.get("/:username", getUserProfile);
router.patch("/:username", protect, updateUserProfile);
router.delete("/:username", protect, deleteUserProfile);

module.exports = router;
