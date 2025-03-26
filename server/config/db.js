const mongoose = require("mongoose");

let dbConnected = false; // Track connection status

const connectDB = async () => {
  if (dbConnected || mongoose.connection.readyState !== 0) {
    // console.log("🔄 MongoDB already connected");
    return;
  }

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000, // ⏳ Wait 5 seconds before failing
      socketTimeoutMS: 45000,
    });

    dbConnected = true;
    // console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};

module.exports = { connectDB, dbConnected };
