const express = require("express");
const {
  createItem,
  getItem,
  getMyItems,
  updateItem,
  resolveItem,
  deleteItem,
  getItemMatches,
} = require("../controllers/itemController");
const { getFeed } = require("../controllers/feedController");
const { protect } = require("../middleware/auth");

const router = express.Router();

// Public feed (must be before /:id)
router.get("/", getFeed);

// Protected routes (auth required)
router.get("/my-posts", protect, getMyItems);
router.post("/", protect, createItem);
router.get("/:id/matches", protect, getItemMatches);
router.put("/:id", protect, updateItem);
router.patch("/:id/resolve", protect, resolveItem);
router.delete("/:id", protect, deleteItem);

// Public routes
router.get("/:id", getItem);

module.exports = router;
