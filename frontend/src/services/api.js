import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 seconds
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add any auth tokens here if needed
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // Handle errors
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Une erreur est survenue";

    console.error("API Error:", {
      message: errorMessage,
      status: error.response?.status,
      url: error.config?.url,
    });

    return Promise.reject({
      message: errorMessage,
      status: error.response?.status,
      data: error.response?.data,
    });
  }
);

// API methods
export const apiService = {
  // Health check
  health: () => api.get("/health"),

  // Assessment endpoints
  startAssessment: (data) => api.post("/assessments/start", data),
  submitAnswer: (assessmentId, data) =>
    api.post(`/assessments/${assessmentId}/answer`, data),
  getAssessment: (assessmentId) => api.get(`/assessments/${assessmentId}`),
  getProgress: (assessmentId) =>
    api.get(`/assessments/${assessmentId}/progress`),
  resumeAssessment: (assessmentId) =>
    api.get(`/assessments/${assessmentId}/resume`),
  deleteAssessment: (assessmentId) =>
    api.delete(`/assessments/${assessmentId}`),

  // Results endpoints
  getResults: (assessmentId) => api.get(`/results/${assessmentId}`),
  getSummary: (assessmentId) => api.get(`/results/${assessmentId}/summary`),
  getDimensionDetails: (assessmentId, dimensionId) =>
    api.get(`/results/${assessmentId}/dimension/${dimensionId}`),
  exportPDF: (assessmentId) =>
    api.get(`/results/${assessmentId}/export/pdf`, { responseType: "blob" }),
  exportJSON: (assessmentId) =>
    api.get(`/results/${assessmentId}/export/json`, { responseType: "blob" }),
  recalculateScores: (assessmentId) =>
    api.post(`/results/${assessmentId}/recalculate`),
  getComparison: (assessmentId) =>
    api.get(`/results/${assessmentId}/comparison`),

  // Metadata endpoints
  getDimensions: () => api.get("/dimensions"),
  getQuestions: (params) => api.get("/questions", { params }),
  getQuestion: (questionId) => api.get(`/questions/${questionId}`),
};

export default api;
