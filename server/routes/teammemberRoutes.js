const express = require("express");
const {
  addTeamMember,
  getAllTeamMembers,
  getTeamMember,
  updateTeamMember,
  deleteTeamMember,
  getUserByTeamMemberId,
} = require("../controllers/teamMemberController");
const { protect } = require("../middlewares/authMiddleware");
const router = express.Router();

router.get("/:username/:teamMember_id", protect, getTeamMember);
router.patch("/:username/:teamMember_id", protect, updateTeamMember);
router.delete("/:username/:teamMember_id", protect, deleteTeamMember);
router.get("/:username", protect, getAllTeamMembers);
router.post("/:username", protect, addTeamMember);
router.get("/:teamMember_id", protect, getUserByTeamMemberId);

module.exports = router;
