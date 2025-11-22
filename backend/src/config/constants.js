// Constants for the DigiAssistant application

module.exports = {
  // Scoring Constants
  SCORING: {
    MAX_PILLAR_SCORE: 9,
    PILLARS_PER_DIMENSION: 4,
    MAX_DIMENSION_SCORE: 36, // 4 pillars * 9 points
    NUMBER_OF_DIMENSIONS: 6,
    MAX_GLOBAL_SCORE: 100,
  },

  // Maturity Profile Thresholds
  MATURITY_THRESHOLDS: {
    BEGINNER: { min: 0, max: 25 },
    EMERGENT: { min: 26, max: 50 },
    CHALLENGER: { min: 51, max: 75 },
    LEADER: { min: 76, max: 100 },
  },

  // Question Types
  QUESTION_TYPES: {
    INTRO: "intro",
    SCORED: "scored",
    CONDITIONAL: "conditional",
  },

  // Dimensions
  DIMENSIONS: {
    STRATEGY: "strategy",
    CULTURE: "culture",
    CUSTOMER: "customer",
    PROCESS: "process",
    TECHNOLOGY: "technology",
    SECURITY: "security",
  },

  // Assessment Status
  ASSESSMENT_STATUS: {
    IN_PROGRESS: "in_progress",
    COMPLETED: "completed",
    ABANDONED: "abandoned",
  },

  // API Response Messages
  MESSAGES: {
    SUCCESS: {
      ASSESSMENT_CREATED: "Diagnostic créé avec succès",
      RESPONSE_SAVED: "Réponse enregistrée avec succès",
      ASSESSMENT_COMPLETED: "Diagnostic complété avec succès",
      RESULTS_GENERATED: "Résultats générés avec succès",
      PDF_GENERATED: "Rapport PDF généré avec succès",
    },
    ERROR: {
      ASSESSMENT_NOT_FOUND: "Diagnostic non trouvé",
      INVALID_QUESTION: "Question invalide",
      INVALID_ANSWER: "Réponse invalide",
      CALCULATION_ERROR: "Erreur lors du calcul des scores",
      PDF_GENERATION_ERROR: "Erreur lors de la génération du PDF",
      DATABASE_ERROR: "Erreur de base de données",
    },
  },

  // Server Configuration
  SERVER: {
    PORT: process.env.PORT || 3000,
    API_PREFIX: "/api/v1",
  },

  // CORS Configuration
  CORS: {
    ORIGIN: process.env.CORS_ORIGIN || "http://localhost:5173",
    CREDENTIALS: true,
  },
};
