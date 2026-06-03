const express = require("express");
const {
  getProfile,
  updateProfile,
  getAllUsers,
  createUser,
  updateUserByAdmin,
} = require("../controllers/user.controller");
const { protect, restrictTo } = require("../middleware/auth.middleware");

const router = express.Router();

router.use(protect);

router.get("/me", getProfile);
router.patch("/me", updateProfile);

router.get("/", restrictTo("admin"), getAllUsers);
router.post("/", restrictTo("admin"), createUser);
router.patch("/:id", restrictTo("admin"), updateUserByAdmin);

module.exports = router;
