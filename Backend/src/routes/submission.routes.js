const express = require("express");
const {
  submitQuiz,
  getMySubmissionForQuiz,
  getQuizSubmissions,
  getMySubmissions,
} = require("../controllers/submission.controller");
const { protect, restrictTo } = require("../middleware/auth.middleware");

const router = express.Router();

router.use(protect);

router.get("/my", restrictTo("student"), getMySubmissions);
router.get("/quiz/:quizId/my", restrictTo("student"), getMySubmissionForQuiz);
router.post("/quiz/:quizId", restrictTo("student"), submitQuiz);
router.get("/quiz/:quizId", restrictTo("teacher", "admin"), getQuizSubmissions);

module.exports = router;
