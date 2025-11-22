/**
 * Format duration in minutes to human readable string
 * @param {number} minutes - Duration in minutes
 * @returns {string} Formatted duration
 */
export const formatDuration = (minutes) => {
  if (minutes < 1) {
    return "moins d'une minute";
  }

  if (minutes < 60) {
    return `${Math.round(minutes)} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.round(minutes % 60);

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h${remainingMinutes.toString().padStart(2, "0")}`;
};

/**
 * Get color class based on score percentage
 * @param {number} score - Score percentage (0-100)
 * @returns {string} Tailwind color class
 */
export const getScoreColor = (score) => {
  if (score >= 76) return "text-green-600";
  if (score >= 51) return "text-blue-600";
  if (score >= 26) return "text-orange-600";
  return "text-red-600";
};

/**
 * Get score label based on percentage
 * @param {number} score - Score percentage (0-100)
 * @returns {string} Score label
 */
export const getScoreLabel = (score) => {
  if (score >= 76) return "Excellent";
  if (score >= 51) return "Bon";
  if (score >= 26) return "Moyen";
  return "Faible";
};

/**
 * Get background color class based on score percentage
 * @param {number} score - Score percentage (0-100)
 * @returns {string} Tailwind background color class
 */
export const getScoreBgColor = (score) => {
  if (score >= 76) return "bg-green-500";
  if (score >= 51) return "bg-blue-500";
  if (score >= 26) return "bg-orange-500";
  return "bg-red-500";
};

/**
 * Format percentage with proper rounding
 * @param {number} value - Percentage value (0-100)
 * @param {number} decimals - Number of decimals
 * @returns {string} Formatted percentage
 */
export const formatPercentage = (value, decimals = 0) => {
  return `${Math.round(value)}%`;
};

/**
 * Format large numbers with K/M suffixes
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
export const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
};

/**
 * Format currency
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (EUR, USD, etc.)
 * @returns {string} Formatted currency
 */
export const formatCurrency = (amount, currency = "EUR") => {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: currency,
  }).format(amount);
};

/**
 * Format date to French locale
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date
 */
export const formatDate = (date) => {
  return new Intl.DateTimeFormat("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
};

/**
 * Format date and time to French locale
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date and time
 */
export const formatDateTime = (date) => {
  return new Intl.DateTimeFormat("fr-FR", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
};

/**
 * Capitalize first letter of a string
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
export const capitalize = (str) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Format file size in human readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export default {
  formatDuration,
  getScoreColor,
  getScoreLabel,
  getScoreBgColor,
  formatPercentage,
  formatNumber,
  formatCurrency,
  formatDate,
  formatDateTime,
  capitalize,
  formatFileSize,
};
