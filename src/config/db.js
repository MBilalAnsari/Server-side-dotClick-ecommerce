import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

// Use native promises
mongoose.Promise = global.Promise;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`!...MongoDB Connected ✅`);

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
