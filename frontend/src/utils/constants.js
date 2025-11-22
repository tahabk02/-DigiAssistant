/**
 * Frontend Constants
 */

// Maturity Profile Colors
export const MATURITY_COLORS = {
  beginner: "#ef4444",
  emergent: "#f59e0b",
  challenger: "#3b82f6",
  leader: "#10b981",
};

// Maturity Profile Names
export const MATURITY_NAMES = {
  beginner: "Débutant",
  emergent: "Émergent",
  challenger: "Challenger",
  leader: "Leader",
};

// Score Levels
export const SCORE_LEVELS = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  EXCELLENT: "excellent",
};

// Dimension IDs
export const DIMENSIONS = {
  STRATEGY: "strategy",
  CULTURE: "culture",
  CUSTOMER: "customer",
  PROCESS: "process",
  TECHNOLOGY: "technology",
  SECURITY: "security",
};

// Dimension Names (French)
export const DIMENSION_NAMES = {
  strategy: "Stratégie",
  culture: "Culture & Humain",
  customer: "Relation Client",
  process: "Processus",
  technology: "Technologie",
  security: "Sécurité",
};

// Company Sizes
export const COMPANY_SIZES = {
  micro: "1-10 employés",
  small: "11-50 employés",
  medium: "51-250 employés",
  large: "250+ employés",
};

// Sectors
export const SECTORS = {
  retail: "Commerce & Distribution",
  services: "Services professionnels",
  manufacturing: "Industrie & Production",
  tech: "Technologie & IT",
  finance: "Finance & Assurance",
  health: "Santé",
  education: "Éducation & Formation",
  other: "Autre secteur",
};

// Routes
export const ROUTES = {
  HOME: "/",
  ASSESSMENT: "/assessment/:assessmentId",
  RESULTS: "/results/:assessmentId",
};

// Local Storage Keys
export const STORAGE_KEYS = {
  CURRENT_ASSESSMENT: "digiassistant_current_assessment",
  ASSESSMENT_HISTORY: "digiassistant_history",
};

// API Endpoints
export const API_ENDPOINTS = {
  HEALTH: "/health",
  START_ASSESSMENT: "/assessments/start",
  SUBMIT_ANSWER: "/assessments/:id/answer",
  GET_RESULTS: "/results/:id",
};

// Animation Durations (ms)
export const ANIMATION = {
  FAST: 200,
  NORMAL: 300,
  SLOW: 500,
};

// Breakpoints (Tailwind)
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
};

export default {
  MATURITY_COLORS,
  MATURITY_NAMES,
  SCORE_LEVELS,
  DIMENSIONS,
  DIMENSION_NAMES,
  COMPANY_SIZES,
  SECTORS,
  ROUTES,
  STORAGE_KEYS,
  API_ENDPOINTS,
  ANIMATION,
  BREAKPOINTS,
};
