const User = require("../models/User");

// GET /api/users/profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({
      username: user.username,
      email: user.email,
      profilePicture: user.profilePicture,
      location: user.location,
      contactMethod: user.contactMethod,
      contactValue: user.contactValue,
    });
  } catch (error) {
    console.error("getProfile error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// PATCH /api/users/profile
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const allowedFields = ["username", "profilePicture", "location", "contactMethod", "contactValue"];
    
    // Check if user is trying to change username to one that is already taken
    if (req.body.username && req.body.username !== user.username) {
      const existingUser = await User.findOne({ username: req.body.username });
      if (existingUser) {
        return res.status(400).json({ message: "Username already taken" });
      }
    }

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    await user.save();

    return res.json({
      message: "Profile updated successfully",
      profile: {
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture,
        location: user.location,
        contactMethod: user.contactMethod,
        contactValue: user.contactValue,
      },
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(", ") });
    }
    console.error("updateProfile error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getProfile,
  updateProfile,
};
