const mongoose = require("mongoose");
const validator = require("validator");

const TeamMemberSchema = new mongoose.Schema(
  {
    teamMemberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
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
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    habit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Habit",
      required: true,
    },
    role: {
      type: String,
      required: true,
      enum: ["cohort", "leader"],
      default: "cohort",
    },
    feedback: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Feedback",
      },
    ],
  },
  { timestamps: true }
);

TeamMemberSchema.pre("save", async function (next) {
  const teamCount = await mongoose
    .model("TeamMember")
    .countDocuments({ user: this.user });

  if (teamCount >= 10) {
    return next(new Error("A team cannot have more than 10 members."));
  }

  next();
});

TeamMemberSchema.pre("findOneAndDelete", async function (next) {
  const teamCount = await mongoose
    .model("TeamMember")
    .countDocuments({ user: this._conditions.user });

  if (teamCount <= 3) {
    return next(new Error("A team must have at least 3 members."));
  }

  await mongoose
    .model("Feedback")
    .deleteMany({ teamMemberId: this._conditions._id });

  next();
});

module.exports = mongoose.model("TeamMember", TeamMemberSchema);
