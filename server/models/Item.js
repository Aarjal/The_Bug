const mongoose = require("mongoose");

const CATEGORIES = [
  "wallet",
  "phone",
  "keys",
  "bag",
  "documents",
  "electronics",
  "clothing",
  "other",
];

const itemSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["lost", "found"],
      required: [true, "Type (lost/found) is required"],
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [100, "Title must be at most 100 characters"],
    },
    category: {
      type: String,
      enum: CATEGORIES,
      required: [true, "Category is required"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [1000, "Description must be at most 1000 characters"],
    },
    image: {
      type: String,
      default: "",
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    dateLost: {
      type: Date,
      default: null,
    },
    dateFound: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ["active", "resolved"],
      default: "active",
    },
  },
  { timestamps: true }
);

// Validate that the correct date field is provided based on type
itemSchema.pre("validate", function () {
  if (this.type === "lost" && !this.dateLost) {
    this.invalidate("dateLost", "Date lost is required for lost items");
  }
  if (this.type === "found" && !this.dateFound) {
    this.invalidate("dateFound", "Date found is required for found items");
  }
});

// Indexes for common queries
itemSchema.index({ type: 1, status: 1, category: 1 });
itemSchema.index({ userId: 1 });

module.exports = mongoose.model("Item", itemSchema);
module.exports.CATEGORIES = CATEGORIES;
