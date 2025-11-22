/**
 * Result Model
 * Represents the complete diagnostic results for an assessment
 */
class Result {
  constructor(data = {}) {
    this.assessmentId = data.assessmentId || null;
    this.globalScore = data.globalScore || 0;
    this.maturityProfile = data.maturityProfile || null;
    this.dimensionScores = data.dimensionScores || [];
    this.strengths = data.strengths || [];
    this.gaps = data.gaps || [];
    this.priorityActions = data.priorityActions || [];
    this.calculatedAt = data.calculatedAt || new Date().toISOString();
    this.metadata = data.metadata || {};
  }

  /**
   * Get maturity profile ID
   */
  getProfileId() {
    return this.maturityProfile?.id || null;
  }

  /**
   * Get maturity profile name
   */
  getProfileName() {
    return this.maturityProfile?.name || "Unknown";
  }

  /**
   * Get maturity profile color
   */
  getProfileColor() {
    return this.maturityProfile?.color || "#gray";
  }

  /**
   * Get dimension score by ID
   */
  getDimensionScore(dimensionId) {
    return this.dimensionScores.find((d) => d.dimensionId === dimensionId);
  }

  /**
   * Get all dimension scores sorted by percentage
   */
  getDimensionScoresSorted(order = "desc") {
    return [...this.dimensionScores].sort((a, b) => {
      return order === "desc"
        ? b.percentage - a.percentage
        : a.percentage - b.percentage;
    });
  }

  /**
   * Get top performing dimensions
   */
  getTopDimensions(count = 3) {
    return this.getDimensionScoresSorted("desc").slice(0, count);
  }

  /**
   * Get lowest performing dimensions
   */
  getLowestDimensions(count = 3) {
    return this.getDimensionScoresSorted("asc").slice(0, count);
  }

  /**
   * Get average dimension score
   */
  getAverageDimensionScore() {
    if (this.dimensionScores.length === 0) return 0;
    const sum = this.dimensionScores.reduce((acc, d) => acc + d.percentage, 0);
    return Math.round(sum / this.dimensionScores.length);
  }

  /**
   * Get score distribution
   */
  getScoreDistribution() {
    const distribution = {
      excellent: 0, // 76-100
      good: 0, // 51-75
      moderate: 0, // 26-50
      low: 0, // 0-25
    };

    this.dimensionScores.forEach((dim) => {
      if (dim.percentage >= 76) distribution.excellent++;
      else if (dim.percentage >= 51) distribution.good++;
      else if (dim.percentage >= 26) distribution.moderate++;
      else distribution.low++;
    });

    return distribution;
  }

  /**
   * Get overall assessment level
   */
  getOverallLevel() {
    if (this.globalScore >= 76) return "excellent";
    if (this.globalScore >= 51) return "good";
    if (this.globalScore >= 26) return "moderate";
    return "low";
  }

  /**
   * Check if dimension needs attention
   */
  dimensionNeedsAttention(dimensionId, threshold = 40) {
    const dimension = this.getDimensionScore(dimensionId);
    return dimension && dimension.percentage < threshold;
  }

  /**
   * Get critical dimensions (score < 40%)
   */
  getCriticalDimensions() {
    return this.dimensionScores.filter((d) => d.percentage < 40);
  }

  /**
   * Get improvement potential
   */
  getImprovementPotential() {
    return 100 - this.globalScore;
  }

  /**
   * Get detailed summary
   */
  getSummary() {
    return {
      globalScore: this.globalScore,
      profileName: this.getProfileName(),
      profileColor: this.getProfileColor(),
      avgDimensionScore: this.getAverageDimensionScore(),
      distribution: this.getScoreDistribution(),
      topDimensions: this.getTopDimensions(3).map((d) => ({
        name: d.dimensionName,
        score: d.percentage,
      })),
      areasForImprovement: this.getLowestDimensions(3).map((d) => ({
        name: d.dimensionName,
        score: d.percentage,
        potential: 100 - d.percentage,
      })),
      criticalCount: this.getCriticalDimensions().length,
    };
  }

