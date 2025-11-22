const { ASSESSMENT_STATUS } = require("../config/constants");

/**
 * Assessment Model
 * Represents a user's diagnostic journey
 */
class Assessment {
  constructor(data = {}) {
    this.id = data.id || null;
    this.companyInfo = {
      size: data.companyInfo?.size || null,
      sector: data.companyInfo?.sector || null,
      name: data.companyInfo?.name || null,
    };
    this.responses = data.responses || [];
    this.currentQuestionId = data.currentQuestionId || "intro_company_size";
    this.status = data.status || ASSESSMENT_STATUS.IN_PROGRESS;
    this.scores = data.scores || null;
    this.results = data.results || null;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
    this.completedAt = data.completedAt || null;
  }

  /**
   * Add a response to the assessment
   */
  addResponse(response) {
    // Check if response already exists for this question
    const existingIndex = this.responses.findIndex(
      (r) => r.questionId === response.questionId
    );

    if (existingIndex !== -1) {
      // Update existing response
      this.responses[existingIndex] = {
        ...this.responses[existingIndex],
        ...response,
        updatedAt: new Date().toISOString(),
      };
    } else {
      // Add new response
      this.responses.push({
        ...response,
        answeredAt: new Date().toISOString(),
      });
    }

    this.updatedAt = new Date().toISOString();
  }

  /**
   * Get response for a specific question
   */
  getResponse(questionId) {
    return this.responses.find((r) => r.questionId === questionId);
  }

  /**
   * Update current question
   */
  updateCurrentQuestion(questionId) {
    this.currentQuestionId = questionId;
    this.updatedAt = new Date().toISOString();
  }

  /**
   * Mark assessment as completed
   */
  complete() {
    this.status = ASSESSMENT_STATUS.COMPLETED;
    this.completedAt = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }

  /**
   * Store calculated scores
   */
  setScores(scores) {
    this.scores = scores;
    this.updatedAt = new Date().toISOString();
  }

  /**
   * Store final results
   */
  setResults(results) {
    this.results = results;
    this.updatedAt = new Date().toISOString();
  }

  /**
   * Get progress percentage
   */
  getProgress() {
    const totalQuestions = this.responses.length;
    // Approximate total (intro + 6 dimensions * 4 pillars * ~1.5 questions avg)
    const estimatedTotal = 2 + 6 * 4 * 1.5;
    return Math.min(Math.round((totalQuestions / estimatedTotal) * 100), 100);
  }

  /**
   * Check if assessment is completed
   */
  isCompleted() {
    return this.status === ASSESSMENT_STATUS.COMPLETED;
  }

  /**
   * Get responses for a specific dimension
   */
  getResponsesByDimension(dimensionId) {
    return this.responses.filter((r) => r.dimension === dimensionId);
  }

  /**
   * Get responses for a specific pillar
   */
  getResponsesByPillar(dimensionId, pillarId) {
    return this.responses.filter(
      (r) => r.dimension === dimensionId && r.pillar === pillarId
    );
  }

  /**
   * Convert to plain object for storage
   */
  toJSON() {
    return {
      id: this.id,
      companyInfo: this.companyInfo,
      responses: this.responses,
      currentQuestionId: this.currentQuestionId,
      status: this.status,
      scores: this.scores,
      results: this.results,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      completedAt: this.completedAt,
    };
  }

  /**
   * Create Assessment from plain object
   */
  static fromJSON(data) {
    return new Assessment(data);
  }
}

module.exports = Assessment;
