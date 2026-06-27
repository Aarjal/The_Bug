const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  createRequest,
  getSentRequests,
  getReceivedRequests,
  acceptRequest,
  rejectRequest,
  getUnreadClaimsCount,
  markClaimsRead,
} = require("../controllers/recoveryRequestController");

// All recovery request routes require authentication
router.use(protect);

// POST   /api/recovery-requests          — submit a new request
router.post("/", createRequest);

// GET    /api/recovery-requests/unread-count
router.get("/unread-count", getUnreadClaimsCount);

// PATCH  /api/recovery-requests/mark-read
router.patch("/mark-read", markClaimsRead);

// GET    /api/recovery-requests/sent     — requests I sent (claimant view)
router.get("/sent", getSentRequests);

// GET    /api/recovery-requests/received — requests I received (finder view)
router.get("/received", getReceivedRequests);

// PATCH  /api/recovery-requests/:id/accept
router.patch("/:id/accept", acceptRequest);

// PATCH  /api/recovery-requests/:id/reject
router.patch("/:id/reject", rejectRequest);

module.exports = router;
