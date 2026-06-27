const RecoveryRequest = require("../models/RecoveryRequest");
const Item = require("../models/Item");

const Notification = require("../models/Notification");

// Reusable populate specs
const USER_FIELDS_SAFE = "username profilePicture";
const USER_FIELDS_CONTACT = "username profilePicture contactMethod contactValue";
const ITEM_FIELDS = "title category type status location image";

// Helper to sanitize requests before sending to client
const sanitizeRequests = (requests, role) => {
  return requests.map((req) => {
    const reqObj = req.toObject ? req.toObject() : req;

    if (reqObj.status !== "accepted") {
      // Strip contact info for non-accepted status
      if (reqObj.finder) {
        delete reqObj.finder.contactMethod;
        delete reqObj.finder.contactValue;
      }
      if (reqObj.claimant) {
        delete reqObj.claimant.contactMethod;
        delete reqObj.claimant.contactValue;
      }
    } else {
      // Expose only relevant contact details for accepted status
      if (role === "claimant") {
        if (reqObj.claimant) {
          delete reqObj.claimant.contactMethod;
          delete reqObj.claimant.contactValue;
        }
      } else if (role === "finder") {
        if (reqObj.finder) {
          delete reqObj.finder.contactMethod;
          delete reqObj.finder.contactValue;
        }
      }
    }
    return reqObj;
  });
};

// ---------------------------------------------------------------------------
// POST /api/recovery-requests
// Create a recovery request for a found item
// ---------------------------------------------------------------------------
const createRequest = async (req, res) => {
  try {
    const { itemId, message } = req.body;
    const claimantId = req.user._id;

    // 1. Validate payload
    if (!itemId) {
      return res.status(400).json({ message: "itemId is required" });
    }

    // 2. Fetch the item
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    // 3. Only allow requests against FOUND items
    if (item.type !== "found") {
      return res
        .status(400)
        .json({ message: "Recovery requests can only be sent for found items" });
    }

    // 4. Item must still be active
    if (item.status !== "active") {
      return res
        .status(400)
        .json({ message: "This item has already been resolved" });
    }

    // 5. A user cannot claim their own posted item
    if (item.userId.toString() === claimantId.toString()) {
      return res
        .status(400)
        .json({ message: "You cannot send a recovery request for your own item" });
    }

    // 6. Prevent duplicate pending request
    const existing = await RecoveryRequest.findOne({
      item: itemId,
      claimant: claimantId,
      status: "pending",
    });
    if (existing) {
      return res.status(409).json({
        message: "You already have a pending recovery request for this item",
      });
    }

    // 7. Create the request — finder is the item owner
    const recoveryRequest = await RecoveryRequest.create({
      item: itemId,
      claimant: claimantId,
      finder: item.userId,
      message: message || "",
    });

    // 8. Return populated response (no contact details on creation since status is pending)
    const populated = await recoveryRequest.populate([
      { path: "item", select: ITEM_FIELDS },
      { path: "claimant", select: USER_FIELDS_SAFE },
      { path: "finder", select: USER_FIELDS_SAFE },
    ]);

    return res.status(201).json({
      message: "Recovery request sent successfully",
      request: populated,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "You already have a pending recovery request for this item",
      });
    }
    console.error("createRequest error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ---------------------------------------------------------------------------
// GET /api/recovery-requests/sent
// Requests sent BY the logged-in user (claimant view)
// ---------------------------------------------------------------------------
const getSentRequests = async (req, res) => {
  try {
    const requests = await RecoveryRequest.find({ claimant: req.user._id })
      .sort({ createdAt: -1 })
      .populate("item", ITEM_FIELDS)
      .populate("claimant", USER_FIELDS_SAFE)
      .populate("finder", USER_FIELDS_CONTACT);

    const sanitized = sanitizeRequests(requests, "claimant");

    return res.json({ requests: sanitized });
  } catch (error) {
    console.error("getSentRequests error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ---------------------------------------------------------------------------
// GET /api/recovery-requests/received
// Requests received BY the logged-in user (finder view)
// ---------------------------------------------------------------------------
const getReceivedRequests = async (req, res) => {
  try {
    const requests = await RecoveryRequest.find({ finder: req.user._id })
      .sort({ createdAt: -1 })
      .populate("item", ITEM_FIELDS)
      .populate("claimant", USER_FIELDS_CONTACT)
      .populate("finder", USER_FIELDS_SAFE);

    const sanitized = sanitizeRequests(requests, "finder");

    return res.json({ requests: sanitized });
  } catch (error) {
    console.error("getReceivedRequests error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ---------------------------------------------------------------------------
// Shared helper — update status; only the finder may act
// ---------------------------------------------------------------------------
const updateStatus = async (req, res, newStatus) => {
  try {
    const { id } = req.params;
    const finderId = req.user._id;

    const recoveryRequest = await RecoveryRequest.findById(id);
    if (!recoveryRequest) {
      return res.status(404).json({ message: "Recovery request not found" });
    }

    // Authorization: only the finder may accept/reject
    if (recoveryRequest.finder.toString() !== finderId.toString()) {
      return res
        .status(403)
        .json({ message: "Only the finder can respond to this request" });
    }

    // Only pending requests can be acted upon
    if (recoveryRequest.status !== "pending") {
      return res.status(400).json({
        message: `Request has already been ${recoveryRequest.status}`,
      });
    }

    recoveryRequest.status = newStatus;
    await recoveryRequest.save();

    const populated = await recoveryRequest.populate([
      { path: "item", select: ITEM_FIELDS },
      { path: "claimant", select: USER_FIELDS_CONTACT },
      { path: "finder", select: USER_FIELDS_SAFE },
    ]);

    // Create a Notification for the Claimant
    const actionLabel = newStatus === "accepted" ? "accepted" : "rejected";
    await Notification.create({
      userId: recoveryRequest.claimant,
      itemId: recoveryRequest.item,
      relatedItemId: recoveryRequest.item,
      message: `Your recovery request for "${populated.item.title}" has been ${actionLabel} by the finder.`,
    });

    const sanitized = sanitizeRequests([populated], "finder")[0];

    return res.json({
      message: `Recovery request ${newStatus}`,
      request: sanitized,
    });
  } catch (error) {
    console.error(`updateStatus(${newStatus}) error:`, error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ---------------------------------------------------------------------------
// PATCH /api/recovery-requests/:id/accept
// ---------------------------------------------------------------------------
const acceptRequest = (req, res) => updateStatus(req, res, "accepted");

// ---------------------------------------------------------------------------
// PATCH /api/recovery-requests/:id/reject
// ---------------------------------------------------------------------------
const rejectRequest = (req, res) => updateStatus(req, res, "rejected");

module.exports = {
  createRequest,
  getSentRequests,
  getReceivedRequests,
  acceptRequest,
  rejectRequest,
};
