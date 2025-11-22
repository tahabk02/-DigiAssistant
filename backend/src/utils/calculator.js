/**
 * Calculator Utilities
 * Helper functions for score calculations and data processing
 */

/**
 * Calculate percentage from score and max
 */
const calculatePercentage = (score, maxScore) => {
  if (maxScore === 0) return 0;
  return Math.round((score / maxScore) * 100);
};

/**
 * Calculate average of an array of numbers
 */
const calculateAverage = (numbers) => {
  if (!numbers || numbers.length === 0) return 0;
  const sum = numbers.reduce((acc, num) => acc + num, 0);
  return Math.round(sum / numbers.length);
};

/**
 * Calculate weighted average
 */
const calculateWeightedAverage = (values) => {
  if (!values || values.length === 0) return 0;

  const totalWeight = values.reduce((sum, v) => sum + v.weight, 0);
  if (totalWeight === 0) return 0;

  const weightedSum = values.reduce((sum, v) => sum + v.value * v.weight, 0);
  return Math.round(weightedSum / totalWeight);
};

/**
 * Normalize score to a specific range
 */
const normalizeScore = (
  score,
  currentMin,
  currentMax,
  targetMin,
  targetMax
) => {
  if (currentMax === currentMin) return targetMin;
  const normalized =
    ((score - currentMin) / (currentMax - currentMin)) *
      (targetMax - targetMin) +
    targetMin;
  return Math.round(normalized);
};

/**
 * Calculate standard deviation
 */
const calculateStandardDeviation = (numbers) => {
  if (!numbers || numbers.length === 0) return 0;

  const avg = calculateAverage(numbers);
  const squareDiffs = numbers.map((value) => Math.pow(value - avg, 2));
  const avgSquareDiff = calculateAverage(squareDiffs);

  return Math.round(Math.sqrt(avgSquareDiff) * 100) / 100;
};

/**
 * Calculate median
 */
const calculateMedian = (numbers) => {
  if (!numbers || numbers.length === 0) return 0;

  const sorted = [...numbers].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  }

  return sorted[middle];
};

/**
 * Calculate score distribution
 */
const calculateDistribution = (scores) => {
  if (!scores || scores.length === 0) {
    return { low: 0, medium: 0, high: 0 };
  }

  const distribution = {
    low: scores.filter((s) => s < 40).length,
    medium: scores.filter((s) => s >= 40 && s < 70).length,
    high: scores.filter((s) => s >= 70).length,
  };

  return {
    low: Math.round((distribution.low / scores.length) * 100),
    medium: Math.round((distribution.medium / scores.length) * 100),
    high: Math.round((distribution.high / scores.length) * 100),
  };
};

/**
 * Calculate percentile rank
 */
const calculatePercentile = (value, dataset) => {
  if (!dataset || dataset.length === 0) return 0;

  const sorted = [...dataset].sort((a, b) => a - b);
  const index = sorted.findIndex((v) => v >= value);

  if (index === -1) return 100;
  return Math.round((index / sorted.length) * 100);
};

/**
 * Calculate growth rate between two scores
 */
const calculateGrowthRate = (oldScore, newScore) => {
  if (oldScore === 0) return newScore > 0 ? 100 : 0;
  return Math.round(((newScore - oldScore) / oldScore) * 100);
};

/**
 * Calculate completion percentage
 */
const calculateCompletionRate = (completed, total) => {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
};

/**
 * Round to specified decimal places
 */
const roundToDecimals = (number, decimals = 2) => {
  const factor = Math.pow(10, decimals);
  return Math.round(number * factor) / factor;
};

/**
 * Clamp value between min and max
 */
const clamp = (value, min, max) => {
  return Math.min(Math.max(value, min), max);
};

/**
 * Calculate score level (low, medium, high)
 */
const getScoreLevel = (score) => {
  if (score < 40) return "low";
  if (score < 70) return "medium";
  return "high";
};

/**
 * Get score label in French
 */
const getScoreLabelFr = (score) => {
  if (score >= 76) return "Excellent";
  if (score >= 51) return "Bon";
  if (score >= 26) return "Moyen";
  return "Faible";
};

/**
 * Calculate improvement potential
 */
const calculateImprovementPotential = (currentScore, maxScore = 100) => {
  return Math.max(0, maxScore - currentScore);
};

