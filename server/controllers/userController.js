const User = require("../models/User");
const bcrypt = require("bcrypt");

exports.checkAllUsernames = async (req, res) => {
  try {
    const { username } = req.params;
    if (!username) {
      return res.status(400).json({ error: "Username is required" });
    }

    const userExists = (await User.exists({ username })) ? true : false;

    return res.status(200).json(userExists);
  } catch (error) {
    console.error("Error checking username:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.checkAllEmails = async (req, res) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const user = await User.findOne({ email });

    return res.status(200).json({ exists: !!user });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.find({ username });

    if (!user) return res.status(404).json({ message: "User not found" });

    const foundUser = Array.isArray(user) && user.length === 0 ? "" : user;

    res.status(200).json(foundUser);
  } catch (error) {
    console.error("Error in getUserProfile:", error.message);
    res.status(400).json({ error: error.message });
  }
};

exports.updateUserProfile = async (req, res) => {
  try {
    const { username } = req.params;
    const updates = req.body;

    const existingUser = await User.findOne({ username });
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== "")
    );

    if (filteredUpdates.email) {
      const existingEmail = await User.findOne({
        email: filteredUpdates.email,
        username: { $ne: username },
      });

      if (existingEmail) {
        return res.status(400).json({ message: "Email is already in use" });
      }
    }

    if (filteredUpdates.password) {
      const salt = await bcrypt.genSalt(10);
      filteredUpdates.password = await bcrypt.hash(
        filteredUpdates.password,
        salt
      );
    }

    if (filteredUpdates.profilePic === "") {
      delete filteredUpdates.profilePic;
    }

    if (Object.keys(filteredUpdates).length === 0) {
      return res.status(400).json({ message: "No changes detected" });
    }

    const updatedUser = await User.findOneAndUpdate(
      { username },
      { $set: { ...filteredUpdates } },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(400).json({ message: "Update failed" });
    }

    updatedUser.fullName = `${updatedUser.firstName} ${updatedUser.lastName}`;

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error in updateUserProfile:", error);
    res.status(400).json({ error: error.message });
  }
};

exports.deleteUserProfile = async (req, res) => {
  try {
    const { username } = req.params;
    const requester = req.user;

    if (!requester) {
      return res
        .status(403)
        .json({ message: "Unauthorized: No requester info" });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (requester.username === username) {
      user.isDeleted = true;
      await user.save();
      return res.status(200).json({ message: "User deleted (soft delete)" });
    }

    if (requester.role === "admin") {
      await User.deleteOne({ username });
      return res.status(200).json({ message: "User deleted permanently" });
    }

    return res
      .status(403)
      .json({ message: "Unauthorized to delete this user" });
  } catch (error) {
    console.error("Error in deleteUserProfile:", error.message);
    res.status(400).json({ error: error.message });
  }
};
