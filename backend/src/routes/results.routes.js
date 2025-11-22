const express = require("express");
const ResultsController = require("../controllers/ResultsController");
const {
  validateAssessmentId,
  validateDimensionId,
  createRateLimiter,
} = require("../middleware/validation");

const router = express.Router();

// ==================== ASYNC HANDLER ====================
/**
 * Wrapper to catch async errors and pass to error middleware
 * Replaces try-catch blocks in every route handler
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// ==================== RATE LIMITERS ====================
const standardLimiter = createRateLimiter(60000, 100); // 100 requests per minute
const strictLimiter = createRateLimiter(60000, 20); // 20 requests per minute for heavy operations

// ==================== RESULTS ROUTES ====================

/**
 * @route   GET /:assessmentId
 * @desc    Get complete assessment results with all scores and analysis
 * @access  Public
 * @params  assessmentId - The unique assessment identifier
 * @returns {Object} Complete results including:
 *          - globalScore: Overall maturity score (0-100)
 *          - maturityProfile: Profile classification (Beginner/Emergent/Challenger/Leader)
 *          - dimensionScores: Detailed scores for each of 6 dimensions
 *          - strengths: Top performing dimensions
 *          - gaps: Areas needing improvement
 *          - priorityActions: Recommended next steps
 * @example GET /api/v1/results/assess_1234567890_abc123
 */
router.get(
  "/:assessmentId",
  standardLimiter,
  validateAssessmentId,
  asyncHandler(ResultsController.getResults)
);

/**
 * @route   GET /:assessmentId/summary
 * @desc    Get summarized results for quick dashboard view
 * @access  Public
 * @params  assessmentId - The unique assessment identifier
 * @returns {Object} Summary including:
 *          - globalScore: Overall score
 *          - maturityProfile: Basic profile info (id, name, color)
 *          - topDimensions: 3 highest scoring dimensions
 *          - bottomDimensions: 3 lowest scoring dimensions
 * @example GET /api/v1/results/assess_1234567890_abc123/summary
 */
router.get(
  "/:assessmentId/summary",
  standardLimiter,
  validateAssessmentId,
  asyncHandler(ResultsController.getSummary)
);

/**
 * @route   GET /:assessmentId/dimension/:dimensionId
 * @desc    Get detailed analysis for a specific dimension
 * @access  Public
 * @params  assessmentId - The unique assessment identifier
 * @params  dimensionId - Dimension identifier (strategy|culture|customer|process|technology|security)
 * @returns {Object} Dimension details including:
 *          - dimension: Dimension score breakdown with pillar details
 *          - responses: All user responses for this dimension
 *          - analysis: Statistical analysis and insights
 * @example GET /api/v1/results/assess_1234567890_abc123/dimension/strategy
 */
router.get(
  "/:assessmentId/dimension/:dimensionId",
  standardLimiter,
  validateAssessmentId,
  validateDimensionId,
  asyncHandler(ResultsController.getDimensionDetails)
);

/**
 * @route   GET /:assessmentId/export/pdf
 * @desc    Generate and download PDF report of the assessment results
 * @access  Public
 * @params  assessmentId - The unique assessment identifier
 * @returns {File} PDF file with complete diagnostic report
 * @note    This is a heavy operation, rate limited to 20 requests per minute
 * @example GET /api/v1/results/assess_1234567890_abc123/export/pdf
 */
router.get(
  "/:assessmentId/export/pdf",
  strictLimiter,
  validateAssessmentId,
  asyncHandler(ResultsController.exportPDF)
);

/**
 * @route   GET /:assessmentId/export/json
 * @desc    Export complete results as structured JSON file
 * @access  Public
 * @params  assessmentId - The unique assessment identifier
 * @returns {File} JSON file containing:
 *          - All assessment data
 *          - Complete scoring breakdown
 *          - All user responses
 *          - Recommendations and analysis
 * @use-case Useful for:
 *          - Data integration with other systems
 *          - Archiving assessment results
 *          - Custom report generation
 * @example GET /api/v1/results/assess_1234567890_abc123/export/json
 */
router.get(
  "/:assessmentId/export/json",
  standardLimiter,
  validateAssessmentId,
  asyncHandler(ResultsController.exportJSON)
);

/**
 * @route   POST /:assessmentId/recalculate
 * @desc    Force recalculation of scores (admin/debugging feature)
 * @access  Public
 * @params  assessmentId - The unique assessment identifier
 * @returns {Object} Newly calculated scores
 * @use-case Useful when:
 *          - Scoring rules have been updated
 *          - Manual score verification needed
 *          - Debugging scoring logic
 * @note    Rate limited due to computational cost
 * @example POST /api/v1/results/assess_1234567890_abc123/recalculate
 */
router.post(
  "/:assessmentId/recalculate",
  strictLimiter,
  validateAssessmentId,
  asyncHandler(ResultsController.recalculateScores)
);

/**
 * @route   GET /:assessmentId/comparison
 * @desc    Compare assessment results with industry benchmarks
 * @access  Public
 * @params  assessmentId - The unique assessment identifier
 * @returns {Object} Comparison data including:
 *          - yourScore: Company's actual score
 *          - industryAverage: Average score for the sector
 *          - topPerformers: Score of top 25% in sector
 *          - position: Relative position (above_average|average|below_average)
 * @note    Benchmarks are based on company size and sector
 * @example GET /api/v1/results/assess_1234567890_abc123/comparison
 */
router.get(
  "/:assessmentId/comparison",
  standardLimiter,
  validateAssessmentId,
  asyncHandler(ResultsController.getComparison)
);

// ==================== FUTURE FEATURES ====================

/**
 * @route   GET /:assessmentId/recommendations
 * @desc    Get personalized AI-powered recommendations based on results
 * @access  Public
 * @params  assessmentId - The unique assessment identifier
 * @future  This endpoint will provide AI-generated recommendations
 * @example GET /api/v1/results/assess_1234567890_abc123/recommendations
 */
router.get(
  "/:assessmentId/recommendations",
  standardLimiter,
  validateAssessmentId,
  asyncHandler(async (req, res) => {
    res.json({
      success: true,
      message: "Feature coming soon",
      data: {
        status: "not_implemented",
        description:
          "AI-powered recommendations will be available in future version",
        planned: true,
      },
    });
  })
);

/**
 * @route   GET /:assessmentId/insights
 * @desc    Get advanced insights and trends analysis
 * @access  Public
 * @params  assessmentId - The unique assessment identifier
 * @future  This endpoint will provide deeper analytics
 * @example GET /api/v1/results/assess_1234567890_abc123/insights
 */
router.get(
  "/:assessmentId/insights",
  standardLimiter,
  validateAssessmentId,
  asyncHandler(async (req, res) => {
    res.json({
      success: true,
      message: "Feature coming soon",
      data: {
        status: "not_implemented",
        description:
          "Advanced insights and trends analysis coming in future version",
        planned: true,
      },
    });
  })
);

// ==================== ERROR HANDLING ====================

/**
 * 404 handler for results routes
 * Catches any undefined result routes and returns helpful error
 */
router.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route de résultats non trouvée",
    path: req.path,
    method: req.method,
    availableRoutes: [
      "GET /:assessmentId",
      "GET /:assessmentId/summary",
      "GET /:assessmentId/dimension/:dimensionId",
      "GET /:assessmentId/export/pdf",
      "GET /:assessmentId/export/json",
      "POST /:assessmentId/recalculate",
      "GET /:assessmentId/comparison",
      "GET /:assessmentId/recommendations (coming soon)",
      "GET /:assessmentId/insights (coming soon)",
    ],
  });
});

module.exports = router;
