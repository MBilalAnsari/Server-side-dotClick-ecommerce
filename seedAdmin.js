import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "../src/models/User.js";
import connectDB from "../src/config/db.js";

dotenv.config();

const createAdminUser = async () => {
  try {
    // Connect to database
    await connectDB();

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: "admin" });

    if (existingAdmin) {
      console.log("Admin user already exists:", existingAdmin.email);
      process.exit(0);
    }

    // Create admin user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("Admin@123", salt);

    const adminUser = await User.create({
      username: "Admin User",
      email: "admin@dotclick.com",
      password: hashedPassword,
      phone: "+1234567890",
      role: "admin",
      profileImage: "",
    });

    console.log("Admin user created successfully!");
    console.log("Email: admin@dotclick.com");
    console.log("Password: Admin@123");
    console.log("User ID:", adminUser._id);

    process.exit(0);
  } catch (error) {
    console.error("Error creating admin user:", error.message);
    process.exit(1);
  }
};

// Run the seeder
createAdminUser();
