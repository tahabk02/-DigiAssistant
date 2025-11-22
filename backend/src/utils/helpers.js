/**
 * Helper Utilities
 * General utility functions used across the application
 */

/**
 * Format date to French locale
 */
const formatDate = (date, format = "long") => {
  const d = new Date(date);

  if (isNaN(d.getTime())) {
    return "Date invalide";
  }

  if (format === "long") {
    return d.toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  if (format === "short") {
    return d.toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  }

  if (format === "time") {
    return d.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return d.toISOString();
};

/**
 * Format duration in human-readable format
 */
const formatDuration = (minutes) => {
  if (minutes < 1) {
    return "Moins d'une minute";
  }

  if (minutes < 60) {
    return `${minutes} minute${minutes > 1 ? "s" : ""}`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours} heure${hours > 1 ? "s" : ""}`;
  }

  return `${hours}h ${remainingMinutes}min`;
};

/**
 * Format relative time (ago)
 */
const formatRelativeTime = (date) => {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "À l'instant";
  if (diffMins < 60)
    return `Il y a ${diffMins} minute${diffMins > 1 ? "s" : ""}`;
  if (diffHours < 24)
    return `Il y a ${diffHours} heure${diffHours > 1 ? "s" : ""}`;
  if (diffDays < 7) return `Il y a ${diffDays} jour${diffDays > 1 ? "s" : ""}`;
  if (diffDays < 30)
    return `Il y a ${Math.floor(diffDays / 7)} semaine${
      diffDays >= 14 ? "s" : ""
    }`;
  return formatDate(date, "short");
};

/**
 * Generate unique ID
 */
const generateId = (prefix = "id") => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return `${prefix}_${timestamp}_${random}`;
};

/**
 * Generate short ID
 */
const generateShortId = (length = 8) => {
  return Math.random().toString(36).substr(2, length).toUpperCase();
};

/**
 * Validate email format
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate URL format
 */
const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Sanitize filename
 */
const sanitizeFilename = (filename) => {
  return filename
    .replace(/[^a-z0-9_\-\.]/gi, "_")
    .replace(/_{2,}/g, "_")
    .toLowerCase();
};

/**
 * Deep clone object
 */
const deepClone = (obj) => {
  if (obj === null || typeof obj !== "object") return obj;
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Check if object is empty
 */
const isEmpty = (obj) => {
  if (!obj) return true;
  if (Array.isArray(obj)) return obj.length === 0;
  if (typeof obj === "object") return Object.keys(obj).length === 0;
  return false;
};

/**
 * Check if value is null or undefined
 */
const isNil = (value) => {
  return value === null || value === undefined;
};

/**
 * Debounce function
 */
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function
 */
const throttle = (func, limit) => {
  let inThrottle;
  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Retry async function with exponential backoff
 */
const retryWithBackoff = async (fn, maxRetries = 3, initialDelay = 1000) => {
  let lastError;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, i);
        await sleep(delay);
      }
    }
  }

  throw lastError;
};

/**
 * Sleep/delay helper
 */
const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Group array by key
 */
const groupBy = (array, key) => {
  return array.reduce((result, item) => {
    const groupKey = typeof key === "function" ? key(item) : item[key];
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {});
};

/**
 * Sort array of objects by key
 */
const sortBy = (array, key, order = "asc") => {
  return [...array].sort((a, b) => {
    const aVal = typeof key === "function" ? key(a) : a[key];
    const bVal = typeof key === "function" ? key(b) : b[key];

    if (aVal < bVal) return order === "asc" ? -1 : 1;
    if (aVal > bVal) return order === "asc" ? 1 : -1;
    return 0;
  });
};

/**
 * Chunk array into smaller arrays
 */
const chunk = (array, size) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

/**
 * Remove duplicates from array
 */
const unique = (array, key = null) => {
  if (!key) {
    return [...new Set(array)];
  }

  const seen = new Set();
  return array.filter((item) => {
    const keyValue = typeof key === "function" ? key(item) : item[key];
    if (seen.has(keyValue)) {
      return false;
    }
    seen.add(keyValue);
    return true;
  });
};

/**
 * Flatten nested array
 */
const flatten = (array, depth = 1) => {
  if (depth === 0) return array;
  return array.reduce((acc, val) => {
    return Array.isArray(val)
      ? acc.concat(flatten(val, depth - 1))
      : acc.concat(val);
  }, []);
};

/**
 * Pick specific keys from object
 */
const pick = (obj, keys) => {
  return keys.reduce((result, key) => {
    if (obj.hasOwnProperty(key)) {
      result[key] = obj[key];
    }
    return result;
  }, {});
};

/**
 * Omit specific keys from object
 */
const omit = (obj, keys) => {
  const result = { ...obj };
  keys.forEach((key) => delete result[key]);
  return result;
};

/**
 * Merge objects deeply
 */
const deepMerge = (target, ...sources) => {
  if (!sources.length) return target;
  const source = sources.shift();

  if (typeof target === "object" && typeof source === "object") {
    for (const key in source) {
      if (typeof source[key] === "object" && !Array.isArray(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        deepMerge(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return deepMerge(target, ...sources);
};

/**
 * Convert string to slug
 */
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

/**
 * Capitalize first letter
 */
const capitalize = (str) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Capitalize each word
 */
const capitalizeWords = (str) => {
  if (!str) return "";
  return str.split(" ").map(capitalize).join(" ");
};

/**
 * Truncate string with ellipsis
 */
const truncate = (str, length = 50, ending = "...") => {
  if (!str || str.length <= length) return str;
  return str.substring(0, length - ending.length) + ending;
};

/**
 * Parse query string to object
 */
const parseQueryString = (queryString) => {
  const params = new URLSearchParams(queryString);
  const result = {};
  for (const [key, value] of params) {
    result[key] = value;
  }
  return result;
};

/**
 * Build query string from object
 */
const buildQueryString = (params) => {
  return Object.keys(params)
    .filter((key) => params[key] !== null && params[key] !== undefined)
    .map(
      (key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`
    )
    .join("&");
};

/**
 * Random number between min and max
 */
const randomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Random element from array
 */
const randomElement = (array) => {
  return array[Math.floor(Math.random() * array.length)];
};

/**
 * Shuffle array
 */
const shuffle = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * Format file size
 */
const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};

/**
 * Format number with thousands separator
 */
const formatNumber = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
};

/**
 * Check if string is valid JSON
 */
const isValidJSON = (str) => {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
};

module.exports = {
  formatDate,
  formatDuration,
  formatRelativeTime,
  generateId,
  generateShortId,
  isValidEmail,
  isValidUrl,
  sanitizeFilename,
  deepClone,
  isEmpty,
  isNil,
  debounce,
  throttle,
  retryWithBackoff,
  sleep,
  groupBy,
  sortBy,
  chunk,
  unique,
  flatten,
  pick,
  omit,
  deepMerge,
  slugify,
  capitalize,
  capitalizeWords,
  truncate,
  parseQueryString,
  buildQueryString,
  randomInt,
  randomElement,
  shuffle,
  formatFileSize,
  formatNumber,
  isValidJSON,
};
