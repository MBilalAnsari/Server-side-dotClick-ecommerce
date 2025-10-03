import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // serverSelectionTimeoutMS: 30000, // 30 seconds
      // socketTimeoutMS: 45000, // 45 seconds
      // bufferCommands: false,
      // bufferMaxEntries: 0,
      // maxPoolSize: 10, // Maintain up to 10 socket connections
      // minPoolSize: 5, // Maintain a minimum of 5 socket connections
      // maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
      // retryWrites: true,
      // w: 'majority'
    });

    console.log(`!...MongoDB Connected:`);

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
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
