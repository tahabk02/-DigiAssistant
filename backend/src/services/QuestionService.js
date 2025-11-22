const db = require("../config/database");

/**
 * QuestionService - Manages question retrieval and filtering
 */
class QuestionService {
  /**
   * Get all questions
   */
  getAllQuestions() {
    const questions = db.getQuestions();
    return questions.questions;
  }

  /**
   * Get question by ID
   */
  getQuestionById(questionId) {
    return db.getQuestionById(questionId);
  }

  /**
   * Get questions by dimension
   */
  getQuestionsByDimension(dimensionId) {
    const allQuestions = this.getAllQuestions();
    return allQuestions.filter((q) => q.dimension === dimensionId);
  }

  /**
   * Get questions by pillar
   */
  getQuestionsByPillar(dimensionId, pillarId) {
    const allQuestions = this.getAllQuestions();
    return allQuestions.filter(
      (q) => q.dimension === dimensionId && q.pillar === pillarId
    );
  }

  /**
   * Get questions by type
   */
  getQuestionsByType(type) {
    const allQuestions = this.getAllQuestions();
    return allQuestions.filter((q) => q.type === type);
  }

  /**
   * Get intro questions
   */
  getIntroQuestions() {
    return this.getQuestionsByType("intro");
  }

  /**
   * Get scored questions
   */
  getScoredQuestions() {
    return this.getQuestionsByType("scored");
  }

  /**
   * Validate question structure
   */
  validateQuestion(question) {
    const errors = [];

    if (!question.id) {
      errors.push("Question ID is required");
    }

    if (!question.type) {
      errors.push("Question type is required");
    }

    if (!question.text) {
      errors.push("Question text is required");
    }

    if (!question.options || !Array.isArray(question.options)) {
      errors.push("Question options must be an array");
    }

    if (question.options && question.options.length === 0) {
      errors.push("Question must have at least one option");
    }

    // Validate options
    if (question.options) {
      question.options.forEach((option, index) => {
        if (!option.id) {
          errors.push(`Option ${index} missing ID`);
        }
        if (!option.text) {
          errors.push(`Option ${index} missing text`);
        }
        if (question.type === "scored" && option.score === undefined) {
          errors.push(
            `Option ${index} missing score (required for scored questions)`
          );
        }
      });
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get question statistics
   */
  getQuestionStats() {
    const allQuestions = this.getAllQuestions();
    const dimensions = db.getDimensions();

    const stats = {
      total: allQuestions.length,
      byType: {},
      byDimension: {},
      avgOptionsPerQuestion: 0,
    };

    // Count by type
    allQuestions.forEach((q) => {
      stats.byType[q.type] = (stats.byType[q.type] || 0) + 1;
    });

    // Count by dimension
    dimensions.dimensions.forEach((dim) => {
      const dimQuestions = this.getQuestionsByDimension(dim.id);
      stats.byDimension[dim.id] = {
        name: dim.name,
        count: dimQuestions.length,
        byPillar: {},
      };

      // Count by pillar
      dim.pillars.forEach((pillar) => {
        const pillarQuestions = this.getQuestionsByPillar(dim.id, pillar.id);
        stats.byDimension[dim.id].byPillar[pillar.id] = pillarQuestions.length;
      });
    });

    // Calculate average options
    const totalOptions = allQuestions.reduce(
      (sum, q) => sum + q.options.length,
      0
    );
    stats.avgOptionsPerQuestion =
      Math.round((totalOptions / allQuestions.length) * 10) / 10;

    return stats;
  }

  /**
   * Find questions with conditional logic
   */
  getConditionalQuestions() {
    const allQuestions = this.getAllQuestions();
    return allQuestions.filter(
      (q) => q.conditionalNext && Object.keys(q.conditionalNext).length > 0
    );
  }

  /**
   * Get question flow path
   */
  getQuestionFlow(startQuestionId = "intro_company_size") {
    const flow = [];
    let currentQuestionId = startQuestionId;
    const visited = new Set();

    while (currentQuestionId && !visited.has(currentQuestionId)) {
      visited.add(currentQuestionId);
      const question = this.getQuestionById(currentQuestionId);

      if (!question) break;

      flow.push({
        id: question.id,
        text: question.text,
        type: question.type,
        dimension: question.dimension,
        pillar: question.pillar,
        hasConditionalLogic: !!question.conditionalNext,
      });

      currentQuestionId = question.nextQuestion;
    }

    return flow;
  }

  /**
   * Search questions by text
   */
  searchQuestions(searchTerm) {
    const allQuestions = this.getAllQuestions();
    const lowerSearchTerm = searchTerm.toLowerCase();

    return allQuestions.filter(
      (q) =>
        q.text.toLowerCase().includes(lowerSearchTerm) ||
        q.id.toLowerCase().includes(lowerSearchTerm) ||
        q.options.some((opt) =>
          opt.text.toLowerCase().includes(lowerSearchTerm)
        )
    );
  }

  /**
   * Get questions requiring attention (validation issues)
   */
  validateAllQuestions() {
    const allQuestions = this.getAllQuestions();
    const issues = [];

    allQuestions.forEach((question) => {
      const validation = this.validateQuestion(question);
      if (!validation.valid) {
        issues.push({
          questionId: question.id,
          errors: validation.errors,
        });
      }
    });

    return {
      valid: issues.length === 0,
      totalQuestions: allQuestions.length,
      issuesFound: issues.length,
      issues,
    };
  }

  /**
   * Get next question preview (for testing)
   */
  previewNextQuestion(currentQuestionId, selectedOptionId) {
    const currentQuestion = this.getQuestionById(currentQuestionId);

    if (!currentQuestion) {
      return { error: "Current question not found" };
    }

    // Check conditional logic first
    if (
      currentQuestion.conditionalNext &&
      currentQuestion.conditionalNext[selectedOptionId]
    ) {
      const nextId = currentQuestion.conditionalNext[selectedOptionId];
      return this.getQuestionById(nextId);
    }

    // Use default next
    if (currentQuestion.nextQuestion) {
      return this.getQuestionById(currentQuestion.nextQuestion);
    }

    return null; // End of assessment
  }
}

module.exports = new QuestionService();
