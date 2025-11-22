import axios from "axios";

// ============================================
// CONFIGURATION
// ============================================
const getApiUrl = () => {
  // 1. Variable d'environnement Vite
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // 2. Détection automatique selon l'environnement
  if (import.meta.env.PROD) {
    // En production, utiliser l'URL relative ou une URL fixe
    // Option A: API sur le même domaine
    return "/api/v1";
    // Option B: URL fixe (décommentez et modifiez)
    // return "https://votre-backend.vercel.app/api/v1";
  }

  // 3. Fallback développement local
  return "http://localhost:3000/api/v1";
};

const API_URL = getApiUrl();

console.log(`🔗 API URL: ${API_URL}`);
console.log(`🌍 Environment: ${import.meta.env.MODE}`);

// ============================================
// AXIOS INSTANCE
// ============================================
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 30000,
  withCredentials: false, // Mettre true si vous utilisez des cookies
});

// ============================================
// INTERCEPTORS
// ============================================

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Log en développement
    if (import.meta.env.DEV) {
      console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`);
    }

    // Auth token si nécessaire
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.log(`📥 ${response.status} ${response.config.url}`);
    }
    return response.data;
  },
  (error) => {
    // Erreur réseau (pas de réponse du serveur)
    if (!error.response) {
      console.error("❌ Erreur réseau:", error.message);

      return Promise.reject({
        message:
          "Connexion au serveur impossible. Vérifiez votre connexion internet.",
        status: 0,
        isNetworkError: true,
        originalError: error,
      });
    }

    // Erreur HTTP
    const status = error.response.status;
    const data = error.response.data;

    let message = data?.message || error.message || "Une erreur est survenue";

    // Messages personnalisés selon le code HTTP
    const errorMessages = {
      400: "Requête invalide",
      401: "Non autorisé - Veuillez vous reconnecter",
      403: "Accès refusé",
      404: "Ressource non trouvée",
      408: "Délai d'attente dépassé",
      429: "Trop de requêtes - Veuillez patienter",
      500: "Erreur serveur interne",
      502: "Serveur temporairement indisponible",
      503: "Service en maintenance",
      504: "Délai de réponse du serveur dépassé",
    };

    if (errorMessages[status] && !data?.message) {
      message = errorMessages[status];
    }

    console.error(`❌ API Error [${status}]:`, {
      url: error.config?.url,
      message,
      data,
    });

    return Promise.reject({
      message,
      status,
      data,
      isHttpError: true,
    });
  }
);

// ============================================
// HEALTH CHECK AVEC RETRY
// ============================================
const checkHealth = async (retries = 3, delay = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await api.get("/health");
      console.log("✅ Backend connecté:", response);
      return { connected: true, data: response };
    } catch (error) {
      console.warn(`⚠️ Tentative ${i + 1}/${retries} échouée`);
      if (i < retries - 1) {
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }
  return { connected: false, error: "Backend non disponible" };
};

// ============================================
// API METHODS
// ============================================
export const apiService = {
  // Health & Utils
  health: () => api.get("/health"),
  checkConnection: checkHealth,
  getApiUrl: () => API_URL,

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

// ============================================
// HOOK REACT POUR VÉRIFIER LA CONNEXION
// ============================================
export const useApiHealth = () => {
  const [status, setStatus] = React.useState({
    checking: true,
    connected: false,
    error: null,
  });

  React.useEffect(() => {
    checkHealth().then((result) => {
      setStatus({
        checking: false,
        connected: result.connected,
        error: result.error || null,
      });
    });
  }, []);

  return status;
};

export default api;
