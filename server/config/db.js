const mongoose = require("mongoose");

let dbConnected = false;

const connectDB = async () => {
  if (dbConnected || mongoose.connection.readyState !== 0) {
    return;
  }

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    dbConnected = true;
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};

module.exports = { connectDB, dbConnected };
