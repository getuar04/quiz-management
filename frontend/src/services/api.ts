import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const rawApiUrl = (import.meta.env.VITE_API_URL || "http://localhost:3000").replace(/\/$/, "");
const API_BASE_URL = rawApiUrl.endsWith("/api") ? rawApiUrl : `${rawApiUrl}/api`;

export const tokenStorage = {
  getAccess: () => localStorage.getItem("accessToken"),
  set: (access: string) => localStorage.setItem("accessToken", access),
  clear: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
  },
  setUser: (user: AuthUser) => localStorage.setItem("user", JSON.stringify(user)),
  getUser: (): AuthUser | null => {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  },
};

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenStorage.getAccess();
  if (token && config.headers) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let isRefreshing = false;
let failedQueue: Array<{ resolve: (v: string) => void; reject: (e: unknown) => void }> = [];

const processQueue = (error: unknown, token: string | null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token!)));
  failedQueue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => failedQueue.push({ resolve, reject })).then((token) => {
          original.headers!.Authorization = `Bearer ${token}`;
          return api(original);
        });
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, { withCredentials: true });
        const { accessToken } = data.data;
        tokenStorage.set(accessToken);
        processQueue(null, accessToken);
        original.headers!.Authorization = `Bearer ${accessToken}`;
        return api(original);
      } catch (refreshError) {
        processQueue(refreshError, null);
        tokenStorage.clear();
        window.dispatchEvent(new Event("auth:logout"));
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export interface AuthUser {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: "admin" | "teacher" | "student";
  isActive?: boolean;
}

export interface UserAccount {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: "teacher" | "student" | "admin";
  isActive: boolean;
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer?: number;
  points?: number;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  category?: string;
  questionCount?: number;
  isPublished?: boolean;
  assignedStudents?: UserAccount[];
  createdBy?: UserAccount;
}

export interface Submission {
  id: string;
  score: number;
  totalPoints: number;
  student?: UserAccount;
  quiz?: Quiz;
  answers?: Array<{
    question: Question;
    selectedAnswer: string;
    isCorrect: boolean;
  }>;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

const unwrap = <T>(response: { data: ApiResponse<T> | T }): T => {
  const payload = response.data;
  if (payload && typeof payload === "object" && "success" in payload) {
    return (payload as ApiResponse<T>).data as T;
  }
  return payload as T;
};

const normalizeUser = (user: any): UserAccount => ({
  id: user.id || user._id,
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  isActive: user.isActive !== false,
});

const normalizeQuiz = (quiz: any): Quiz => ({
  id: quiz.id || quiz._id,
  title: quiz.title,
  description: quiz.description || "",
  category: quiz.category,
  isPublished: quiz.isPublished,
  assignedStudents: Array.isArray(quiz.assignedStudents) ? quiz.assignedStudents.map(normalizeUser) : [],
  createdBy: quiz.createdBy && typeof quiz.createdBy === "object" ? normalizeUser(quiz.createdBy) : undefined,
  questionCount: Array.isArray(quiz.questions) ? quiz.questions.length : quiz.questionCount || 0,
});

const normalizeQuestion = (q: any): Question => ({
  id: q.id || q._id,
  text: q.text || q.questionText,
  options: q.options || [],
  correctAnswer:
    q.correctAnswer === undefined
      ? undefined
      : typeof q.correctAnswer === "number"
        ? q.correctAnswer
        : (q.options || []).indexOf(q.correctAnswer),
  points: q.points,
});

const normalizeSubmission = (submission: any): Submission => ({
  id: submission.id || submission._id,
  score: submission.score,
  totalPoints: submission.totalPoints,
  student: submission.student ? normalizeUser(submission.student) : undefined,
  quiz: submission.quiz ? normalizeQuiz(submission.quiz) : undefined,
  answers: Array.isArray(submission.answers)
    ? submission.answers.map((answer: any) => ({
        question: normalizeQuestion(answer.question),
        selectedAnswer: answer.selectedAnswer,
        isCorrect: answer.isCorrect,
      }))
    : [],
});

export const authService = {
  login: async (email: string, password: string) => {
    const res = await api.post<ApiResponse<any>>("/auth/login", { email, password });
    const data = unwrap<any>(res);
    tokenStorage.set(data.accessToken);
    tokenStorage.setUser(data.user);
    return data;
  },
  logout: async () => {
    try {
      await api.post("/auth/logout", {});
    } finally {
      tokenStorage.clear();
    }
  },
};

export const userService = {
  getUsers: async () => {
    const res = await api.get<ApiResponse<any[]>>("/users");
    return unwrap<any[]>(res).map(normalizeUser);
  },
  createUser: async (user: { name: string; email: string; password: string; role: "teacher" | "student" }) => {
    const res = await api.post<ApiResponse<any>>("/users", user);
    return normalizeUser(unwrap<any>(res));
  },
  updateUser: async (id: string, data: Partial<UserAccount>) => {
    const res = await api.patch<ApiResponse<any>>(`/users/${id}`, data);
    return normalizeUser(unwrap<any>(res));
  },
};

export const quizService = {
  getAllQuizzes: async () => {
    const res = await api.get<ApiResponse<any[]>>("/quizzes");
    return unwrap<any[]>(res).map(normalizeQuiz);
  },
  getMyQuizzes: async () => {
    const res = await api.get<ApiResponse<any[]>>("/quizzes/user/my");
    return unwrap<any[]>(res).map(normalizeQuiz);
  },
  getQuizById: async (id: string) => {
    const res = await api.get<ApiResponse<any>>(`/quizzes/${id}`);
    return normalizeQuiz(unwrap<any>(res));
  },
  createQuiz: async (quiz: { title: string; description?: string; category?: string; isPublished?: boolean; assignedStudents?: string[] }) => {
    const res = await api.post<ApiResponse<any>>("/quizzes", quiz);
    return normalizeQuiz(unwrap<any>(res));
  },
  updateQuiz: async (id: string, quiz: Partial<Quiz> & { assignedStudents?: string[] }) => {
    const res = await api.patch<ApiResponse<any>>(`/quizzes/${id}`, quiz);
    return normalizeQuiz(unwrap<any>(res));
  },
  deleteQuiz: async (id: string) => {
    await api.delete(`/quizzes/${id}`);
  },
  getQuestionsByQuiz: async (quizId: string) => {
    const res = await api.get<ApiResponse<any[]>>(`/questions/quiz/${quizId}`);
    return unwrap<any[]>(res).map(normalizeQuestion);
  },
  addQuestion: async (quizId: string, question: Omit<Question, "id">) => {
    const res = await api.post<ApiResponse<any>>(`/questions/quiz/${quizId}`, {
      questionText: question.text,
      options: question.options,
      correctAnswer: typeof question.correctAnswer === "number" ? question.options[question.correctAnswer] : undefined,
      points: question.points || 1,
    });
    return normalizeQuestion(unwrap<any>(res));
  },
  deleteQuestion: async (_quizId: string, questionId: string) => {
    await api.delete(`/questions/${questionId}`);
  },
};

export const submissionService = {
  submitQuiz: async (quizId: string, answers: Array<{ question: string; selectedAnswer: string }>) => {
    const res = await api.post<ApiResponse<any>>(`/submissions/quiz/${quizId}`, { answers });
    return normalizeSubmission(unwrap<any>(res));
  },
  getMySubmissionForQuiz: async (quizId: string) => {
    const res = await api.get<ApiResponse<any | null>>(`/submissions/quiz/${quizId}/my`);
    const data = unwrap<any | null>(res);
    return data ? normalizeSubmission(data) : null;
  },
  getQuizSubmissions: async (quizId: string) => {
    const res = await api.get<ApiResponse<any[]>>(`/submissions/quiz/${quizId}`);
    return unwrap<any[]>(res).map(normalizeSubmission);
  },
  getMySubmissions: async () => {
    const res = await api.get<ApiResponse<any[]>>("/submissions/my");
    return unwrap<any[]>(res).map(normalizeSubmission);
  },
};

export default api;
