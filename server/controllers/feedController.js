const Item = require("../models/Item");

// Helper to escape regex special characters for safe search/filter queries
const escapeRegex = (string) => {
  return string.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

// --------------------------------------------------
// GET /api/items
// Home Feed — returns paginated, filtered, sorted items.
//
// Query parameters:
//   page     — page number (default: 1)
//   limit    — items per page (default: 12, max: 50)
//   q        — search query for title and description (case-insensitive)
//   type     — filter by type ("lost" or "found")
//   category — filter by category (e.g. "wallet", "phone")
//   status   — filter by status ("active" or "resolved")
//   location — partial match filter for location (case-insensitive)
//   sort     — sort order ("newest" or "oldest", default: "newest")
//
// Sorting:
//   Active items appear first, then resolved.
//   Within each group, sorted by newest or oldest.
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

    // 1. Text Search (q) - case-insensitive match on title or description
    if (req.query.q && typeof req.query.q === "string" && req.query.q.trim() !== "") {
      const escapedQ = escapeRegex(req.query.q.trim());
      const searchRegex = new RegExp(escapedQ, "i");
      filter.$or = [
        { title: searchRegex },
        { description: searchRegex }
      ];
    }

    // 2. Type Filter (type) - must be "lost" or "found"
    if (req.query.type && ["lost", "found"].includes(req.query.type)) {
      filter.type = req.query.type;
    }

    // 3. Category Filter (category)
    if (req.query.category && typeof req.query.category === "string" && req.query.category.trim() !== "") {
      filter.category = req.query.category.trim().toLowerCase();
    }

    // 4. Status Filter (status) - must be "active" or "resolved"
    if (req.query.status && ["active", "resolved"].includes(req.query.status)) {
      filter.status = req.query.status;
    }

    // 5. Location Filter (location) - case-insensitive partial match
    if (req.query.location && typeof req.query.location === "string" && req.query.location.trim() !== "") {
      const escapedLocation = escapeRegex(req.query.location.trim());
      filter.location = new RegExp(escapedLocation, "i");
    }

    // Determine sorting options
    // Default is "newest": status ascending (active then resolved), createdAt descending
    // If "oldest": status ascending, createdAt ascending
    const sortOrder = req.query.sort === "oldest" ? 1 : -1;
    const sortOptions = { status: 1, createdAt: sortOrder };

    // Count total matching documents (for pagination metadata)
    const total = await Item.countDocuments(filter);
    const totalPages = Math.ceil(total / limit) || 1;

    // Fetch items: active first, then sorted by newest/oldest within each group
    const items = await Item.find(filter)
      .sort(sortOptions)
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
    console.error("Error in getFeed:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getFeed };

