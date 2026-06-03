const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const mongoose = require("mongoose");
const User = require("../src/models/user.model");
const Quiz = require("../src/models/quiz.model");
const Question = require("../src/models/question.model");
const Submission = require("../src/models/submission.model");

const teachers = Array.from({ length: 5 }, (_, i) => ({
  name: `Teacher ${i + 1}`,
  email: `teacher${i + 1}@quiz.com`,
  password: "123456",
  role: "teacher",
  isActive: true,
}));

const students = Array.from({ length: 50 }, (_, i) => ({
  name: `Student ${i + 1}`,
  email: `student${i + 1}@quiz.com`,
  password: "123456",
  role: "student",
  isActive: true,
}));

const quizTemplates = [
  {
    title: "JavaScript Basics",
    description: "Variables, arrays, functions and basic JS logic.",
    category: "Programming",
    questions: [
      ["Which keyword declares a constant in JavaScript?", ["var", "let", "const", "static"], "const"],
      ["Which method adds an item to the end of an array?", ["push", "pop", "shift", "slice"], "push"],
      ["What does JSON stand for?", ["JavaScript Object Notation", "Java Source Open Network", "Joint Script Object Name", "JavaScript Online Node"], "JavaScript Object Notation"],
    ],
  },
  {
    title: "Node.js and Express",
    description: "Backend fundamentals with Express routes and middleware.",
    category: "Backend",
    questions: [
      ["Which package is commonly used to create an Express server?", ["express", "react", "mongoose", "vite"], "express"],
      ["Which middleware parses JSON request bodies?", ["express.json()", "express.static()", "cors()", "router()"], "express.json()"],
      ["Which HTTP method is usually used to create data?", ["GET", "POST", "PATCH", "DELETE"], "POST"],
    ],
  },
  {
    title: "MongoDB and Mongoose",
    description: "Schemas, models and MongoDB documents.",
    category: "Database",
    questions: [
      ["MongoDB stores data mainly as what?", ["Tables", "Documents", "Rows", "Sheets"], "Documents"],
      ["Mongoose is used for what?", ["Styling", "Database modeling", "Routing only", "Testing only"], "Database modeling"],
      ["Which field type references another collection?", ["ObjectId", "String", "Boolean", "Number"], "ObjectId"],
    ],
  },
  {
    title: "Web Security Basics",
    description: "JWT, bcrypt, authorization and account protection.",
    category: "Security",
    questions: [
      ["What is bcrypt used for?", ["Hashing passwords", "Creating CSS", "Running MongoDB", "Sending emails"], "Hashing passwords"],
      ["JWT is commonly used for what?", ["Authentication tokens", "Image editing", "Database backup", "CSS animation"], "Authentication tokens"],
      ["HTTP-only cookies help protect against what?", ["JavaScript access to cookies", "Slow internet", "Wrong passwords", "Large files"], "JavaScript access to cookies"],
    ],
  },
  {
    title: "HTML and CSS Fundamentals",
    description: "Basic page structure and styling concepts.",
    category: "Frontend",
    questions: [
      ["Which tag creates a paragraph?", ["<p>", "<div>", "<span>", "<section>"], "<p>"],
      ["Which CSS property changes text color?", ["color", "font-size", "margin", "display"], "color"],
      ["Which layout system uses rows and columns?", ["Grid", "JSON", "JWT", "Mongoose"], "Grid"],
    ],
  },
];

const upsertUser = async (userData) => {
  const existing = await User.findOne({ email: userData.email });
  if (existing) {
    existing.name = userData.name;
    existing.role = userData.role;
    existing.isActive = true;
    await existing.save();
    return existing;
  }
  return User.create(userData);
};

const seedDemoData = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing in .env");
    }

    await mongoose.connect(process.env.MONGO_URI);

    const teacherDocs = [];
    for (const teacher of teachers) teacherDocs.push(await upsertUser(teacher));

    const studentDocs = [];
    for (const student of students) studentDocs.push(await upsertUser(student));

    const oldQuizzes = await Quiz.find({ createdBy: { $in: teacherDocs.map((t) => t._id) } }).select("_id");
    const oldQuizIds = oldQuizzes.map((quiz) => quiz._id);
    await Question.deleteMany({ quiz: { $in: oldQuizIds } });
    await Submission.deleteMany({ quiz: { $in: oldQuizIds } });
    await Quiz.deleteMany({ _id: { $in: oldQuizIds } });

    for (let i = 0; i < quizTemplates.length; i++) {
      const teacher = teacherDocs[i % teacherDocs.length];
      const assignedStudents = studentDocs.slice(i * 10, i * 10 + 10).map((s) => s._id);
      const template = quizTemplates[i];

      const quiz = await Quiz.create({
        title: template.title,
        description: template.description,
        category: template.category,
        isPublished: true,
        createdBy: teacher._id,
        assignedStudents,
      });

      for (const [questionText, options, correctAnswer] of template.questions) {
        await Question.create({
          quiz: quiz._id,
          questionText,
          options,
          correctAnswer,
          points: 1,
        });
      }
    }

    console.log("Demo data created successfully.");
    console.log("Teachers: teacher1@quiz.com ... teacher5@quiz.com / 123456");
    console.log("Students: student1@quiz.com ... student50@quiz.com / 123456");
    process.exit(0);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
};

seedDemoData();
