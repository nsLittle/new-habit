// const swaggerUi = require("swagger-ui-express");
// const YAML = require("yamljs");
// const swaggerDocument = YAML.load("server/swagger.yaml");

require("dotenv").config();

console.log("JWT_SECRET:", process.env.JWT_SECRET);
console.log("MONGO_URI:", process.env.MONGO_URI);
console.log("BASE_URL:", process.env.BASE_URL);

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");
connectDB().then(() => {
  console.log("✅ MongoDB connected. Starting the server...");
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);

    const runScheduler = require("./services/scheduler");
    runScheduler();
  });
});

const app = express();

if (!process.env.PORT) {
  console.error(
    "❌ ERROR: process.env.PORT is not set. This server is meant to run on Render."
  );
  process.exit(1);
}

const PORT = process.env.PORT; // No fallback port

// ✅ Ensure MongoDB connects before running the server & scheduler
const startServer = async () => {
  try {
    await connectDB(); // Connect to MongoDB
    console.log("✅ MongoDB connected successfully");

    // ✅ Run the scheduler **only after** MongoDB is connected
    require("./services/scheduler");

    app.options("*", cors());
    app.use(
      cors({
        origin: [
          "https://new-habit-69tm.onrender.com",
          "http://localhost:3000",
          "http://localhost:8081",
        ],
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
      })
    );
    app.use(express.json());

    app.use((req, res, next) => {
      console.log(`Incoming Request: ${req.method} ${req.url}`);
      next();
    });

    // API Routes
    const authRoutes = require("./routes/authRoutes");
    app.use("/auth", authRoutes);

    const userRoutes = require("./routes/userRoutes");
    app.use("/user", userRoutes);

    const habitRoutes = require("./routes/habitRoutes");
    app.use("/habit", habitRoutes);

    const teamMemberRoutes = require("./routes/teammemberRoutes");
    app.use("/teammember", teamMemberRoutes);

    const feedbackRoutes = require("./routes/feedbackRoutes");
    app.use("/feedback", feedbackRoutes);

    const notificationRoutes = require("./routes/notificationRoutes");
    app.use("/notification", notificationRoutes);

    const reminderRoutes = require("./routes/reminderRoutes");
    app.use("/reminders", reminderRoutes);

    // Logging registered routes
    app._router.stack.forEach((r) => {
      if (r.route && r.route.path) {
        console.log(
          `Registered Route: ${r.route.path} [${Object.keys(r.route.methods)
            .join(", ")
            .toUpperCase()}]`
        );
      }
    });

    // ✅ Start the server only after DB connection is successful
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Error starting server:", error);
    process.exit(1); // Stop execution if DB connection fails
  }
};

// ✅ Run the `startServer()` function
startServer();
