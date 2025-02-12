const mongoose = require("mongoose");
const validator = require("validator");

const TeamMemberSchema = new mongoose.Schema(
  {
    teamMemberFirstName: { type: String, required: false, trim: true },
    teamMemberLastName: { type: String, required: false, trim: true },
    teamMemberEmail: {
      type: String,
      required: false,
      unique: false,
      match: /.+@.+\..+/,
    },
    teamMemberProfilePic: {
      type: String,
      required: false,
      validate: {
        validator: (value) => validator.isURL(value),
        message: (props) => `${props.value} is not a valid URL`,
      },
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    habit: { type: mongoose.Schema.Types.ObjectId, ref: "Habit" },
    role: {
      type: String,
      required: true,
      enum: ["cohort", "leader"],
      default: "cohort",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TeamMember", TeamMemberSchema);
