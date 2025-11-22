/**
 * Response Model
 * Represents a single user response to a question
 */
class Response {
  constructor(data = {}) {
    this.questionId = data.questionId || null;
    this.answerId = data.answerId || null;
    this.answerText = data.answerText || null;
    this.dimension = data.dimension || null;
    this.pillar = data.pillar || null;
    this.score = data.score !== undefined ? data.score : null;
    this.answeredAt = data.answeredAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || null;
  }

  /**
   * Check if response is scored
   */
  isScored() {
    return this.score !== null && this.score !== undefined;
  }

  /**
   * Check if response is intro question
   */
  isIntroQuestion() {
    return this.dimension === null && this.pillar === null;
  }

  /**
   * Get response age in minutes
   */
  getAgeInMinutes() {
    const now = new Date();
    const answered = new Date(this.answeredAt);
    return Math.floor((now - answered) / 1000 / 60);
  }

  /**
   * Validate response data
   */
  validate() {
    const errors = [];

    if (!this.questionId) {
      errors.push("Question ID is required");
    }

    if (!this.answerId) {
      errors.push("Answer ID is required");
    }

    if (!this.answerText) {
      errors.push("Answer text is required");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Convert to plain object
   */
  toJSON() {
    return {
      questionId: this.questionId,
      answerId: this.answerId,
      answerText: this.answerText,
      dimension: this.dimension,
      pillar: this.pillar,
      score: this.score,
      answeredAt: this.answeredAt,
      updatedAt: this.updatedAt,
    };
  }

  /**
   * Create Response from plain object
   */
  static fromJSON(data) {
    return new Response(data);
  }

  /**
   * Create Response from question and selected option
   */
  static fromQuestionAndOption(question, option) {
    return new Response({
      questionId: question.id,
      answerId: option.id,
      answerText: option.text,
      dimension: question.dimension,
      pillar: question.pillar,
      score: option.score !== undefined ? option.score : null,
    });
  }

  /**
   * Clone response
   */
  clone() {
    return new Response(this.toJSON());
  }

  /**
   * Update response
   */
  update(updates) {
    Object.assign(this, updates);
    this.updatedAt = new Date().toISOString();
    return this;
  }

  /**
   * Get score level (for scored responses)
   */
  getScoreLevel() {
    if (!this.isScored()) return null;

    if (this.score >= 7) return "high";
    if (this.score >= 4) return "medium";
    return "low";
  }

  /**
   * Get score percentage (score out of 9)
   */
  getScorePercentage() {
    if (!this.isScored()) return null;
    return Math.round((this.score / 9) * 100);
  }

  /**
   * Check if response belongs to a dimension
   */
  belongsToDimension(dimensionId) {
    return this.dimension === dimensionId;
  }

  /**
   * Check if response belongs to a pillar
   */
  belongsToPillar(dimensionId, pillarId) {
    return this.dimension === dimensionId && this.pillar === pillarId;
  }

  /**
   * Get response summary
   */
  getSummary() {
    return {
      question: this.questionId,
      answer: this.answerText,
      score: this.score,
      level: this.getScoreLevel(),
      dimension: this.dimension,
      pillar: this.pillar,
    };
  }
}

module.exports = Response;
