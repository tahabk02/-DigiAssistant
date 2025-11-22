const { AppError } = require("./errorHandler");

/**
 * Validation Middleware
 * Validates request data before processing
 */

/**
 * Validate assessment start data
 */
const validateAssessmentStart = (req, res, next) => {
  const { companyName } = req.body;

  // Company name is optional but if provided, should be valid
  if (companyName && typeof companyName !== "string") {
    return next(
      new AppError(
        "Le nom de l'entreprise doit être une chaîne de caractères",
        400
      )
    );
  }

  if (companyName && companyName.length > 100) {
    return next(
      new AppError(
        "Le nom de l'entreprise ne doit pas dépasser 100 caractères",
        400
      )
    );
  }

  next();
};

/**
 * Validate answer submission
 */
const validateAnswerSubmission = (req, res, next) => {
  const { questionId, answerId } = req.body;

  // Required fields
  if (!questionId) {
    return next(new AppError("Question ID est requis", 400));
  }

  if (!answerId) {
    return next(new AppError("Answer ID est requis", 400));
  }

  // Field types
  if (typeof questionId !== "string") {
    return next(
      new AppError("Question ID doit être une chaîne de caractères", 400)
    );
  }

  if (typeof answerId !== "string") {
    return next(
      new AppError("Answer ID doit être une chaîne de caractères", 400)
    );
  }

  next();
};

/**
 * Validate assessment ID parameter
 */
const validateAssessmentId = (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return next(new AppError("Assessment ID est requis", 400));
  }

  if (typeof id !== "string") {
    return next(
      new AppError("Assessment ID doit être une chaîne de caractères", 400)
    );
  }

  // Basic format validation (starts with assess_)
  if (!id.startsWith("assess_")) {
    return next(new AppError("Format d'Assessment ID invalide", 400));
  }

  next();
};

/**
 * Validate dimension ID parameter
 */
const validateDimensionId = (req, res, next) => {
  const { dimensionId } = req.params;

  const validDimensions = [
    "strategy",
    "culture",
    "customer",
    "process",
    "technology",
    "security",
  ];

  if (!dimensionId) {
    return next(new AppError("Dimension ID est requis", 400));
  }

  if (!validDimensions.includes(dimensionId)) {
    return next(new AppError("Dimension ID invalide", 400));
  }

  next();
};

/**
 * Sanitize user input
 */
const sanitizeInput = (req, res, next) => {
  // Remove any potentially dangerous characters
  const sanitize = (obj) => {
    for (let key in obj) {
      if (typeof obj[key] === "string") {
        // Remove script tags and other dangerous patterns
        obj[key] = obj[key]
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
          .replace(/javascript:/gi, "")
          .replace(/on\w+\s*=/gi, "");
      } else if (typeof obj[key] === "object" && obj[key] !== null) {
        sanitize(obj[key]);
      }
    }
  };

  if (req.body) sanitize(req.body);
  if (req.query) sanitize(req.query);
  if (req.params) sanitize(req.params);

  next();
};

/**
 * Rate limiting helper
 * Simple in-memory rate limiter
 */
const requestStore = new Map();

const createRateLimiter = (windowMs, max) => {
  // Clean up old entries periodically
  setInterval(() => {
    const now = Date.now();
    for (const [ip, requests] of requestStore.entries()) {
      const recent = requests.filter((time) => now - time < windowMs);
      if (recent.length === 0) {
        requestStore.delete(ip);
      } else {
        requestStore.set(ip, recent);
      }
    }
  }, windowMs);

  return (req, res, next) => {
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    const now = Date.now();

    if (!requestStore.has(ip)) {
      requestStore.set(ip, []);
    }

    const userRequests = requestStore.get(ip);
    const recentRequests = userRequests.filter((time) => now - time < windowMs);

    if (recentRequests.length >= max) {
      return res.status(429).json({
        success: false,
        message: "Trop de requêtes. Veuillez réessayer plus tard.",
        retryAfter: Math.ceil((recentRequests[0] + windowMs - now) / 1000),
      });
    }

    recentRequests.push(now);
    requestStore.set(ip, recentRequests);

    next();
  };
};

module.exports = {
  validateAssessmentStart,
  validateAnswerSubmission,
  validateAssessmentId,
  validateDimensionId,
  sanitizeInput,
  createRateLimiter,
};
