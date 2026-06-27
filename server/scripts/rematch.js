// One-time script to re-run matching for all active items
require("dotenv").config();
const mongoose = require("mongoose");
const Item = require("../models/Item");
const { checkMatches } = require("../services/matchingService");

async function rematch() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    const activeItems = await Item.find({ status: "active" });
    console.log(`Found ${activeItems.length} active items. Re-running matching...`);

    for (const item of activeItems) {
      console.log(`\nRe-matching: "${item.title}" (${item.type})`);
      await checkMatches(item);
    }

    console.log("\nDone! All active items re-matched.");
    process.exit(0);
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
}

rematch();
