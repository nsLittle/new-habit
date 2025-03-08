require("dotenv").config();

console.log("JWT_SECRET:", process.env.JWT_SECRET);
console.log("MONGO_URI:", process.env.MONGO_URI);
console.log("BASE_URL:", process.env.BASE_URL);

const express = require("express");
const cors = require("cors");
// const swaggerUi = require("swagger-ui-express");
// const YAML = require("yamljs");
// const swaggerDocument = YAML.load("server/swagger.yaml");
const connectDB = require("./config/db");

const app = express();
if (!process.env.PORT) {
  console.error(
    "❌ ERROR: process.env.PORT is not set. This server is meant to run on Render."
  );
  process.exit(1); // Stop the server from running locally
}

const PORT = process.env.PORT; // No fallback port

connectDB();

app.options("*", cors());
app.use(
  cors({
    origin: ["https://new-habit-69tm.onrender.com", "http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

app.use((req, res, next) => {
  console.log(`Incoming Request: ${req.method} ${req.url}`);
  next();
});

// app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get("/", (req, res) => {
  res.send("Habit App server is running!");
});

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

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  // console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
});
