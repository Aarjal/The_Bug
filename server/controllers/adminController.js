const User = require("../models/User");
const Item = require("../models/Item");
const RecoveryRequest = require("../models/RecoveryRequest");
const Notification = require("../models/Notification");

/**
 * GET /api/admin/dashboard
 * Returns platform-wide analytics for the admin dashboard.
 *
 * All heavy counts use MongoDB aggregation pipelines so counting
 * happens on the database server, not in Node.js memory.
 * The five independent queries run in parallel via Promise.all.
 */
const getDashboard = async (req, res) => {
  try {
    const [userStats, itemStats, recoveryStats, notificationCount, recentActivity] =
      await Promise.all([
        // ── 1. User statistics ──────────────────────────────────
        User.aggregate([
          {
            $group: {
              _id: "$role",
              count: { $sum: 1 },
            },
          },
        ]),

        // ── 2. Item statistics (type + status + category in one trip) ──
        Item.aggregate([
          {
            $facet: {
              byType: [{ $group: { _id: "$type", count: { $sum: 1 } } }],
              byStatus: [{ $group: { _id: "$status", count: { $sum: 1 } } }],
              byCategory: [{ $group: { _id: "$category", count: { $sum: 1 } } }],
            },
          },
        ]),

        // ── 3. Recovery request statistics ──────────────────────
        RecoveryRequest.aggregate([
          {
            $group: {
              _id: "$status",
              count: { $sum: 1 },
            },
          },
        ]),

        // ── 4. Notification count ───────────────────────────────
        Notification.countDocuments(),

        // ── 5. Recent activity (10 newest items) ────────────────
        Item.find()
          .sort({ createdAt: -1 })
          .limit(10)
          .populate("userId", "username")
          .select("title type status createdAt userId")
          .lean(),
      ]);

    // ── Transform raw aggregation results into clean objects ──

    // Users
    const users = { total: 0, admins: 0 };
    for (const bucket of userStats) {
      users.total += bucket.count;
      if (bucket._id === "admin") users.admins = bucket.count;
    }

    // Items
    const items = { totalLost: 0, totalFound: 0, totalActive: 0, totalResolved: 0 };
    const facet = itemStats[0]; // $facet always returns a single document

    for (const bucket of facet.byType) {
      if (bucket._id === "lost") items.totalLost = bucket.count;
      if (bucket._id === "found") items.totalFound = bucket.count;
    }
    for (const bucket of facet.byStatus) {
      if (bucket._id === "active") items.totalActive = bucket.count;
      if (bucket._id === "resolved") items.totalResolved = bucket.count;
    }

    // Categories
    const categories = {};
    for (const bucket of facet.byCategory) {
      categories[bucket._id] = bucket.count;
    }

    // Recovery
    const recovery = { total: 0, pending: 0, accepted: 0, rejected: 0 };
    for (const bucket of recoveryStats) {
      recovery.total += bucket.count;
      if (bucket._id === "pending") recovery.pending = bucket.count;
      if (bucket._id === "accepted") recovery.accepted = bucket.count;
      if (bucket._id === "rejected") recovery.rejected = bucket.count;
    }

    // Recent activity — reshape populated docs
    const formattedActivity = recentActivity.map((item) => ({
      title: item.title,
      type: item.type,
      status: item.status,
      ownerUsername: item.userId?.username || "Unknown",
      createdAt: item.createdAt,
    }));

    // ── Send response ────────────────────────────────────────
    res.json({
      users,
      items,
      recovery,
      notifications: { total: notificationCount },
      categories,
      recentActivity: formattedActivity,
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);
    res.status(500).json({ message: "Failed to load dashboard analytics" });
  }
};

module.exports = { getDashboard };
