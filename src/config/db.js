import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const connectDB = async () => {
  try {
    // Simple check - if no MONGO_URI, skip database
    if (!process.env.MONGO_URI || process.env.MONGO_URI.startsWith('#')) {
      console.log("📝 Running in demo mode - no database configured");
      return;
    }

    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
 
  } catch (error) {
    console.log("📝 Database not available - running in demo mode");
    // Continue without database for demo purposes
  }
};

export default connectDB;
