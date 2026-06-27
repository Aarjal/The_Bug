const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { getProfile, updateProfile } = require("../controllers/userController");

// All profile endpoints require authentication
router.use(protect);

router.get("/profile", getProfile);
router.patch("/profile", updateProfile);

module.exports = router;
