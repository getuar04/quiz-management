const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: [true, "Quiz reference is required"],
    },
    questionText: {
      type: String,
      required: [true, "Question text is required"],
      trim: true,
      minlength: [5, "Question must be at least 5 characters"],
    },
    options: {
      type: [String],
      validate: {
        validator: (arr) => arr.length >= 2 && arr.length <= 6,
        message: "Options must be between 2 and 6",
      },
      required: [true, "Options are required"],
    },
    correctAnswer: {
      type: String,
      required: [true, "Correct answer is required"],
      validate: {
        validator: function (val) {
          return this.options.includes(val);
        },
        message: "Correct answer must be one of the provided options",
      },
    },
    points: {
      type: Number,
      default: 1,
      min: [1, "Points must be at least 1"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Question", questionSchema);
