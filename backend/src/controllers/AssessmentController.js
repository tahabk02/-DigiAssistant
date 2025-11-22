const Assessment = require("../models/Assessment");
const db = require("../config/database");
const AdaptiveEngine = require("../services/AdaptiveEngine");
const ScoringService = require("../services/ScoringService");
const { MESSAGES, ASSESSMENT_STATUS } = require("../config/constants");

/**
 * AssessmentController - Handles all assessment-related endpoints
 */
class AssessmentController {
  /**
   * POST /api/v1/assessments/start
   * Start a new assessment
   */
  async startAssessment(req, res) {
    try {
      const { companyName, companySize, sector } = req.body;

      // Create new assessment
      const assessment = new Assessment({
        companyInfo: {
          name: companyName,
          size: companySize || null,
          sector: sector || null,
        },
        status: ASSESSMENT_STATUS.IN_PROGRESS,
        currentQuestionId: "intro_company_size",
      });

      // Save to database
      const savedAssessment = await db.createAssessment(assessment.toJSON());

      // Get first question
      const firstQuestion = AdaptiveEngine.getFirstQuestion();

      res.status(201).json({
        success: true,
        message: MESSAGES.SUCCESS.ASSESSMENT_CREATED,
        data: {
          assessmentId: savedAssessment.id,
          currentQuestion: firstQuestion,
          progress: {
            questionsAnswered: 0,
            estimatedTimeRemaining:
              AdaptiveEngine.estimateTimeRemaining(assessment),
          },
        },
      });
    } catch (error) {
      console.error("Start assessment error:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la création du diagnostic",
        error: error.message,
      });
    }
  }

  /**
   * POST /api/v1/assessments/:id/answer
   * Submit an answer and get next question
   */
  async submitAnswer(req, res) {
    try {
      const { id: assessmentId } = req.params;
      const { questionId, answerId } = req.body;

      // Validate input
      if (!questionId || !answerId) {
        return res.status(400).json({
          success: false,
          message: "Question ID et Answer ID sont requis",
        });
      }

      // Get assessment
      const assessmentData = await db.getAssessmentById(assessmentId);
      if (!assessmentData) {
        return res.status(404).json({
          success: false,
          message: MESSAGES.ERROR.ASSESSMENT_NOT_FOUND,
        });
      }

      const assessment = Assessment.fromJSON(assessmentData);

      // Validate response
      const validation = AdaptiveEngine.validateResponse(questionId, answerId);
      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          message: validation.error,
        });
      }

      // Get question details
      const question = db.getQuestionById(questionId);
      const selectedOption = validation.option;

      // Create response object
      const response = {
        questionId,
        answerId,
        answerText: selectedOption.text,
        dimension: question.dimension,
        pillar: question.pillar,
        score: selectedOption.score !== undefined ? selectedOption.score : null,
      };

      // Handle intro questions (company info)
      if (questionId === "intro_company_size") {
        assessment.companyInfo.size = selectedOption.value;
      } else if (questionId === "intro_sector") {
        assessment.companyInfo.sector = selectedOption.value;
      }

      // Add response to assessment
      assessment.addResponse(response);

      // Get next question
      const nextQuestion = AdaptiveEngine.getNextQuestion(assessment, response);

      if (nextQuestion) {
        // More questions to answer
        assessment.updateCurrentQuestion(nextQuestion.id);
        await db.updateAssessment(assessmentId, assessment.toJSON());

        // Calculate progress score
        const progressScore = ScoringService.calculateProgressScore(
          assessment.responses
        );

        res.json({
          success: true,
          message: MESSAGES.SUCCESS.RESPONSE_SAVED,
          data: {
            nextQuestion,
            progress: {
              questionsAnswered: assessment.responses.length,
              progressScore,
              dimensionProgress:
                AdaptiveEngine.getDimensionProgress(assessment),
              estimatedTimeRemaining:
                AdaptiveEngine.estimateTimeRemaining(assessment),
            },
          },
        });
      } else {
        // Assessment completed
        assessment.complete();

        // Calculate final scores
        const scores = ScoringService.calculateScores(assessment);
        assessment.setScores(scores);

        await db.updateAssessment(assessmentId, assessment.toJSON());

        res.json({
          success: true,
          message: MESSAGES.SUCCESS.ASSESSMENT_COMPLETED,
          data: {
            completed: true,
            assessmentId: assessment.id,
            redirectTo: `/results/${assessment.id}`,
          },
        });
      }
    } catch (error) {
      console.error("Submit answer error:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la sauvegarde de la réponse",
        error: error.message,
      });
    }
  }

  /**
   * GET /api/v1/assessments/:id
   * Get assessment details
   */
  async getAssessment(req, res) {
    try {
      const { id: assessmentId } = req.params;

      const assessmentData = await db.getAssessmentById(assessmentId);
      if (!assessmentData) {
        return res.status(404).json({
          success: false,
          message: MESSAGES.ERROR.ASSESSMENT_NOT_FOUND,
        });
      }

      const assessment = Assessment.fromJSON(assessmentData);

      // Get current question if in progress
      let currentQuestion = null;
      if (!assessment.isCompleted() && assessment.currentQuestionId) {
        currentQuestion = db.getQuestionById(assessment.currentQuestionId);
      }

      res.json({
        success: true,
        data: {
          assessment: assessment.toJSON(),
          currentQuestion: currentQuestion
            ? AdaptiveEngine.formatQuestion(currentQuestion, assessment)
            : null,
          progress: {
            questionsAnswered: assessment.responses.length,
            progressScore: ScoringService.calculateProgressScore(
              assessment.responses
            ),
            dimensionProgress: AdaptiveEngine.getDimensionProgress(assessment),
            estimatedTimeRemaining:
              AdaptiveEngine.estimateTimeRemaining(assessment),
          },
        },
      });
    } catch (error) {
      console.error("Get assessment error:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la récupération du diagnostic",
        error: error.message,
      });
    }
  }

  /**
   * GET /api/v1/assessments/:id/progress
   * Get real-time progress
   */
  async getProgress(req, res) {
    try {
      const { id: assessmentId } = req.params;

      const assessmentData = await db.getAssessmentById(assessmentId);
      if (!assessmentData) {
        return res.status(404).json({
          success: false,
          message: MESSAGES.ERROR.ASSESSMENT_NOT_FOUND,
        });
      }

      const assessment = Assessment.fromJSON(assessmentData);

      res.json({
        success: true,
        data: {
          questionsAnswered: assessment.responses.length,
          progressScore: ScoringService.calculateProgressScore(
            assessment.responses
          ),
          dimensionProgress: AdaptiveEngine.getDimensionProgress(assessment),
          estimatedTimeRemaining:
            AdaptiveEngine.estimateTimeRemaining(assessment),
          status: assessment.status,
        },
      });
    } catch (error) {
      console.error("Get progress error:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la récupération de la progression",
        error: error.message,
      });
    }
  }

  /**
   * DELETE /api/v1/assessments/:id
   * Delete an assessment
   */
  async deleteAssessment(req, res) {
    try {
      const { id: assessmentId } = req.params;

      const assessmentData = await db.getAssessmentById(assessmentId);
      if (!assessmentData) {
        return res.status(404).json({
          success: false,
          message: MESSAGES.ERROR.ASSESSMENT_NOT_FOUND,
        });
      }

      await db.deleteAssessment(assessmentId);

      res.json({
        success: true,
        message: "Diagnostic supprimé avec succès",
      });
    } catch (error) {
      console.error("Delete assessment error:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la suppression du diagnostic",
        error: error.message,
      });
    }
  }

  /**
   * GET /api/v1/assessments/:id/resume
   * Resume an incomplete assessment
   */
  async resumeAssessment(req, res) {
    try {
      const { id: assessmentId } = req.params;

      const assessmentData = await db.getAssessmentById(assessmentId);
      if (!assessmentData) {
        return res.status(404).json({
          success: false,
          message: MESSAGES.ERROR.ASSESSMENT_NOT_FOUND,
        });
      }

      const assessment = Assessment.fromJSON(assessmentData);

      if (assessment.isCompleted()) {
        return res.status(400).json({
          success: false,
          message: "Ce diagnostic est déjà complété",
        });
      }

      // Get current question
      const currentQuestion = db.getQuestionById(assessment.currentQuestionId);
      if (!currentQuestion) {
        return res.status(500).json({
          success: false,
          message: "Question actuelle introuvable",
        });
      }

      res.json({
        success: true,
        data: {
          assessment: assessment.toJSON(),
          currentQuestion: AdaptiveEngine.formatQuestion(
            currentQuestion,
            assessment
          ),
          progress: {
            questionsAnswered: assessment.responses.length,
            progressScore: ScoringService.calculateProgressScore(
              assessment.responses
            ),
            dimensionProgress: AdaptiveEngine.getDimensionProgress(assessment),
            estimatedTimeRemaining:
              AdaptiveEngine.estimateTimeRemaining(assessment),
          },
        },
      });
    } catch (error) {
      console.error("Resume assessment error:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la reprise du diagnostic",
        error: error.message,
      });
    }
  }
}

module.exports = new AssessmentController();
