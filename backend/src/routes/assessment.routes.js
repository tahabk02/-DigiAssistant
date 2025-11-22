const express = require("express");
const AssessmentController = require("../controllers/AssessmentController");
const {
  validateAssessmentStart,
  validateAnswerSubmission,
  validateAssessmentId,
  createRateLimiter,
} = require("../middleware/validation");

const router = express.Router();

// Rate limiters
const standardLimiter = createRateLimiter(60000, 100); // 100 req/min
const strictLimiter = createRateLimiter(60000, 20); // 20 req/min

// Async wrapper helper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * @route   POST /start
 * @desc    Start a new assessment session
 */
router.post(
  "/start",
  standardLimiter,
  validateAssessmentStart,
  asyncHandler(AssessmentController.startAssessment)
);

/**
 * @route   POST /:id/answer
 * @desc    Submit answer and receive next question
 */
router.post(
  "/:id/answer",
  standardLimiter,
  validateAssessmentId,
  validateAnswerSubmission,
  asyncHandler(AssessmentController.submitAnswer)
);

/**
 * @route   GET /:id
 * @desc    Get assessment details
 */
router.get(
  "/:id",
  standardLimiter,
  validateAssessmentId,
  asyncHandler(AssessmentController.getAssessment)
);

/**
 * @route   GET /:id/progress
 * @desc    Get progress tracking
 */
router.get(
  "/:id/progress",
  standardLimiter,
  validateAssessmentId,
  asyncHandler(AssessmentController.getProgress)
);

/**
 * @route   GET /:id/resume
 * @desc    Resume incomplete assessment
 */
router.get(
  "/:id/resume",
  standardLimiter,
  validateAssessmentId,
  asyncHandler(AssessmentController.resumeAssessment)
);

/**
 * @route   DELETE /:id
 * @desc    Delete assessment
 */
router.delete(
  "/:id",
  strictLimiter,
  validateAssessmentId,
  asyncHandler(AssessmentController.deleteAssessment)
);

module.exports = router;
