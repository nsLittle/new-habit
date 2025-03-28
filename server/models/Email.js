const mongoose = require("mongoose");

const EmailSchema = new mongoose.Schema({
  recipient: { type: String, required: true },
  subject: { type: String, required: true },
  html: { type: String, required: true },
  sendAt: { type: Date, required: true },
  status: { type: String, enum: ["pending", "sent"], default: "pending" },
});

module.exports = mongoose.model("Email", EmailSchema);
