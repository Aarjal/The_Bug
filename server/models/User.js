const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      minlength: [3, "Username must be at least 3 characters"],
      maxlength: [30, "Username must be at most 30 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // exclude from queries by default
    },
    profilePicture: {
      type: String,
      default: "",
    },
    location: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    contactMethod: {
      type: String,
      enum: {
        values: ["Phone", "WhatsApp", "Email", "Facebook", "Instagram", "Telegram", "Other", ""],
        message: "{VALUE} is not a supported contact method"
      },
      trim: true,
      default: "",
    },
    contactValue: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

// Validate that if either contactMethod or contactValue is provided, both must be provided.
userSchema.pre("validate", function () {
  const method = this.contactMethod ? this.contactMethod.trim() : "";
  const value = this.contactValue ? this.contactValue.trim() : "";

  if (method && !value) {
    this.invalidate("contactValue", "Contact value is required when contact method is specified");
  }
  if (!method && value) {
    this.invalidate("contactMethod", "Contact method is required when contact value is specified");
  }
});

// Hash password before saving
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
