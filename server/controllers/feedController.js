const Item = require("../models/Item");

// --------------------------------------------------
// GET /api/items
// Home Feed — returns paginated, filtered, sorted items.
//
// Query parameters:
//   page     — page number (default: 1)
//   limit    — items per page (default: 12, max: 50)
//   category — filter by category (e.g. "wallet", "phone")
//   type     — filter by type ("lost" or "found")
//   status   — filter by status ("active" or "resolved")
//
// Sorting:
//   Active items appear first, then resolved.
//   Within each group, newest items appear first.
//
// Each item is populated with the poster's username
// and profile picture. No sensitive fields are exposed.
// --------------------------------------------------
const getFeed = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 12));
    const skip = (page - 1) * limit;

    // Build filter object from query params
    const filter = {};

    if (req.query.category) {
      filter.category = req.query.category.toLowerCase();
    }

    if (req.query.type && ["lost", "found"].includes(req.query.type)) {
      filter.type = req.query.type;
    }

    if (req.query.status && ["active", "resolved"].includes(req.query.status)) {
      filter.status = req.query.status;
    }

    // Count total matching documents (for pagination metadata)
    const total = await Item.countDocuments(filter);
    const totalPages = Math.ceil(total / limit) || 1;

    // Fetch items: active first, then newest within each group
    const items = await Item.find(filter)
      .sort({ status: 1, createdAt: -1 }) // "active" < "resolved" alphabetically
      .skip(skip)
      .limit(limit)
      .populate("userId", "username profilePicture");

    res.json({
      items,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getFeed };
