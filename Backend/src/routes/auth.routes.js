const express = require("express");
const { login, refreshToken, logout, logoutAll } = require("../controllers/auth.controller");
const { protect } = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/login", login);
router.post("/refresh", refreshToken);
router.post("/logout", logout);
router.post("/logout-all", protect, logoutAll);

module.exports = router;