/**
 * Calculate score trend from historical data
 */
const calculateTrend = (scores) => {
  if (!scores || scores.length < 2) return "stable";

  const recent = scores.slice(-3);
  const older = scores.slice(0, -3);

  if (older.length === 0) return "stable";

  const recentAvg = calculateAverage(recent);
  const olderAvg = calculateAverage(older);

  const diff = recentAvg - olderAvg;

  if (diff > 5) return "increasing";
  if (diff < -5) return "decreasing";
  return "stable";
};

/**
 * Calculate variance
 */
const calculateVariance = (numbers) => {
  if (!numbers || numbers.length === 0) return 0;

  const avg = calculateAverage(numbers);
  const squareDiffs = numbers.map((value) => Math.pow(value - avg, 2));
  return calculateAverage(squareDiffs);
};

/**
 * Calculate range (max - min)
 */
const calculateRange = (numbers) => {
  if (!numbers || numbers.length === 0) return 0;
  return Math.max(...numbers) - Math.min(...numbers);
};

/**
 * Calculate sum
 */
const calculateSum = (numbers) => {
  if (!numbers || numbers.length === 0) return 0;
  return numbers.reduce((sum, num) => sum + num, 0);
};

/**
 * Calculate min value
 */
const calculateMin = (numbers) => {
  if (!numbers || numbers.length === 0) return 0;
  return Math.min(...numbers);
};

/**
 * Calculate max value
 */
const calculateMax = (numbers) => {
  if (!numbers || numbers.length === 0) return 0;
  return Math.max(...numbers);
};

/**
 * Calculate mode (most frequent value)
 */
const calculateMode = (numbers) => {
  if (!numbers || numbers.length === 0) return null;

  const frequency = {};
  let maxFreq = 0;
  let mode = null;

  numbers.forEach((num) => {
    frequency[num] = (frequency[num] || 0) + 1;
    if (frequency[num] > maxFreq) {
      maxFreq = frequency[num];
      mode = num;
    }
  });

  return mode;
};

/**
 * Calculate coefficient of variation (CV)
 */
const calculateCoefficientOfVariation = (numbers) => {
  if (!numbers || numbers.length === 0) return 0;

  const avg = calculateAverage(numbers);
  if (avg === 0) return 0;

  const stdDev = calculateStandardDeviation(numbers);
  return roundToDecimals((stdDev / avg) * 100, 2);
};

/**
 * Calculate z-score
 */
const calculateZScore = (value, numbers) => {
  if (!numbers || numbers.length === 0) return 0;

  const avg = calculateAverage(numbers);
  const stdDev = calculateStandardDeviation(numbers);

  if (stdDev === 0) return 0;

  return roundToDecimals((value - avg) / stdDev, 2);
};

/**
 * Calculate moving average
 */
const calculateMovingAverage = (numbers, window = 3) => {
  if (!numbers || numbers.length < window) return [];

  const result = [];
  for (let i = 0; i <= numbers.length - window; i++) {
    const windowSlice = numbers.slice(i, i + window);
    result.push(calculateAverage(windowSlice));
  }

  return result;
};

/**
 * Interpolate between two values
 */
const interpolate = (start, end, progress) => {
  return start + (end - start) * clamp(progress, 0, 1);
};

/**
 * Calculate compound growth rate
 */
const calculateCompoundGrowthRate = (startValue, endValue, periods) => {
  if (startValue === 0 || periods === 0) return 0;
  const rate = Math.pow(endValue / startValue, 1 / periods) - 1;
  return Math.round(rate * 100 * 100) / 100;
};

module.exports = {
  calculatePercentage,
  calculateAverage,
  calculateWeightedAverage,
  normalizeScore,
  calculateStandardDeviation,
  calculateMedian,
  calculateDistribution,
  calculatePercentile,
  calculateGrowthRate,
  calculateCompletionRate,
  roundToDecimals,
  clamp,
  getScoreLevel,
  getScoreLabelFr,
  calculateImprovementPotential,
  calculateTrend,
  calculateVariance,
  calculateRange,
  calculateSum,
  calculateMin,
  calculateMax,
  calculateMode,
  calculateCoefficientOfVariation,
  calculateZScore,
  calculateMovingAverage,
  interpolate,
  calculateCompoundGrowthRate,
};
