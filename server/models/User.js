const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      minlength: 3,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      validate: {
        validator: function (value) {
          return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/.test(value);
        },
        message:
          "Password must have at least one uppercase letter, one lowercase letter, and one number.",
      },
    },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      match: /.+\@.+\..+/,
    },
    profilePic: {
      type: String,
      default: "default-profile.png",
      validate: {
        validator: function (value) {
          return (
            /^https?:\/\/.+\..+/.test(value) ||
            /\.(jpg|jpeg|png|gif)$/i.test(value)
          );
        },
        message:
          "Profile picture must be a valid URL or an image file path (e.g., .jpg, .png).",
      },
    },
    habits: [{ type: mongoose.Schema.Types.ObjectId, ref: "Habit" }],
    teamMember: [{ type: mongoose.Schema.Types.ObjectId, ref: "TeamMember" }],
  },
  { timestamps: true }
);

UserSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

UserSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", UserSchema);
module.exports = User;
