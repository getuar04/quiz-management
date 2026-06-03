# Quiz Management System API

## Overview

Quiz Management System API is a RESTful backend application built with Node.js, Express.js, MongoDB, and Mongoose. The system provides secure authentication, role-based authorization, quiz management, question management, and quiz submissions.

The application supports three user roles:

- Admin
- Teacher
- Student

Admins manage user accounts, teachers create and manage quizzes, and students complete assigned quizzes and view their results.

---

## Features

### Authentication

- User login with JWT authentication
- Refresh token authentication
- Refresh token stored in HTTP-only cookies
- Token rotation for improved security
- Logout functionality

### Authorization

- Role-based access control
- Admin permissions
- Teacher permissions
- Student permissions
- Protected API routes

### User Management

Admin can:

- Create Teacher accounts
- Create Student accounts
- Activate users
- Deactivate users
- View all users

Teachers and Students cannot create accounts.

### Quiz Management

Teachers and Admins can:

- Create quizzes
- Update quizzes
- Delete quizzes
- Publish quizzes
- Assign quizzes to students

Students can:

- View assigned quizzes
- Complete quizzes
- Submit answers
- View their own results

### Question Management

Teachers and Admins can:

- Add questions
- Edit questions
- Delete questions

Supported question type:

- Multiple Choice Questions (MCQ)

### Quiz Submissions

Students can:

- Submit answers
- Receive automatic scoring
- View completed results

The system prevents duplicate quiz attempts.

### Security

- Password hashing using bcrypt
- JWT authentication
- Refresh token rotation
- Protected routes
- Ownership validation
- User activation checks
- Role validation

---

## Technologies

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- Bcrypt
- Cookie Parser
- Dotenv

### Frontend

- React
- React Router
- Axios
- Bootstrap

---

## Project Structure

```text
Backend
│
├── src
│   ├── controllers
│   ├── services
│   ├── routes
│   ├── models
│   ├── middleware
│   ├── utils
│   └── config
│
├── scripts
│   ├── createAdmin.js
│   └── seedDemoData.js
│
├── .env
├── package.json
└── server.js
```

---

## Roles

### Admin

Permissions:

- Create Teacher accounts
- Create Student accounts
- View all users
- Activate users
- Deactivate users
- Create quizzes
- Manage quizzes
- Manage questions

### Teacher

Permissions:

- Create quizzes
- Update own quizzes
- Delete own quizzes
- Publish quizzes
- Assign students
- Manage questions

### Student

Permissions:

- View assigned quizzes
- Submit quiz answers
- View own results

---

## Installation

### Clone Repository

```bash
git clone https://github.com/getuar04/quiz-management.git
```

### Install Backend Dependencies

```bash
cd Backend
npm install
```

### Configure Environment Variables

Create a `.env` file:

```env
PORT=5000

MONGO_URI=mongodb://127.0.0.1:27017/quiz-management

JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=15m

JWT_REFRESH_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRES_DAYS=7
```

### Start Development Server

```bash
npm run dev
```

---

## Seed Data

### Create Admin Account

```bash
npm run seed:admin
```

Default admin credentials:

```text
Email: admin@quiz.com
Password: 123456
```

### Create Demo Data

```bash
npm run seed:demo
```

Creates:

- 5 Teachers
- 50 Students
- Sample quizzes
- Sample questions

Default password:

```text
123456
```

---

## Authentication Flow

### Login

```http
POST /api/auth/login
```

Returns:

```json
{
  "accessToken": "jwt_token"
}
```

Refresh token is stored automatically in an HTTP-only cookie.

### Refresh Token

```http
POST /api/auth/refresh
```

Generates:

- New access token
- New refresh token

### Logout

```http
POST /api/auth/logout
```

Removes refresh token cookie.

---

## Main API Endpoints

### Authentication

```http
POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/logout
```

### Users

```http
GET    /api/users
POST   /api/users
PATCH  /api/users/:id
```

### Quizzes

```http
GET    /api/quizzes
GET    /api/quizzes/:id
POST   /api/quizzes
PATCH  /api/quizzes/:id
DELETE /api/quizzes/:id
```

### Questions

```http
POST   /api/questions
PATCH  /api/questions/:id
DELETE /api/questions/:id
```

### Submissions

```http
POST /api/submissions
GET  /api/submissions/my
GET  /api/submissions/quiz/:quizId/my
```

---

## Database Models

### User

```js
{
  (name, email, password, role, isActive);
}
```

### Quiz

```js
{
  (title, description, category, createdBy, assignedStudents, isPublished);
}
```

### Question

```js
{
  (quiz, text, options, correctAnswer);
}
```

### Submission

```js
{
  (student, quiz, answers, score);
}
```

---

## Testing

Use Postman to test:

1. Login
2. Refresh token
3. User management
4. Quiz creation
5. Question creation
6. Quiz submission
7. Authorization rules
8. Student restrictions

---

## Future Improvements

- Quiz timer
- Attempt limits
- Quiz statistics
- Teacher dashboard
- Student dashboard
- Export results
- Pagination
- Search and filtering

---

## Author

Getuar Jakupi
