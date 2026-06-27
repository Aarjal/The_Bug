const User = require("../models/User");
const generateToken = require("../utils/generateToken");

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { username, email, password, location, contactMethod, contactValue } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });
    if (existingUser) {
      const field = existingUser.email === email ? "Email" : "Username";
      return res.status(400).json({ message: `${field} already taken` });
    }

    const user = await User.create({
      username,
      email,
      password,
      location,
      contactMethod,
      contactValue,
    });
    const token = generateToken(user._id, user.role);

    res.status(201).json({
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        location: user.location,
        role: user.role,
        profilePicture: user.profilePicture,
        contactMethod: user.contactMethod,
        contactValue: user.contactValue,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    // Handle Mongoose validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(", ") });
    }
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Explicitly select password (excluded by default in schema)
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user._id, user.role);

    res.json({
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        location: user.location,
        role: user.role,
        profilePicture: user.profilePicture,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  // req.user is already attached by protect middleware
  res.json({
    _id: req.user._id,
    username: req.user.username,
    email: req.user.email,
    location: req.user.location,
    role: req.user.role,
    profilePicture: req.user.profilePicture,
  });
};

module.exports = { register, login, getMe };
