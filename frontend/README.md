# Quiz API - Frontend

A modern React + Vite + TypeScript frontend application for managing and taking quizzes through the Quiz API.

## Features

- ✅ **Quiz Management** - Create, view, update, and delete quizzes
- ✅ **Question Management** - Add, edit, and delete questions for each quiz
- ✅ **Multiple Choice** - Support for multiple choice questions with flexible options
- ✅ **API Testing** - Built-in endpoint tester to explore and test all API endpoints
- ✅ **Responsive Design** - Works seamlessly on desktop and mobile devices
- ✅ **Type Safe** - Full TypeScript support for better development experience

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager
- Quiz API backend running on `http://localhost:3000`

## Installation

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file (or use the provided `.env`):

```
VITE_API_URL=http://localhost:3000
```

## Development

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Building

Build for production:

```bash
npm run build
```

The optimized files will be in the `dist` folder.

## Project Structure

```
src/
├── components/          # React components
│   ├── QuizList/       # Display and create quizzes
│   ├── QuizDetail/     # View quiz questions
│   ├── QuestionForm/   # Add new questions
│   └── EndpointTester/ # API testing tool
├── services/
│   └── api.ts          # API service with all endpoints
├── App.tsx             # Main application component
├── App.css             # Global styles
├── main.tsx            # Application entry point
└── index.css           # Base styles
```

## Available Pages

### 1. Quiz Management

- View all quizzes
- Create new quizzes
- View quiz details
- Delete quizzes
- Add questions to quizzes

### 2. Question Management

- Add new questions to a quiz
- Set correct answers
- Organize questions by category
- Delete questions

### 3. API Endpoint Tester

- Test all available API endpoints
- View endpoint documentation
- Send requests with custom parameters
- See response data in real-time

## API Endpoints Supported

### Quizzes

- `GET /quizzes` - Get all quizzes
- `GET /quizzes/:id` - Get a specific quiz
- `POST /quizzes` - Create a new quiz
- `PUT /quizzes/:id` - Update a quiz
- `DELETE /quizzes/:id` - Delete a quiz

### Questions

- `GET /quizzes/:id/questions` - Get all questions for a quiz
- `POST /quizzes/:id/questions` - Add a question
- `PUT /quizzes/:id/questions/:qid` - Update a question
- `DELETE /quizzes/:id/questions/:qid` - Delete a question

### Quiz Submission

- `POST /quizzes/:id/submit` - Submit quiz answers and get score

### Health

- `GET /health` - Check API health status

## Environment Variables

| Variable       | Description     | Default                 |
| -------------- | --------------- | ----------------------- |
| `VITE_API_URL` | Backend API URL | `http://localhost:3000` |

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run ESLint
npm run lint
```

## Technologies Used

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **TypeScript** - Type safety
- **Axios** - HTTP client
- **CSS3** - Styling with modern features

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is part of the Beetroot Academy curriculum.
