const express = require("express");
const {
  getQuestionsByQuiz,
  addQuestion,
  updateQuestion,
  deleteQuestion,
} = require("../controllers/question.controller");
const { protect, restrictTo } = require("../middleware/auth.middleware");

const router = express.Router();

router.use(protect);

router.get("/quiz/:quizId", getQuestionsByQuiz);
router.post("/quiz/:quizId", restrictTo("teacher", "admin"), addQuestion);
router.patch("/:id", restrictTo("teacher", "admin"), updateQuestion);
router.delete("/:id", restrictTo("teacher", "admin"), deleteQuestion);

module.exports = router;
