const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/auth");
const { getDashboard } = require("../controllers/adminController");

// All admin routes require authentication + admin role
router.use(protect, admin);

// GET /api/admin/dashboard — platform analytics
router.get("/dashboard", getDashboard);

module.exports = router;
