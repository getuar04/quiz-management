const {
  loginService,
  refreshTokenService,
  logoutService,
  logoutAllService,
} = require("../services/auth.service");
const { sendSuccess, sendError } = require("../utils/response.util");

const cookieOptions = {
  httpOnly: true,
  sameSite: "strict",
  secure: process.env.NODE_ENV === "production",
};

const getCookie = (req, name) => {
  const rawCookie = req.headers.cookie || "";
  const cookies = rawCookie.split(";").map((item) => item.trim());
  const found = cookies.find((item) => item.startsWith(`${name}=`));
  return found ? decodeURIComponent(found.split("=")[1]) : null;
};

const setRefreshCookie = (res, refreshToken) => {
  res.cookie("refreshToken", refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

const clearRefreshCookie = (res) => {
  res.clearCookie("refreshToken", cookieOptions);
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return sendError(res, 400, "Email and password are required.");
    }

    const result = await loginService({ email, password });
    setRefreshCookie(res, result.refreshToken);

    return sendSuccess(res, 200, "Login successful.", {
      accessToken: result.accessToken,
      user: result.user,
    });
  } catch (error) {
    next(error);
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const token = getCookie(req, "refreshToken") || req.body.refreshToken;
    const result = await refreshTokenService(token);
    setRefreshCookie(res, result.refreshToken);

    return sendSuccess(res, 200, "Token refreshed.", {
      accessToken: result.accessToken,
    });
  } catch (error) {
    clearRefreshCookie(res);
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    const token = getCookie(req, "refreshToken") || req.body.refreshToken;
    await logoutService(token);
    clearRefreshCookie(res);
    return sendSuccess(res, 200, "Logged out successfully.");
  } catch (error) {
    next(error);
  }
};

const logoutAll = async (req, res, next) => {
  try {
    await logoutAllService(req.user._id);
    clearRefreshCookie(res);
    return sendSuccess(res, 200, "Logged out from all devices.");
  } catch (error) {
    next(error);
  }
};

module.exports = { login, refreshToken, logout, logoutAll };
