const Item = require("../models/Item");
const matchingService = require("../services/matchingService");

// --------------------------------------------------
// POST /api/items
// Create a new lost or found item.
// Only authenticated users can create items.
// userId is set from the JWT (req.user), not the request body.
// --------------------------------------------------
const createItem = async (req, res) => {
  try {
    const { type, title, category, description, image, location, dateLost, dateFound } = req.body;

    const item = await Item.create({
      userId: req.user._id,
      type,
      title,
      category,
      description,
      image,
      location,
      dateLost: dateLost || null,
      dateFound: dateFound || null,
    });

    // Trigger matching checks (run asynchronously so we don't block response)
    matchingService.checkMatches(item);

    res.status(201).json(item);
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(", ") });
    }
    res.status(500).json({ message: "Server error" });
  }
};

// --------------------------------------------------
// GET /api/items/:id
// Get a single item by ID.
// Public — no authentication required.
// Populates the userId field with username and profilePicture.
// --------------------------------------------------
const getItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate(
      "userId",
      "username profilePicture"
    );

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.json(item);
  } catch (error) {
    // Handle invalid ObjectId format
    if (error.kind === "ObjectId") {
      return res.status(404).json({ message: "Item not found" });
    }
    res.status(500).json({ message: "Server error" });
  }
};

// --------------------------------------------------
// GET /api/items/my-posts
// Get all items created by the currently logged-in user.
// Sorted by newest first.
// --------------------------------------------------
const getMyItems = async (req, res) => {
  try {
    const items = await Item.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });

    res.json(items);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// --------------------------------------------------
// PUT /api/items/:id
// Update an existing item.
// Only the item owner can update.
// Prevents changing userId, status, and type after creation.
// --------------------------------------------------
const updateItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Ownership check
    if (item.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this item" });
    }

    // Only allow updating these fields
    const allowedUpdates = ["title", "category", "description", "image", "location", "dateLost", "dateFound"];
    const updates = {};

    for (const field of allowedUpdates) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const updatedItem = await Item.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (updatedItem) {
      // Trigger matching checks for the updated item
      matchingService.checkMatches(updatedItem);
    }

    res.json(updatedItem);
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(", ") });
    }
    if (error.kind === "ObjectId") {
      return res.status(404).json({ message: "Item not found" });
    }
    res.status(500).json({ message: "Server error" });
  }
};

// --------------------------------------------------
// PATCH /api/items/:id/resolve
// Mark an item as resolved.
// Only the item owner can resolve their item.
// --------------------------------------------------
const resolveItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    if (item.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to resolve this item" });
    }

    if (item.status === "resolved") {
      return res.status(400).json({ message: "Item is already resolved" });
    }

    item.status = "resolved";
    await item.save();

    res.json(item);
  } catch (error) {
    if (error.kind === "ObjectId") {
      return res.status(404).json({ message: "Item not found" });
    }
    res.status(500).json({ message: "Server error" });
  }
};

// --------------------------------------------------
// DELETE /api/items/:id
// Delete an item.
// Only the item owner can delete.
// --------------------------------------------------
const deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    if (item.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this item" });
    }

    await Item.findByIdAndDelete(req.params.id);

    res.json({ message: "Item deleted" });
  } catch (error) {
    if (error.kind === "ObjectId") {
      return res.status(404).json({ message: "Item not found" });
    }
    res.status(500).json({ message: "Server error" });
  }
};

// --------------------------------------------------
// GET /api/items/:id/matches
// Get potential dynamic matches for a specific item.
// Only the item owner can retrieve potential matches.
// --------------------------------------------------
const getItemMatches = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    if (item.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to view matches for this item" });
    }

    const matches = await matchingService.getMatchesForItem(item);
    res.json(matches);
  } catch (error) {
    if (error.kind === "ObjectId") {
      return res.status(404).json({ message: "Item not found" });
    }
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createItem,
  getItem,
  getMyItems,
  updateItem,
  resolveItem,
  deleteItem,
  getItemMatches,
};
