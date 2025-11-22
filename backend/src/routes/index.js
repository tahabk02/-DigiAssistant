const express = require("express");
const assessmentRoutes = require("./assessment.routes");
const resultsRoutes = require("./results.routes");
const {
  sanitizeInput,
  createRateLimiter,
} = require("../middleware/validation");

const router = express.Router();

// Apply sanitization to all routes
router.use(sanitizeInput);

// Rate limiter for general routes
const standardLimiter = createRateLimiter(60000, 100);

// ==================== HEALTH & INFO ROUTES ====================

/**
 * @route   GET /api/v1/health
 * @desc    Health check endpoint - verify API is running
 * @access  Public
 */
router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "DigiAssistant API is running",
    status: "healthy",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    version: "1.0.0",
    uptime: process.uptime(),
  });
});

/**
 * @route   GET /api/v1/info
 * @desc    Get comprehensive API information and documentation
 * @access  Public
 */
router.get("/info", (req, res) => {
  res.json({
    success: true,
    api: {
      name: "DigiAssistant API",
      version: "1.0.0",
      description:
        "API REST pour le diagnostic de maturité digitale conversationnel et adaptatif",
      documentation: "https://github.com/digitancy/digiassistant",
      support: "support@digitancy.com",
    },
    features: [
      "Diagnostic conversationnel adaptatif",
      "Scoring en temps réel",
      "Analyse multi-dimensionnelle",
      "Export PDF et JSON",
      "Benchmarks sectoriels",
    ],
    endpoints: {
      health: "GET /api/v1/health",
      info: "GET /api/v1/info",
      dimensions: "GET /api/v1/dimensions",
      questions: "GET /api/v1/questions",
      assessments: {
        base: "/api/v1/assessments",
        routes: [
          "POST /start - Démarrer un nouveau diagnostic",
          "POST /:id/answer - Soumettre une réponse",
          "GET /:id - Obtenir les détails",
          "GET /:id/progress - Suivre la progression",
          "GET /:id/resume - Reprendre un diagnostic",
          "DELETE /:id - Supprimer un diagnostic",
        ],
      },
      results: {
        base: "/api/v1/results",
        routes: [
          "GET /:assessmentId - Résultats complets",
          "GET /:assessmentId/summary - Résumé",
          "GET /:assessmentId/dimension/:dimensionId - Détails dimension",
          "GET /:assessmentId/export/pdf - Export PDF",
          "GET /:assessmentId/export/json - Export JSON",
          "POST /:assessmentId/recalculate - Recalculer scores",
          "GET /:assessmentId/comparison - Comparaison benchmarks",
        ],
      },
    },
    rateLimit: {
      standard: "100 requests per minute",
      strict: "20 requests per minute (exports, recalculate)",
    },
  });
});

// ==================== METADATA ROUTES ====================

/**
 * @route   GET /api/v1/dimensions
 * @desc    Get all dimensions structure and metadata
 * @access  Public
 * @returns {Object} Complete dimensions structure with pillars and maturity profiles
 */
router.get("/dimensions", standardLimiter, (req, res) => {
  const db = require("../config/database");
  const dimensions = db.getDimensions();

  res.json({
    success: true,
    message: "Dimensions récupérées avec succès",
    data: {
      count: dimensions.dimensions.length,
      dimensions: dimensions.dimensions,
      maturityProfiles: dimensions.maturityProfiles,
    },
  });
});

/**
 * @route   GET /api/v1/questions
 * @desc    Get all questions in the question bank
 * @access  Public
 * @query   ?type=intro|scored - Filter by question type
 * @query   ?dimension=strategy - Filter by dimension
 * @returns {Object} Questions list with filtering options
 */
router.get("/questions", standardLimiter, (req, res) => {
  const db = require("../config/database");
  let questions = db.getQuestions().questions;

  // Apply filters if provided
  const { type, dimension } = req.query;

  if (type) {
    questions = questions.filter((q) => q.type === type);
  }

  if (dimension) {
    questions = questions.filter((q) => q.dimension === dimension);
  }

  res.json({
    success: true,
    message: "Questions récupérées avec succès",
    data: {
      total: questions.length,
      filters: { type, dimension },
      questions: questions,
    },
  });
});

/**
 * @route   GET /api/v1/questions/:id
 * @desc    Get a specific question by ID
 * @access  Public
 * @params  id - Question ID
 * @returns {Object} Single question with full details
 */
router.get("/questions/:id", standardLimiter, (req, res) => {
  const db = require("../config/database");
  const question = db.getQuestionById(req.params.id);

  if (!question) {
    return res.status(404).json({
      success: false,
      message: "Question non trouvée",
      questionId: req.params.id,
    });
  }

  res.json({
    success: true,
    message: "Question récupérée avec succès",
    data: question,
  });
});

/**
 * @route   GET /api/v1/scoring-rules
 * @desc    Get scoring rules and calculation methodology
 * @access  Public
 * @returns {Object} Complete scoring rules, thresholds, and benchmarks
 */
router.get("/scoring-rules", standardLimiter, (req, res) => {
  const fs = require("fs");
  const path = require("path");

  try {
    const rulesPath = path.join(__dirname, "../../data/scoring-rules.json");
    const rules = JSON.parse(fs.readFileSync(rulesPath, "utf8"));

    res.json({
      success: true,
      message: "Règles de scoring récupérées avec succès",
      data: rules.scoringRules,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des règles de scoring",
    });
  }
});

// ==================== MOUNT SUB-ROUTES ====================

/**
 * Mount assessment routes
 * All routes prefixed with /assessments
 */
router.use("/assessments", assessmentRoutes);

/**
 * Mount results routes
 * All routes prefixed with /results
 */
router.use("/results", resultsRoutes);

// ==================== STATISTICS ROUTES (Future) ====================

/**
 * @route   GET /api/v1/stats
 * @desc    Get global statistics (future feature)
 * @access  Admin
 */
router.get("/stats", standardLimiter, (req, res) => {
  res.json({
    success: true,
    message: "Feature coming soon",
    data: {
      status: "not_implemented",
      description: "Global statistics will be available in future version",
    },
  });
});

// ==================== ERROR HANDLING ====================

/**
 * 404 handler for undefined routes
 */
router.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route non trouvée",
    path: req.path,
    method: req.method,
    suggestion:
      "Consultez /api/v1/info pour voir toutes les routes disponibles",
  });
});

module.exports = router;
