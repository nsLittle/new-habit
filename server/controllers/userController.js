const User = require("../models/User");

exports.checkAllUsernames = async (req, res) => {
  console.log("I'm here checkign users...");
  try {
    const { username } = req.params;

    console.log("Usernmae: ", username);
    if (!username) {
      console.log("No username given");
      return res.status(400).json({ error: "Username is required" });
    }

    const userExists = (await User.exists({ username })) ? true : false;
    console.log(userExists);

    return res.status(200).json(userExists);
  } catch (error) {
    console.error("Error checking username:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    console.log("Request for username:", req.params.username);
    const { username } = req.params;
    console.log("Username: ", username);

    const user = await User.find({ username });
    console.log("MongoDB user found:", user);

    if (!user) return res.status(404).json({ message: "User not found" });

    const foundUser = Array.isArray(user) && user.length === 0 ? "" : user;

    console.log("Found User: ", foundUser);

    res.status(200).json(foundUser);
  } catch (error) {
    console.error("Error in getUserProfile:", error.message);
    res.status(400).json({ error: error.message });
  }
};

exports.updateUserProfile = async (req, res) => {
  try {
    const { username } = req.params;
    let updates = req.body;

    console.log("Updating Profile for:", username);
    console.log("Update Data:", updates);

    const existingUser = await User.findOne({ username });
    if (!existingUser) {
      console.log("User not found in database");
      return res.status(404).json({ message: "User not found" });
    }

    console.log("Existing User Found:", existingUser);

    delete updates.username;

    if (updates.password === "********") {
      delete updates.password;
    } else if (updates.password) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(updates.password, salt);
    }

    console.log("Filtered Updates Object:", updates);

    const updatedUser = await User.findOneAndUpdate(
      { username },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res
      .status(200)
      .json({ message: "Profile updated successfully", user: updatedUser });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteUserProfile = async (req, res) => {
  try {
    const { username } = req.params;
    const requester = req.user;

    console.log("Requester:", requester);
    console.log("Requested username for deletion:", username);

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
