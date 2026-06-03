const { verifyToken } = require("../utils/jwt.util");
const { sendError } = require("../utils/response.util");
const User = require("../models/user.model");

const requireActiveUser = (req, res, next) => {
  if (!req.user || req.user.isActive === false) {
    return sendError(res, 403, "Your account is inactive. Contact the administrator.");
  }
  next();
};

const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return sendError(res, 401, "Access denied. No token provided.");
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verifyToken(token);
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return sendError(res, 401, "User no longer exists.");
    }

    return requireActiveUser(req, res, next);
  } catch {
    return sendError(res, 401, "Invalid or expired token.");
  }
};

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return sendError(res, 403, "You do not have permission to perform this action.");
    }
    next();
  };
};

module.exports = { protect, restrictTo, requireActiveUser };
