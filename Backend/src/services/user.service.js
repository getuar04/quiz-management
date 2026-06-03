const User = require("../models/user.model");

const getProfileService = async (userId) => {
  const user = await User.findById(userId).select("-password");
  if (!user) {
    const err = new Error("User not found.");
    err.statusCode = 404;
    throw err;
  }
  return user;
};

const updateProfileService = async (userId, data) => {
  const { password, role, isActive, ...safeData } = data;

  const user = await User.findByIdAndUpdate(userId, safeData, {
    new: true,
    runValidators: true,
  }).select("-password");

  if (!user) {
    const err = new Error("User not found.");
    err.statusCode = 404;
    throw err;
  }

  return user;
};

const getAllUsersService = async () => {
  return User.find().select("-password").sort("-createdAt");
};

const createUserService = async ({ name, email, password, role }) => {
  const allowedRoles = ["student", "teacher"];

  if (!allowedRoles.includes(role)) {
    const err = new Error("Admin can only create student or teacher users from this route.");
    err.statusCode = 400;
    throw err;
  }

  const user = await User.create({ name, email, password, role, isActive: true });
  user.password = undefined;
  return user;
};

const updateUserByAdminService = async (userId, data) => {
  const allowedRoles = ["student", "teacher"];
  const targetUser = await User.findById(userId);

  if (!targetUser) {
    const err = new Error("User not found.");
    err.statusCode = 404;
    throw err;
  }

  if (targetUser.role === "admin") {
    const err = new Error("Admin users cannot be modified from this route.");
    err.statusCode = 403;
    throw err;
  }

  if (data.name !== undefined) targetUser.name = data.name;
  if (data.email !== undefined) targetUser.email = data.email;
  if (data.isActive !== undefined) targetUser.isActive = data.isActive;

  if (data.role !== undefined) {
    if (!allowedRoles.includes(data.role)) {
      const err = new Error("Admin can only set role to student or teacher from this route.");
      err.statusCode = 400;
      throw err;
    }
    targetUser.role = data.role;
  }

  await targetUser.save();
  targetUser.password = undefined;
  return targetUser;
};

module.exports = {
  getProfileService,
  updateProfileService,
  getAllUsersService,
  createUserService,
  updateUserByAdminService,
};
