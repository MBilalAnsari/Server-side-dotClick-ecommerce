import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

// Use native promises
mongoose.Promise = global.Promise;

const connectDB = async () => {
  try {
    // Check if MONGO_URI exists
    if (!process.env.MONGO_URI) {
      console.log("⚠️  MONGO_URI not found - running in demo mode without database");
      return;
    }

    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });
    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
    });

  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.log("🔄 Running in demo mode without database connection");
    // Don't exit process - allow app to run without DB for demo purposes
  }
};

export default connectDB;
