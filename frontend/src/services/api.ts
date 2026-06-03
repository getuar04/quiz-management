import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const rawApiUrl = (import.meta.env.VITE_API_URL || "http://localhost:3000").replace(/\/$/, "");
const API_BASE_URL = rawApiUrl.endsWith("/api") ? rawApiUrl : `${rawApiUrl}/api`;

export const tokenStorage = {
  getAccess: () => localStorage.getItem("accessToken"),
  set: (access: string) => {
    localStorage.setItem("accessToken", access);
  },
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
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
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
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          original.headers!.Authorization = `Bearer ${token}`;
          return api(original);
        });
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
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
  name: string;
  email: string;
  role: string;
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  points?: number;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  category?: string;
  questionCount?: number;
  isPublished?: boolean;
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

const normalizeQuiz = (quiz: any): Quiz => ({
  id: quiz.id || quiz._id,
  title: quiz.title,
  description: quiz.description || "",
  category: quiz.category,
  isPublished: quiz.isPublished,
  questionCount: Array.isArray(quiz.questions) ? quiz.questions.length : 0,
});

const normalizeQuestion = (q: any): Question => ({
  id: q.id || q._id,
  text: q.text || q.questionText,
  options: q.options || [],
  correctAnswer:
    typeof q.correctAnswer === "number"
      ? q.correctAnswer
      : (q.options || []).indexOf(q.correctAnswer),
  points: q.points,
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

  createQuiz: async (quiz: Omit<Quiz, "id">) => {
    const res = await api.post<ApiResponse<any>>("/quizzes", quiz);
    return normalizeQuiz(unwrap<any>(res));
  },

  updateQuiz: async (id: string, quiz: Partial<Quiz>) => {
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
      correctAnswer: question.options[question.correctAnswer],
      points: question.points || 1,
    });
    return normalizeQuestion(unwrap<any>(res));
  },

  updateQuestion: async (_quizId: string, questionId: string, question: Partial<Question>) => {
    const res = await api.patch<ApiResponse<any>>(`/questions/${questionId}`, {
      questionText: question.text,
      options: question.options,
      correctAnswer:
        question.options && typeof question.correctAnswer === "number"
          ? question.options[question.correctAnswer]
          : undefined,
      points: question.points,
    });
    return normalizeQuestion(unwrap<any>(res));
  },

  deleteQuestion: async (_quizId: string, questionId: string) => {
    await api.delete(`/questions/${questionId}`);
  },
};

export default api;
