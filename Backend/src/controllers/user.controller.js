const {
  getProfileService,
  updateProfileService,
  getAllUsersService,
  createUserService,
  updateUserByAdminService,
} = require("../services/user.service");
const { sendSuccess, sendError } = require("../utils/response.util");

const getProfile = async (req, res, next) => {
  try {
    const user = await getProfileService(req.user._id);
    return sendSuccess(res, 200, "Profile retrieved.", user);
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const user = await updateProfileService(req.user._id, req.body);
    return sendSuccess(res, 200, "Profile updated.", user);
  } catch (error) {
    next(error);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const users = await getAllUsersService(req.user);
    return sendSuccess(res, 200, "Users retrieved.", users);
  } catch (error) {
    next(error);
  }
};

const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return sendError(res, 400, "Name, email, password, and role are required.");
    }

    const user = await createUserService({ name, email, password, role });
    return sendSuccess(res, 201, "User created successfully.", user);
  } catch (error) {
    next(error);
  }
};

const updateUserByAdmin = async (req, res, next) => {
  try {
    const user = await updateUserByAdminService(req.params.id, req.body);
    return sendSuccess(res, 200, "User updated successfully.", user);
  } catch (error) {
    next(error);
  }
};

module.exports = { getProfile, updateProfile, getAllUsers, createUser, updateUserByAdmin };
