const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const mongoose = require("mongoose");
const User = require("../src/models/user.model");

const admin = {
  name: "Admin User",
  email: "admin@quiz.com",
  password: "123456",
  role: "admin",
  isActive: true,
};

const createAdmin = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing in .env");
    }

    await mongoose.connect(process.env.MONGO_URI);

    const existing = await User.findOne({ email: admin.email });
    if (existing) {
      existing.name = admin.name;
      existing.role = "admin";
      existing.isActive = true;
      await existing.save();
      console.log(`Admin already exists and was updated: ${admin.email}`);
    } else {
      await User.create(admin);
      console.log(`Admin created: ${admin.email}`);
    }

    console.log("Email: admin@quiz.com");
    console.log("Password: 123456");
    process.exit(0);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
};

createAdmin();
