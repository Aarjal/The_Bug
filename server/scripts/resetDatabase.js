require("dotenv").config();

const mongoose = require("mongoose");

const connectDB = require("../config/db");

const User = require("../models/User");
const Item = require("../models/Item");
const Notification = require("../models/Notification");
const RecoveryRequest = require("../models/RecoveryRequest");

const resetDatabase = async () => {
  try {
    await connectDB();

    console.log("Connected to MongoDB");

    await Item.deleteMany({});
    console.log("✓ Items deleted");

    await Notification.deleteMany({});
    console.log("✓ Notifications deleted");

    await RecoveryRequest.deleteMany({});
    console.log("✓ Recovery requests deleted");

    await User.deleteMany({
      role: { $ne: "admin" },
    });

    console.log("✓ Non-admin users deleted");

    console.log("\nDatabase reset completed successfully!");

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

resetDatabase();