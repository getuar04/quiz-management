const express = require("express");
const {
  getAllQuizzes,
  getMyQuizzes,
  getQuizById,
  createQuiz,
  updateQuiz,
  deleteQuiz,
} = require("../controllers/quiz.controller");
const { protect, restrictTo } = require("../middleware/auth.middleware");

const router = express.Router();

router.use(protect);

router.get("/", getAllQuizzes);
router.get("/user/my", restrictTo("teacher", "admin"), getMyQuizzes);
router.get("/:id", getQuizById);
router.post("/", restrictTo("teacher", "admin"), createQuiz);
router.patch("/:id", restrictTo("teacher", "admin"), updateQuiz);
router.delete("/:id", restrictTo("teacher", "admin"), deleteQuiz);

module.exports = router;
