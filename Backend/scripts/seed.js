require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../src/models/user.model");

const users = [
  {
    name: "Admin User",
    email: "admin@quiz.com",
    password: "123456",
    role: "admin",
  },
  {
    name: "Teacher User",
    email: "teacher@quiz.com",
    password: "123456",
    role: "teacher",
  },
  {
    name: "Student User",
    email: "student@quiz.com",
    password: "123456",
    role: "student",
  },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
console.log('🍛 MONGO_URI:', MONGO_URI);

    for (const userData of users) {
      const existing = await User.findOne({ email: userData.email });
      if (!existing) {
        await User.create(userData);
        console.log(`Created: ${userData.email}`);
      } else {
        console.log(`Exists: ${userData.email}`);
      }
    }

    console.log("Seed completed.");
    process.exit(0);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
};

seed();
