const db = require("../config/database");

/**
 * AdaptiveEngine - Manages conversational flow and adaptive question logic
 * This is the core intelligence that makes the diagnostic adaptive
 */
class AdaptiveEngine {
  /**
   * Get the next question based on current state and last response
   */
  getNextQuestion(assessment, lastResponse) {
    try {
      const currentQuestion = db.getQuestionById(lastResponse.questionId);

      if (!currentQuestion) {
        throw new Error("Current question not found");
      }

      // Check if there are conditional rules
      if (currentQuestion.conditionalNext && lastResponse.answerId) {
        const conditionalNextId =
          currentQuestion.conditionalNext[lastResponse.answerId];

        if (conditionalNextId) {
          const nextQuestion = db.getQuestionById(conditionalNextId);
          if (nextQuestion) {
            return this.formatQuestion(nextQuestion, assessment);
          }
        }
      }

      // Use default next question
      if (currentQuestion.nextQuestion) {
        const nextQuestion = db.getQuestionById(currentQuestion.nextQuestion);
        if (nextQuestion) {
          return this.formatQuestion(nextQuestion, assessment);
        }
      }

      // No more questions - assessment is complete
      return null;
    } catch (error) {
      console.error("Error getting next question:", error);
      throw error;
    }
  }

  /**
   * Get first question to start assessment
   */
  getFirstQuestion() {
    try {
      const questions = db.getQuestions();
      const firstQuestion = questions.questions.find(
        (q) => q.id === "intro_company_size"
      );

      if (!firstQuestion) {
        throw new Error("First question not found");
      }

      return this.formatQuestion(firstQuestion, null);
    } catch (error) {
      console.error("Error getting first question:", error);
      throw error;
    }
  }

  /**
   * Format question with additional context
   */
  formatQuestion(question, assessment) {
    return {
      id: question.id,
      type: question.type,
      text: this.personalizeQuestionText(question.text, assessment),
      options: question.options,
      dimension: question.dimension,
      pillar: question.pillar,
      metadata: {
        isScored: question.type === "scored",
        hasConditionalLogic: !!question.conditionalNext,
        isLastQuestion: !question.nextQuestion,
      },
    };
  }

  /**
   * Personalize question text based on context
   * Can add company name, previous answers, etc.
   */
  personalizeQuestionText(text, assessment) {
    if (!assessment || !assessment.companyInfo) {
      return text;
    }

    // Replace placeholders with actual data
    let personalizedText = text;

    if (assessment.companyInfo.name) {
      personalizedText = personalizedText.replace(
        /votre entreprise/gi,
        assessment.companyInfo.name
      );
    }

    return personalizedText;
  }

  /**
   * Determine if assessment should continue to next dimension
   * Based on adaptive logic rules
   */
  shouldSkipDimension(dimensionId, assessment) {
    // Example: Skip security dimension if company is very small
    if (dimensionId === "security" && assessment.companyInfo.size === "micro") {
      // Could implement logic to skip or simplify questions
      return false; // For now, don't skip
    }

    return false;
  }

  /**
   * Get suggested follow-up questions based on responses
   * For more advanced adaptive logic
   */
  getSuggestedFollowUps(assessment, currentDimension) {
    const responses = assessment.getResponsesByDimension(currentDimension);
    const suggestions = [];

    // Example: If user scored low on a pillar, suggest deep-dive questions
    responses.forEach((response) => {
      if (response.score !== undefined && response.score <= 3) {
        suggestions.push({
          pillarId: response.pillar,
          reason: "low_score",
          priority: "high",
        });
      }
    });

    return suggestions;
  }

  /**
   * Calculate estimated time remaining
   */
  estimateTimeRemaining(assessment) {
    const questionsAnswered = assessment.responses.length;
    const estimatedTotalQuestions = 2 + 6 * 4 * 1.5; // intro + dimensions
    const questionsRemaining = Math.max(
      0,
      estimatedTotalQuestions - questionsAnswered
    );

    // Assume 20 seconds per question
    const secondsRemaining = questionsRemaining * 20;

    return {
      questionsRemaining: Math.round(questionsRemaining),
      estimatedMinutes: Math.round(secondsRemaining / 60),
      percentComplete: Math.min(
        Math.round((questionsAnswered / estimatedTotalQuestions) * 100),
        100
      ),
    };
  }