  /**
   * Get recommendations
   */
  getRecommendations() {
    return this.maturityProfile?.recommendations || [];
  }

  /**
   * Get priority actions
   */
  getPriorityActions(limit = 5) {
    return this.priorityActions.slice(0, limit);
  }

  /**
   * Get high priority actions
   */
  getHighPriorityActions() {
    return this.priorityActions.filter((action) => action.priority === "high");
  }

  /**
   * Calculate days since assessment
   */
  getDaysSinceCalculation() {
    const now = new Date();
    const calculated = new Date(this.calculatedAt);
    const diffTime = Math.abs(now - calculated);
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Check if results are recent (within 30 days)
   */
  isRecent(daysThreshold = 30) {
    return this.getDaysSinceCalculation() <= daysThreshold;
  }

  /**
   * Compare with another result (for progress tracking)
   */
  compareWith(previousResult) {
    if (!previousResult) return null;

    const comparison = {
      globalScoreChange: this.globalScore - previousResult.globalScore,
      profileChanged: this.getProfileId() !== previousResult.getProfileId(),
      dimensionChanges: [],
      improvementTrend: null,
    };

    // Compare dimensions
    this.dimensionScores.forEach((current) => {
      const previous = previousResult.getDimensionScore(current.dimensionId);
      if (previous) {
        comparison.dimensionChanges.push({
          dimensionId: current.dimensionId,
          dimensionName: current.dimensionName,
          change: current.percentage - previous.percentage,
          previousScore: previous.percentage,
          currentScore: current.percentage,
        });
      }
    });

    // Determine trend
    if (comparison.globalScoreChange > 5) {
      comparison.improvementTrend = "improving";
    } else if (comparison.globalScoreChange < -5) {
      comparison.improvementTrend = "declining";
    } else {
      comparison.improvementTrend = "stable";
    }

    return comparison;
  }

  /**
   * Export as JSON
   */
  toJSON() {
    return {
      assessmentId: this.assessmentId,
      globalScore: this.globalScore,
      maturityProfile: this.maturityProfile,
      dimensionScores: this.dimensionScores,
      strengths: this.strengths,
      gaps: this.gaps,
      priorityActions: this.priorityActions,
      calculatedAt: this.calculatedAt,
      metadata: this.metadata,
    };
  }

  /**
   * Export summary for API response
   */
  toSummaryJSON() {
    return {
      globalScore: this.globalScore,
      profileName: this.getProfileName(),
      profileColor: this.getProfileColor(),
      topDimensions: this.getTopDimensions(3),
      bottomDimensions: this.getLowestDimensions(3),
      recommendationsCount: this.getRecommendations().length,
      priorityActionsCount: this.priorityActions.length,
    };
  }

  /**
   * Create Result from plain object
   */
  static fromJSON(data) {
    return new Result(data);
  }

  /**
   * Create Result from scoring calculation
   */
  static fromScoring(assessmentId, scoringResult) {
    return new Result({
      assessmentId,
      globalScore: scoringResult.globalScore,
      maturityProfile: scoringResult.maturityProfile,
      dimensionScores: scoringResult.dimensionScores,
      strengths: scoringResult.strengths,
      gaps: scoringResult.gaps,
      priorityActions: scoringResult.priorityActions,
      calculatedAt: scoringResult.calculatedAt,
    });
  }

  /**
   * Validate result data
   */
  validate() {
    const errors = [];

    if (!this.assessmentId) {
      errors.push("Assessment ID is required");
    }

    if (this.globalScore < 0 || this.globalScore > 100) {
      errors.push("Global score must be between 0 and 100");
    }

    if (!this.maturityProfile) {
      errors.push("Maturity profile is required");
    }

    if (
      !Array.isArray(this.dimensionScores) ||
      this.dimensionScores.length === 0
    ) {
      errors.push("Dimension scores are required");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

module.exports = Result;
