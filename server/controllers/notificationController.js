const Notification = require("../models/Notification");

// --------------------------------------------------
// GET /api/notifications
// Get all notifications for the currently logged-in user.
// Sorted by newest first. Populates related items.
// --------------------------------------------------
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .populate("itemId", "title type category status image location")
      .populate("relatedItemId", "title type category status image location")
      .sort({ createdAt: -1 });

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// --------------------------------------------------
// GET /api/notifications/unread-count
// Get the number of unread notifications for the user.
// --------------------------------------------------
const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      userId: req.user._id,
      read: false,
    });

    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// --------------------------------------------------
// PATCH /api/notifications/:id/read
// Mark a specific notification as read.
// Only the recipient can mark it as read.
// --------------------------------------------------
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    // Ownership check
    if (notification.userId.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this notification" });
    }

    notification.read = true;
    await notification.save();

    res.json(notification);
  } catch (error) {
    if (error.kind === "ObjectId") {
      return res.status(404).json({ message: "Notification not found" });
    }
    res.status(500).json({ message: "Server error" });
  }
};

// --------------------------------------------------
// PATCH /api/notifications/read-all
// Mark all notifications for the authenticated user as read.
// --------------------------------------------------
const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user._id, read: false },
      { $set: { read: true } }
    );

    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// --------------------------------------------------
// DELETE /api/notifications/:id
// Delete a specific notification.
// Only the recipient can delete it.
// --------------------------------------------------
const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    // Ownership check
    if (notification.userId.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this notification" });
    }

    await Notification.findByIdAndDelete(req.params.id);

    res.json({ message: "Notification deleted" });
  } catch (error) {
    if (error.kind === "ObjectId") {
      return res.status(404).json({ message: "Notification not found" });
    }
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};
