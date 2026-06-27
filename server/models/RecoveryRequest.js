const mongoose = require("mongoose");

const recoveryRequestSchema = new mongoose.Schema(
  {
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: [true, "Item is required"],
    },
    claimant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Claimant is required"],
    },
    finder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Finder is required"],
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    message: {
      type: String,
      trim: true,
      maxlength: [500, "Message must be at most 500 characters"],
      default: "",
    },
    readByFinder: {
      type: Boolean,
      default: false,
    },
    readByClaimant: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Prevent a claimant from submitting more than one PENDING request for the same item.
// A claimant may re-submit after their previous request was rejected.
recoveryRequestSchema.index(
  { item: 1, claimant: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: { status: "pending" },
    name: "unique_pending_per_claimant_per_item",
  }
);

// Fast lookups for "sent" and "received" views
recoveryRequestSchema.index({ claimant: 1, createdAt: -1 });
recoveryRequestSchema.index({ finder: 1, createdAt: -1 });

module.exports = mongoose.model("RecoveryRequest", recoveryRequestSchema);