  /**
   * Get dimension progress
   */
  getDimensionProgress(assessment) {
    const dimensions = db.getDimensions();

    return dimensions.dimensions.map((dimension) => {
      const dimensionResponses = assessment.getResponsesByDimension(
        dimension.id
      );
      const totalPillars = dimension.pillars.length;

      // Count unique pillars answered
      const answeredPillars = new Set(dimensionResponses.map((r) => r.pillar))
        .size;

      return {
        dimensionId: dimension.id,
        dimensionName: dimension.name,
        progress:
          totalPillars > 0
            ? Math.round((answeredPillars / totalPillars) * 100)
            : 0,
        questionsAnswered: dimensionResponses.length,
        status:
          answeredPillars === totalPillars
            ? "completed"
            : answeredPillars > 0
            ? "in_progress"
            : "not_started",
      };
    });
  }

  /**
   * Validate if response is appropriate for question
   */
  validateResponse(questionId, answerId) {
    try {
      const question = db.getQuestionById(questionId);

      if (!question) {
        return { valid: false, error: "Question not found" };
      }

      const validOption = question.options.find((opt) => opt.id === answerId);

      if (!validOption) {
        return { valid: false, error: "Invalid answer option" };
      }

      return { valid: true, option: validOption };
    } catch (error) {
      console.error("Error validating response:", error);
      return { valid: false, error: error.message };
    }
  }

  /**
   * Get conversational context for AI-enhanced responses
   */
  getConversationalContext(assessment) {
    return {
      companySize: assessment.companyInfo.size,
      sector: assessment.companyInfo.sector,
      questionsAnswered: assessment.responses.length,
      currentDimension: this.getCurrentDimension(assessment),
      recentScores: this.getRecentScores(assessment, 3),
    };
  }

  /**
   * Get current dimension being assessed
   */
  getCurrentDimension(assessment) {
    if (assessment.responses.length === 0) {
      return null;
    }

    const lastResponse = assessment.responses[assessment.responses.length - 1];
    return lastResponse.dimension;
  }

  /**
   * Get recent scores for context
   */
  getRecentScores(assessment, count = 3) {
    return assessment.responses
      .filter((r) => r.score !== undefined)
      .slice(-count)
      .map((r) => ({
        dimension: r.dimension,
        pillar: r.pillar,
        score: r.score,
      }));
  }

  /**
   * Get question path trace (for debugging)
   */
  getQuestionPath(assessment) {
    return assessment.responses.map((r, index) => ({
      step: index + 1,
      questionId: r.questionId,
      answerId: r.answerId,
      score: r.score,
      dimension: r.dimension,
      pillar: r.pillar,
    }));
  }

  /**
   * Calculate assessment completion percentage
   */
  getCompletionPercentage(assessment) {
    const timeEstimate = this.estimateTimeRemaining(assessment);
    return timeEstimate.percentComplete;
  }

  /**
   * Check if assessment is at a milestone
   */
  checkMilestone(assessment) {
    const progress = this.getCompletionPercentage(assessment);

    const milestones = [25, 50, 75, 100];
    const currentMilestone = milestones.find(
      (m) => progress >= m && progress < m + 5
    );

    if (currentMilestone) {
      return {
        reached: true,
        milestone: currentMilestone,
        message: this.getMilestoneMessage(currentMilestone),
      };
    }

    return { reached: false };
  }

  /**
   * Get milestone message
   */
  getMilestoneMessage(milestone) {
    const messages = {
      25: "Excellent début ! Vous avez complété 25% du diagnostic.",
      50: "Bravo ! Vous êtes à mi-chemin.",
      75: "Presque terminé ! Plus que quelques questions.",
      100: "Félicitations ! Diagnostic complété.",
    };

    return messages[milestone] || "";
  }

  /**
   * Get adaptive recommendations during assessment
   */
  getInProgressRecommendations(assessment) {
    const recommendations = [];
    const dimensionProgress = this.getDimensionProgress(assessment);

    // Check for low scores in completed dimensions
    dimensionProgress
      .filter((d) => d.status === "completed")
      .forEach((dim) => {
        const responses = assessment.getResponsesByDimension(dim.dimensionId);
        const avgScore =
          responses.reduce((sum, r) => sum + (r.score || 0), 0) /
          responses.length;

        if (avgScore < 4) {
          recommendations.push({
            type: "improvement_area",
            dimension: dim.dimensionName,
            message: `La dimension "${dim.dimensionName}" nécessitera une attention particulière.`,
          });
        }
      });

    return recommendations;
  }
}

module.exports = new AdaptiveEngine();
