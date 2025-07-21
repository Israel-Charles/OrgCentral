// backend/config/db.js

const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Handle connection events
    mongoose.connection.on("connected", () => {
      console.log("Mongoose Connected to MongoDB");
    });

    mongoose.connection.on("error", (err) => {
      console.err("Mongoose connection error: ", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("Mongoose disconected from MongoDB");
    });

    // Handle app termination
    process.on(`SIGINT`, async () => {
      await mongoose.connection.close();
      console.log("MongoDB connection closed due to app termination");
      process.exit(0);
    });
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
