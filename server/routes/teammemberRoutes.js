const express = require("express");
const {
  addTeamMember,
  getAllTeamMembers,
  getTeamMember,
  updateTeamMember,
  deleteTeamMember,
} = require("../controllers/teamMemberController");
const { protect } = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/:username", protect, addTeamMember);
router.get("/:username", protect, getAllTeamMembers);
router.get("/:username/:teamMember_id", protect, getTeamMember);
router.patch("/:username/:teamMember_id", protect, updateTeamMember);
router.delete("/:username/:teamMember_id", protect, deleteTeamMember);

module.exports = router;
