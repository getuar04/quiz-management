const User = require("../models/user.model");
const RefreshToken = require("../models/refreshToken.model");
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require("../utils/jwt.util");

const parseDuration = (str) => {
  const units = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
  const match = String(str || "").match(/^(\d+)([smhd])$/);
  if (!match) return 7 * 86400000;
  return parseInt(match[1], 10) * units[match[2]];
};

const safeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  isActive: user.isActive,
});

const createTokenPair = async (user) => {
  const payload = { id: user._id, role: user.role };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  const expiresAt = new Date(
    Date.now() + parseDuration(process.env.JWT_REFRESH_EXPIRES_IN || "7d")
  );

  await RefreshToken.create({ token: refreshToken, user: user._id, expiresAt });

  return { accessToken, refreshToken };
};

const loginService = async ({ email, password }) => {
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.comparePassword(password))) {
    const err = new Error("Invalid email or password.");
    err.statusCode = 401;
    throw err;
  }

  if (user.isActive === false) {
    const err = new Error("Your account is inactive. Contact the administrator.");
    err.statusCode = 403;
    throw err;
  }

  const { accessToken, refreshToken } = await createTokenPair(user);

  return {
    accessToken,
    refreshToken,
    user: safeUser(user),
  };
};

const refreshTokenService = async (token) => {
  if (!token) {
    const err = new Error("Refresh token is required.");
    err.statusCode = 401;
    throw err;
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch {
    const err = new Error("Invalid or expired refresh token.");
    err.statusCode = 401;
    throw err;
  }

  const stored = await RefreshToken.findOne({ token, isRevoked: false });
  if (!stored || stored.isExpired()) {
    const err = new Error("Refresh token is invalid or has been revoked.");
    err.statusCode = 401;
    throw err;
  }

  stored.isRevoked = true;
  await stored.save();

  const user = await User.findById(decoded.id);
  if (!user) {
    const err = new Error("User no longer exists.");
    err.statusCode = 401;
    throw err;
  }

  if (user.isActive === false) {
    const err = new Error("Your account is inactive. Contact the administrator.");
    err.statusCode = 403;
    throw err;
  }

  const { accessToken, refreshToken: newRefreshToken } = await createTokenPair(user);
  return { accessToken, refreshToken: newRefreshToken };
};

const logoutService = async (token) => {
  if (!token) return;
  await RefreshToken.findOneAndUpdate({ token }, { isRevoked: true });
};

const logoutAllService = async (userId) => {
  await RefreshToken.updateMany({ user: userId, isRevoked: false }, { isRevoked: true });
};

module.exports = {
  loginService,
  refreshTokenService,
  logoutService,
  logoutAllService,
};
