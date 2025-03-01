const mongoose = require("mongoose");
const User = require("../models/User");
const TeamMember = require("../models/TeamMember");

exports.addTeamMember = async (req, res) => {
  try {
    const { username } = req.params;
    const {
      teamMemberFirstName,
      teamMemberLastName,
      teamMemberEmail,
      teamMemberProfilePic,
    } = req.body;

    console.log(`Adding team member for user: ${username}`);

    if (!teamMemberFirstName || !teamMemberLastName || !teamMemberEmail) {
      return res.status(400).json({ message: "Required fields are missing" });
    }

    const user = await User.findOne({ username });

    console.log("User Found:", username);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log(`User found: ${user._id}`);

    const newTeamMember = await TeamMember.create({
      teamMemberFirstName,
      teamMemberLastName,
      teamMemberEmail,
      teamMemberProfilePic,
      user: user._id,
    });

    console.log("Team Member Created:", newTeamMember);

    res.status(201).json({
      message: "Team member added successfully",
      teamMember: newTeamMember,
    });
  } catch (error) {
    console.error("Error adding team member:", error.message);
    res.status(500).json({ error: "Failed to add team member" });
  }
};

exports.getTeamMembers = async (req, res) => {
  console.log("I'm getting team members!");
  try {
    const { username } = req.params;
    console.log("Fetching team members for:", username);

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const teamMembers = await TeamMember.find({ user: user._id });

    res.status(200).json({
      message: "Team members retrieved successfully",
      teamMembers,
    });
  } catch (error) {
    console.error("Error retrieving team members:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.updateTeamMember = async (req, res) => {
  console.log("I'm updating team members!");
  console.log("req.params:", req.params);
  try {
    const { username, teamMember_id } = req.params;
    console.log("Username:", username);
    console.log("Team Member ID:", teamMember_id);

    const user = await User.findOne({ username });
    console.log("User: ", user);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!mongoose.Types.ObjectId.isValid(teamMember_id)) {
      console.log("Invalid teamMember_id format");
      return res.status(400).json({ message: "Invalid teamMember_id format" });
    }

    const teamMember = await TeamMember.findOne({
      _id: teamMember_id,
      user: user,
    });
    if (!teamMember) {
      return res.status(404).json({ message: "Team member not found" });
    }

    const updatedTeamMember = await TeamMember.findOneAndUpdate(
      { _id: teamMember_id, user: user._id },
      req.body,
      { new: true, runValidators: true }
    );

    console.log("Updated team member:", updatedTeamMember);

    if (!updatedTeamMember) {
      return res.status(404).json({ message: "Team member not updated" });
    }

    res.status(200).json({
      message: "Team member updated successfully",
      teamMember: updatedTeamMember,
    });
  } catch (error) {
    console.error("Error updating team member:", error);
    res
      .status(500)
      .json({ error: error.message || "Failed to update team member" });
  }
};

exports.deleteTeamMember = async (req, res) => {
  try {
    const { teamMember_id } = req.params;

    const deletedTeamMember = await TeamMember.findByIdAndDelete(teamMember_id);

    if (!deletedTeamMember) {
      return res.status(404).json({ message: "Team member not found" });
    }

    res.status(200).json({ message: "Team member deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete team member" });
  }
};
