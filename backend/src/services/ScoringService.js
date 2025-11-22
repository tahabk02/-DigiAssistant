const { SCORING, MATURITY_THRESHOLDS } = require("../config/constants");
const db = require("../config/database");

/**
 * ScoringService - Handles all scoring calculations
 * Business Rules:
 * - Pillar Score: Sum of all responses for that pillar (max 9 pts)
 * - Dimension Score: Sum of 4 pillar scores (max 36 pts) converted to %
 * - Global Score: Average of 6 dimension scores (%)
 * - Maturity Profile: Based on global score thresholds
 */
class ScoringService {
  /**
   * Calculate complete scores for an assessment
   */
  calculateScores(assessment) {
    const dimensions = db.getDimensions();

    // Calculate scores for each dimension
    const dimensionScores = dimensions.dimensions.map((dimension) => {
      return this.calculateDimensionScore(dimension, assessment.responses);
    });

    // Calculate global score (average of all dimension percentages)
    const globalScore = this.calculateGlobalScore(dimensionScores);

    // Determine maturity profile
    const maturityProfile = this.determineMaturityProfile(globalScore);

    // Identify gaps and strengths
    const analysis = this.analyzeScores(dimensionScores);

    return {
      globalScore,
      maturityProfile,
      dimensionScores,
      ...analysis,
      calculatedAt: new Date().toISOString(),
    };
  }

  /**
   * Calculate score for a single dimension
   */
  calculateDimensionScore(dimension, responses) {
    const pillarScores = dimension.pillars.map((pillar) => {
      return this.calculatePillarScore(dimension.id, pillar.id, responses);
    });

    // Sum of all pillar scores
    const totalPoints = pillarScores.reduce(
      (sum, score) => sum + score.points,
      0
    );

    // Convert to percentage (max 36 points = 100%)
    const percentage = Math.round(
      (totalPoints / SCORING.MAX_DIMENSION_SCORE) * 100
    );

    return {
      dimensionId: dimension.id,
      dimensionName: dimension.name,
      description: dimension.description,
      totalPoints,
      maxPoints: SCORING.MAX_DIMENSION_SCORE,
      percentage,
      pillarScores,
    };
  }

  /**
   * Calculate score for a single pillar
   */
  calculatePillarScore(dimensionId, pillarId, responses) {
    // Get all responses for this pillar
    const pillarResponses = responses.filter(
      (r) =>
        r.dimension === dimensionId &&
        r.pillar === pillarId &&
        r.score !== undefined
    );

    // Sum all scores
    const points = pillarResponses.reduce(
      (sum, response) => sum + response.score,
      0
    );

    // Cap at max pillar score
    const cappedPoints = Math.min(points, SCORING.MAX_PILLAR_SCORE);

    return {
      pillarId,
      points: cappedPoints,
      maxPoints: SCORING.MAX_PILLAR_SCORE,
      percentage: Math.round((cappedPoints / SCORING.MAX_PILLAR_SCORE) * 100),
      responseCount: pillarResponses.length,
    };
  }

  /**
   * Calculate global score (average of dimension percentages)
   */
  calculateGlobalScore(dimensionScores) {
    const sum = dimensionScores.reduce(
      (total, dim) => total + dim.percentage,
      0
    );
    return Math.round(sum / dimensionScores.length);
  }

  /**
   * Determine maturity profile based on global score
   */
  determineMaturityProfile(globalScore) {
    const dimensions = db.getDimensions();
    const profiles = dimensions.maturityProfiles;

    const profile = profiles.find(
      (p) => globalScore >= p.minScore && globalScore <= p.maxScore
    );

    if (!profile) {
      throw new Error("Unable to determine maturity profile");
    }

    return {
      id: profile.id,
      name: profile.name,
      description: profile.description,
      recommendations: profile.recommendations,
      color: profile.color,
      scoreRange: {
        min: profile.minScore,
        max: profile.maxScore,
      },
    };
  }

  /**
   * Analyze scores to identify gaps and strengths
   */
  analyzeScores(dimensionScores) {
    // Sort dimensions by score
    const sorted = [...dimensionScores].sort(
      (a, b) => b.percentage - a.percentage
    );

    // Identify strengths (top 2 dimensions)
    const strengths = sorted.slice(0, 2).map((dim) => ({
      dimensionId: dim.dimensionId,
      dimensionName: dim.dimensionName,
      percentage: dim.percentage,
      level: this.getScoreLevel(dim.percentage),
    }));

    // Identify gaps (bottom 2 dimensions)
    const gaps = sorted.slice(-2).map((dim) => ({
      dimensionId: dim.dimensionId,
      dimensionName: dim.dimensionName,
      percentage: dim.percentage,
      level: this.getScoreLevel(dim.percentage),
      improvementPotential: 100 - dim.percentage,
    }));

    // Identify priority actions (pillars with lowest scores in gap dimensions)
    const priorityActions = this.identifyPriorityActions(gaps, dimensionScores);

    return {
      strengths,
      gaps,
      priorityActions,
    };
  }

  /**
   * Identify priority actions based on weakest pillars
   */
  identifyPriorityActions(gaps, dimensionScores) {
    const actions = [];

    gaps.forEach((gap) => {
      const dimension = dimensionScores.find(
        (d) => d.dimensionId === gap.dimensionId
      );

      if (dimension) {
        // Find weakest pillar in this dimension
        const weakestPillar = [...dimension.pillarScores].sort(
          (a, b) => a.percentage - b.percentage
        )[0];

        actions.push({
          dimensionId: gap.dimensionId,
          dimensionName: gap.dimensionName,
          pillarId: weakestPillar.pillarId,
          currentScore: weakestPillar.percentage,
          priority:
            gap.percentage < 25
              ? "high"
              : gap.percentage < 50
              ? "medium"
              : "low",
        });
      }
    });

    return actions;
  }

  /**
   * Get qualitative level for a score
   */
  getScoreLevel(percentage) {
    if (percentage >= 76) return "excellent";
    if (percentage >= 51) return "good";
    if (percentage >= 26) return "moderate";
    return "low";
  }

  /**
   * Calculate progress score (for real-time display during assessment)
   */
  calculateProgressScore(responses) {
    if (responses.length === 0) return 0;

    const scoredResponses = responses.filter((r) => r.score !== undefined);
    const totalPoints = scoredResponses.reduce((sum, r) => sum + r.score, 0);
    const maxPossiblePoints = scoredResponses.length * SCORING.MAX_PILLAR_SCORE;

    if (maxPossiblePoints === 0) return 0;

    return Math.round((totalPoints / maxPossiblePoints) * 100);
  }
}

module.exports = new ScoringService();
