const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
  {
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    answers: [
      {
        question: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Question",
          required: true,
        },
        selectedAnswer: {
          type: String,
          required: true,
        },
        isCorrect: {
          type: Boolean,
          default: false,
        },
      },
    ],
    score: {
      type: Number,
      default: 0,
    },
    totalPoints: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

submissionSchema.index({ quiz: 1, student: 1 }, { unique: true });

module.exports = mongoose.model("Submission", submissionSchema);
