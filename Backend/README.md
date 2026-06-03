# 🎯 Quiz Management API

**Getuar Jakupi** — Node.js Backend Training Project

A RESTful API for managing quizzes and questions, built with Express, MongoDB, and JWT authentication.

---

## 🚀 Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env and set your MONGO_URI and JWT_SECRET
```

### 3. Start the server
```bash
# Development (with auto-restart)
npm run dev

# Production
npm start
```

Server runs on `http://localhost:3000`

---

## 📁 Project Structure

```
quiz-api/
├── app.js                      # Entry point
├── .env                        # Environment variables
├── Quiz-API.postman_collection.json
└── src/
    ├── config/
    │   └── db.js               # MongoDB connection
    ├── models/
    │   ├── user.model.js       # User schema
    │   ├── quiz.model.js       # Quiz schema
    │   └── question.model.js   # Question schema
    ├── controllers/
    │   ├── auth.controller.js
    │   ├── user.controller.js
    │   ├── quiz.controller.js
    │   └── question.controller.js
    ├── services/
    │   ├── auth.service.js     # Business logic: auth
    │   ├── user.service.js     # Business logic: users
    │   ├── quiz.service.js     # Business logic: quizzes
    │   └── question.service.js # Business logic: questions
    ├── routes/
    │   ├── auth.routes.js
    │   ├── user.routes.js
    │   ├── quiz.routes.js
    │   └── question.routes.js
    ├── middleware/
    │   ├── auth.middleware.js  # JWT protect + restrictTo
    │   ├── error.middleware.js # Global error handler
    │   └── notFound.middleware.js
    └── utils/
        ├── jwt.util.js         # generateToken / verifyToken
        └── response.util.js    # sendSuccess / sendError
```

---

## 🔗 API Endpoints

### Auth — `/api/auth`
| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| POST | `/register` | Register new user | ❌ |
| POST | `/login` | Login and get JWT | ❌ |

### Users — `/api/users`
| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| GET | `/me` | Get my profile | ✅ |
| PATCH | `/me` | Update my profile | ✅ |
| GET | `/` | Get all users | ✅ Admin |

### Quizzes — `/api/quizzes`
| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| GET | `/` | Get all published quizzes | ❌ |
| GET | `/:id` | Get quiz by ID (with questions) | ❌ |
| GET | `/user/mine` | Get my quizzes | ✅ |
| POST | `/` | Create quiz | ✅ |
| PATCH | `/:id` | Update quiz (owner only) | ✅ |
| DELETE | `/:id` | Delete quiz + its questions | ✅ |

### Questions — `/api/questions`
| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| GET | `/quiz/:quizId` | Get all questions of a quiz | ❌ |
| POST | `/quiz/:quizId` | Add question to quiz (owner only) | ✅ |
| PATCH | `/:id` | Update question (owner only) | ✅ |
| DELETE | `/:id` | Delete question (owner only) | ✅ |

---

## 🧪 Testing with Postman

1. Open Postman
2. Click **Import** → select `Quiz-API.postman_collection.json`
3. Run requests **in order** — the collection auto-saves `token`, `quizId`, and `questionId` as variables between requests

**Recommended test flow:**
```
Register → Login → Create Quiz → Add Question → Get Questions → Update Quiz → Delete Question → Delete Quiz
```

---

## 🔐 Authentication

All protected routes require a Bearer token in the `Authorization` header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 📊 Error Response Format

```json
{
  "success": false,
  "message": "Descriptive error message",
  "errors": ["Field-level validation error (if any)"]
}
```

## ✅ Success Response Format

```json
{
  "success": true,
  "message": "Descriptive success message",
  "data": { }
}
```
