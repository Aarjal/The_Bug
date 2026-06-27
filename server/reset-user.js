require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");

// Read arguments
const email = process.argv[2];
const newPassword = process.argv[3];
const makeAdmin = process.argv[4] === "admin";

if (!email || !newPassword) {
  console.log("\nUsage: node reset-user.js <email> <newPassword> [admin]");
  console.log("Example: node reset-user.js test@example.com mynewpassword123 admin\n");
  process.exit(1);
}

const run = async () => {
  try {
    console.log("Connecting to database...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected!");

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      console.error(`Error: User with email "${email}" not found.`);
      process.exit(1);
    }

    console.log(`Found user: ${user.username} (${user.email})`);
    
    // Update password (Mongoose pre-save hook will automatically hash this)
    user.password = newPassword;

    // Optional admin promotion
    if (makeAdmin) {
      user.role = "admin";
      console.log("Promoting user to 'admin' role...");
    }

    await user.save();
    console.log("\nSuccess! User updated successfully.");
    console.log(`Username: ${user.username}`);
    console.log(`Password reset to: ${newPassword}`);
    console.log(`Role: ${user.role}\n`);
    
    process.exit(0);
  } catch (error) {
    console.error("Error updating user:", error.message);
    process.exit(1);
  }
};

run();
