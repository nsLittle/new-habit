const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const { Habit } = require("../models/Habit");
const TeamMember = require("../models/TeamMember");

require("dotenv").config();

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);

  // Clear old test data
  await User.deleteMany({ username: "Sheep" });

  const hashedPassword = await bcrypt.hash("Password1!", 10);

  const user = await User.create({
    username: "Sheep",
    password: hashedPassword,
    firstName: "Sheepy",
    lastName: "Sheep",
    email: "sheep@email.com",
    profilePic:
      "https://thumbs.dreamstime.com/z/meet-fashionable-sheep-pink-glasses-bubblegum-bubble-set-against-vibrant-background-image-brings-joy-whimsy-to-any-339304867.jpg",
  });

  const habit = await Habit.create({
    userId: user._id,
    habit: "I want to become a sheep dog like Babe",
    description:
      "I will herd sheep in cool formations and bring home blue ribbons galore",
    cadence: "Every Other Week",

    cadenceLength: 14,
    startDate: new Date(),
    endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    reminders: {
      isReminderEnabled: true,
      isEmailReminderEnabled: true,
      isTextReminderEnabled: false,
      selectedDays: ["Wed"],
      selectedTime: { hour: "03", minute: "00", period: "PM" },
    },
  });

  const teamMembers = await TeamMember.insertMany([
    {
      user: user._id,
      teamMemberId: new mongoose.Types.ObjectId(),
      teamMemberFirstName: "Kitty",
      teamMemberLastName: "Kat",
      teamMemberEmail: "kat@email.com",
      teamMemberProfilePic:
        "https://wallpapers.com/images/featured/cool-cat-pictures-aljseh1yx8lf3bbp.jpg",
      role: "cohort",
    },
    {
      user: user._id,
      teamMemberId: new mongoose.Types.ObjectId(),
      teamMemberFirstName: "Doggy",
      teamMemberLastName: "Dog",
      teamMemberEmail: "dog@email.com",
      teamMemberProfilePic:
        "https://static.vecteezy.com/system/resources/thumbnails/045/851/066/small/cute-golden-dog-wearing-sunglasses-on-yellow-background-photo.jpg",
      role: "cohort",
    },
    {
      user: user._id,
      teamMemberId: new mongoose.Types.ObjectId(),
      teamMemberFirstName: "Mousey",
      teamMemberLastName: "Mouse",
      teamMemberEmail: "mouse@email.com",
      teamMemberProfilePic:
        "https://thumbs.dreamstime.com/z/tiny-cute-mouse-hoodie-earphone-tiny-cute-mouse-listening-song-ear-phone-335005970.jpg",
      role: "cohort",
    },
  ]);

  habit.teamMembers = teamMembers.map((tm) => tm._id);
  await habit.save();

  console.log("🐑 Seed complete! Login with:");
  console.log("Username: Sheep");
  console.log("Password: Password1!");

  process.exit();
}

seed();
