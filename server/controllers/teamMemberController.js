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

    // console.log(`Adding team member for user: ${username}`);

    if (!teamMemberFirstName || !teamMemberLastName || !teamMemberEmail) {
      return res.status(400).json({ message: "Required fields are missing" });
    }

    const user = await User.findOne({ username });

    // console.log("User Found:", username);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // console.log(`User found: ${user._id}`);

    const newTeamMember = await TeamMember.create({
      teamMemberFirstName,
      teamMemberLastName,
      teamMemberEmail,
      teamMemberProfilePic,
      user: user._id,
      teamMemberId: new mongoose.Types.ObjectId().toString(),
    });

    // console.log("Team Member Created:", newTeamMember);

    res.status(201).json({
      message: "Team member added successfully",
      teamMember: newTeamMember,
    });
  } catch (error) {
    console.error("Error adding team member:", error.message);
    res.status(500).json({ error: "Failed to add team member" });
  }
};

exports.getAllTeamMembers = async (req, res) => {
  // console.log("I'm getting team members!");
  try {
    const { username } = req.params;
    // console.log("Fetching team members for:", username);

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

exports.getTeamMember = async (req, res) => {
  try {
    const { username, teamMember_id } = req.params;

    // console.log(`Fetching team member ${teamMember_id} for user ${username}`);

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!mongoose.Types.ObjectId.isValid(teamMember_id)) {
      return res.status(400).json({ message: "Invalid teamMember_id format" });
    }

    const teamMember = await TeamMember.findOne({
      _id: teamMember_id,
      user: user._id,
    });

    if (!teamMember) {
      return res.status(404).json({ message: "Team member not found" });
    }

    res.status(200).json({
      message: "Team member retrieved successfully",
      teamMember,
    });
  } catch (error) {
    console.error("Error retrieving team member:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.updateTeamMember = async (req, res) => {
  // console.log("I'm updating team members!");
  // console.log("req.params:", req.params);
  try {
    const { username, teamMember_id } = req.params;
    // console.log("Username:", username);
    // console.log("Team Member ID:", teamMember_id);

    const user = await User.findOne({ username });
    // console.log("User: ", user);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!mongoose.Types.ObjectId.isValid(teamMember_id)) {
      // console.log("Invalid teamMember_id format");
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

    // console.log("Updated team member:", updatedTeamMember);

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
  // console.log("I'm here to delete a team member...");
  try {
    const { teamMember_id } = req.params;
    console.log("Req Params: ", req.params);
    const userIdFromToken = req.user.id;

    // console.log("Received DELETE request for teamMember_id:", teamMember_id);
    // console.log("Authenticated User ID:", userIdFromToken);

    if (!mongoose.Types.ObjectId.isValid(teamMember_id)) {
      console.error("Invalid ObjectId format:", teamMember_id);
      return res.status(400).json({ error: "Invalid team member ID format" });
    }

    const teamMember = await TeamMember.findOne({
      _id: new mongoose.Types.ObjectId(teamMember_id),
      user: new mongoose.Types.ObjectId(userIdFromToken),
    });

    // console.log("Fetched Team Member:", teamMember);

    if (!teamMember) {
      console.warn("Team member not found or does not belong to user.");
      return res
        .status(404)
        .json({ message: "Team member not found or unauthorized." });
    }

    const result = await TeamMember.deleteOne({ _id: teamMember._id });

    if (result.deletedCount === 0) {
      console.warn("Failed to delete team member.");
      return res.status(500).json({ error: "Failed to delete team member." });
    }

    // console.log("Deleted Team Member:", teamMember);
    res.status(200).json({ message: "Team member deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete team member" });
  }
};
