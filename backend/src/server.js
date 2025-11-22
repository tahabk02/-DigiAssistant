const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

class Server {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3001;
    this.questions = [];
    this.assessments = new Map();

    this.initializeMiddlewares();
    this.loadQuestions();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  initializeMiddlewares() {
    // Security middleware
    this.app.use(helmet());

    // CORS middleware
    this.app.use(
      cors({
        origin: [
          "http://localhost:3000",
          "http://localhost:5173",
          "http://localhost:3001",
          "http://127.0.0.1:5173",
          "http://127.0.0.1:3000",
        ],
        credentials: true,
      })
    );

    // Body parsing middleware
    this.app.use(express.json({ limit: "10mb" }));
    this.app.use(express.urlencoded({ extended: true }));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100,
      message: {
        error: "Trop de requêtes, veuillez réessayer plus tard.",
      },
    });
    this.app.use(limiter);

    // Logging middleware
    this.app.use((req, res, next) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
      next();
    });
  }

  loadQuestions() {
    try {
      const questionsPath = path.join(__dirname, "../data/questions.json");
      if (fs.existsSync(questionsPath)) {
        const questionsData = JSON.parse(
          fs.readFileSync(questionsPath, "utf8")
        );
        this.questions = questionsData.questions;
        console.log(`✅ Chargé ${this.questions.length} questions`);
      } else {
        console.log("❌ Fichier questions.json non trouvé");
        this.questions = [];
      }
    } catch (error) {
      console.error("❌ Erreur lors du chargement des questions:", error);
      this.questions = [];
    }
  }

  initializeRoutes() {
    // Health check route
    this.app.get("/api/v1/health", (req, res) => {
      res.json({
        status: "OK",
        timestamp: new Date().toISOString(),
        service: "DigiAssistant API",
        version: "1.0.0",
        questionsLoaded: this.questions.length,
      });
    });

    // Start assessment route
    this.app.post("/api/v1/assessments/start", (req, res) => {
      try {
        const { companyName, companySize, sector } = req.body;

        const assessmentId = "assessment-" + Date.now();

        // Trouver la première question
        const firstQuestion = this.questions.find(
          (q) => q.id === "intro_company_size"
        );

        if (!firstQuestion) {
          return res.status(500).json({
            success: false,
            error: "Questions non disponibles",
          });
        }

        // Sauvegarder l'évaluation
        this.assessments.set(assessmentId, {
          id: assessmentId,
          companyName,
          companySize,
          sector,
          answers: [],
          currentQuestionId: firstQuestion.id,
          startedAt: new Date().toISOString(),
          status: "in_progress",
        });

        res.json({
          success: true,
          assessmentId: assessmentId,
          currentQuestion: {
            id: firstQuestion.id,
            text: firstQuestion.text,
            type: firstQuestion.type,
            options: firstQuestion.options,
            dimension: firstQuestion.dimension,
            pillar: firstQuestion.pillar,
          },
          progress: {
            percentComplete: 0,
            questionsAnswered: 0,
            totalQuestions: this.questions.length,
            estimatedTimeRemaining: {
              estimatedMinutes: Math.round(this.questions.length * 1.5),
            },
          },
        });
      } catch (error) {
        console.error("Erreur start assessment:", error);
        res.status(500).json({
          success: false,
          error: "Erreur lors du démarrage de l'évaluation",
        });
      }
    });

    // Submit answer route
    this.app.post("/api/v1/assessments/:id/answer", (req, res) => {
      try {
        const { questionId, answerId, answerValue } = req.body;
        const { id } = req.params;

        const assessment = this.assessments.get(id);
        if (!assessment) {
          return res.status(404).json({
            success: false,
            error: "Évaluation non trouvée",
          });
        }

        // Trouver la question actuelle
        const currentQuestion = this.questions.find((q) => q.id === questionId);
        if (!currentQuestion) {
          return res.status(404).json({
            success: false,
            error: "Question non trouvée",
          });
        }

        // Sauvegarder la réponse
        assessment.answers.push({
          questionId,
          answerId,
          answerValue,
          answeredAt: new Date().toISOString(),
          score:
            currentQuestion.options?.find((opt) => opt.id === answerId)
              ?.score || 0,
        });

        // Déterminer la prochaine question
        let nextQuestionId = currentQuestion.nextQuestion;

        // Vérifier les conditions pour la prochaine question
        if (
          currentQuestion.conditionalNext &&
          currentQuestion.conditionalNext[answerId]
        ) {
          nextQuestionId = currentQuestion.conditionalNext[answerId];
        }

        // Si pas de prochaine question, l'évaluation est terminée
        if (!nextQuestionId) {
          assessment.status = "completed";
          assessment.completedAt = new Date().toISOString();

          return res.json({
            success: true,
            completed: true,
            redirectTo: `/results/${id}`,
            progress: {
              percentComplete: 100,
              questionsAnswered: assessment.answers.length,
              totalQuestions: this.questions.length,
            },
          });
        }

        // Trouver la prochaine question
        const nextQuestion = this.questions.find(
          (q) => q.id === nextQuestionId
        );
        if (!nextQuestion) {
          return res.status(404).json({
            success: false,
            error: "Question suivante non trouvée",
          });
        }

        // Mettre à jour l'évaluation
        assessment.currentQuestionId = nextQuestionId;

        res.json({
          success: true,
          completed: false,
          nextQuestion: {
            id: nextQuestion.id,
            text: nextQuestion.text,
            type: nextQuestion.type,
            options: nextQuestion.options,
            dimension: nextQuestion.dimension,
            pillar: nextQuestion.pillar,
          },
          progress: {
            percentComplete: Math.round(
              (assessment.answers.length / this.questions.length) * 100
            ),
            questionsAnswered: assessment.answers.length,
            totalQuestions: this.questions.length,
            estimatedTimeRemaining: {
              estimatedMinutes: Math.round(
                (this.questions.length - assessment.answers.length) * 1.5
              ),
            },
          },
        });
      } catch (error) {
        console.error("Erreur submit answer:", error);
        res.status(500).json({
          success: false,
          error: "Erreur lors de la soumission de la réponse",
        });
      }
    });

    // Get assessment details
    this.app.get("/api/v1/assessments/:id", (req, res) => {
      try {
        const { id } = req.params;

        const assessment = this.assessments.get(id);
        if (!assessment) {
          return res.status(404).json({
            success: false,
            error: "Évaluation non trouvée",
          });
        }

        const currentQuestion = this.questions.find(
          (q) => q.id === assessment.currentQuestionId
        );

        res.json({
          success: true,
          assessment: {
            ...assessment,
            currentQuestion: currentQuestion
              ? {
                  id: currentQuestion.id,
                  text: currentQuestion.text,
                  type: currentQuestion.type,
                  options: currentQuestion.options,
                  dimension: currentQuestion.dimension,
                  pillar: currentQuestion.pillar,
                }
              : null,
          },
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: "Erreur lors de la récupération de l'évaluation",
        });
      }
    });

    // Get results
    this.app.get("/api/v1/results/:assessmentId", (req, res) => {
      try {
        const { assessmentId } = req.params;

        const assessment = this.assessments.get(assessmentId);
        if (!assessment) {
          return res.status(404).json({
            success: false,
            error: "Évaluation non trouvée",
          });
        }

        // Calculer les scores par dimension
        const dimensionScores = this.calculateDimensionScores(
          assessment.answers
        );
        const overallScore = this.calculateOverallScore(dimensionScores);
        const maturityLevel = this.getMaturityLevel(overallScore);

        const results = {
          assessmentId: assessmentId,
          companyInfo: {
            name: assessment.companyName,
            size: assessment.companySize,
            sector: assessment.sector,
          },
          overallScore: overallScore,
          maturityLevel: maturityLevel.level,
          maturityLabel: maturityLevel.label,
          dimensionScores: dimensionScores,
          strengths: this.identifyStrengths(dimensionScores),
          gaps: this.identifyGaps(dimensionScores),
          recommendations: this.generateRecommendations(dimensionScores),
        };

        res.json({
          success: true,
          data: results,
        });
      } catch (error) {
        console.error("Erreur get results:", error);
        res.status(500).json({
          success: false,
          error: "Erreur lors de la récupération des résultats",
        });
      }
    });

    // Get dimensions
    this.app.get("/api/v1/dimensions", (req, res) => {
      try {
        const dimensions = [
          {
            id: "strategy",
            name: "Stratégie Digitale",
            description: "Planification et vision digitale de l'entreprise",
            icon: "Target",
          },
          {
            id: "culture",
            name: "Culture & Humain",
            description: "Adoption et compétences digitales des collaborateurs",
            icon: "Users",
          },
          {
            id: "customer",
            name: "Relation Client",
            description: "Expérience client et services digitaux",
            icon: "Heart",
          },
          {
            id: "process",
            name: "Processus",
            description: "Automatisation et optimisation des processus",
            icon: "Workflow",
          },
          {
            id: "technology",
            name: "Technologie",
            description: "Infrastructure et outils technologiques",
            icon: "Cpu",
          },
          {
            id: "security",
            name: "Sécurité",
            description: "Protection des données et cybersécurité",
            icon: "Shield",
          },
        ];

        res.json({
          success: true,
          data: dimensions,
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: "Erreur lors de la récupération des dimensions",
        });
      }
    });

    // Get questions
    this.app.get("/api/v1/questions", (req, res) => {
      try {
        res.json({
          success: true,
          data: this.questions,
          count: this.questions.length,
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: "Erreur lors de la récupération des questions",
        });
      }
    });

    // Root route
    this.app.get("/", (req, res) => {
      res.json({
        message: "API DigiAssistant Backend",
        version: "1.0.0",
        status: "running",
        questionsLoaded: this.questions.length,
        assessmentsActive: this.assessments.size,
        endpoints: {
          health: "/api/v1/health",
          start_assessment: "/api/v1/assessments/start",
          submit_answer: "/api/v1/assessments/:id/answer",
          get_results: "/api/v1/results/:assessmentId",
          dimensions: "/api/v1/dimensions",
          questions: "/api/v1/questions",
        },
      });
    });
  }

  // Méthodes de calcul des scores
  calculateDimensionScores(answers) {
    const dimensions = [
      "strategy",
      "culture",
      "customer",
      "process",
      "technology",
      "security",
    ];

    return dimensions.map((dimension) => {
      const dimensionAnswers = answers.filter((a) => {
        const question = this.questions.find((q) => q.id === a.questionId);
        return question && question.dimension === dimension;
      });

      const totalScore = dimensionAnswers.reduce(
        (sum, answer) => sum + answer.score,
        0
      );
      const maxScore = dimensionAnswers.length * 9; // 9 étant le score maximum par question
      const percentage =
        maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

      return {
        dimensionId: dimension,
        dimensionName: this.getDimensionName(dimension),
        percentage: percentage,
        questionsAnswered: dimensionAnswers.length,
        totalScore: totalScore,
        maxScore: maxScore,
      };
    });
  }

  calculateOverallScore(dimensionScores) {
    const totalPercentage = dimensionScores.reduce(
      (sum, dim) => sum + dim.percentage,
      0
    );
    return Math.round(totalPercentage / dimensionScores.length);
  }

  getMaturityLevel(score) {
    if (score >= 76) return { level: "advanced", label: "Avancé" };
    if (score >= 51) return { level: "intermediate", label: "Intermédiaire" };
    if (score >= 26) return { level: "emerging", label: "Émergent" };
    return { level: "beginner", label: "Débutant" };
  }

  getDimensionName(dimensionId) {
    const names = {
      strategy: "Stratégie Digitale",
      culture: "Culture & Humain",
      customer: "Relation Client",
      process: "Processus",
      technology: "Technologie",
      security: "Sécurité",
    };
    return names[dimensionId] || dimensionId;
  }

  identifyStrengths(dimensionScores) {
    return dimensionScores
      .filter((dim) => dim.percentage >= 70)
      .map((dim) => `Fort potentiel en ${dim.dimensionName.toLowerCase()}`);
  }

  identifyGaps(dimensionScores) {
    return dimensionScores
      .filter((dim) => dim.percentage < 50)
      .map((dim) => `${dim.dimensionName} à améliorer`);
  }

  generateRecommendations(dimensionScores) {
    const recommendations = [];

    dimensionScores.forEach((dim) => {
      if (dim.percentage < 40) {
        recommendations.push(
          `Prioriser le développement de votre ${dim.dimensionName.toLowerCase()}`
        );
      } else if (dim.percentage < 70) {
        recommendations.push(
          `Renforcer vos capacités en ${dim.dimensionName.toLowerCase()}`
        );
      }
    });

    return recommendations.length > 0
      ? recommendations
      : [
          "Maintenir vos bonnes pratiques digitales",
          "Explorer les nouvelles technologies émergentes",
          "Former continuellement vos équipes",
        ];
  }

  initializeErrorHandling() {
    // 404 handler
    this.app.use("*", (req, res) => {
      res.status(404).json({
        success: false,
        error: "Route non trouvée",
        path: req.originalUrl,
      });
    });

    // Global error handler
    this.app.use((err, req, res, next) => {
      console.error("Error:", err.stack);
      res.status(500).json({
        success: false,
        error: "Erreur interne du serveur",
        message:
          process.env.NODE_ENV === "development"
            ? err.message
            : "Quelque chose s'est mal passé!",
      });
    });
  }

  start() {
    this.app.listen(this.port, () => {
      console.log(`🚀 Serveur démarré sur le port ${this.port}`);
      console.log(`📱 API disponible sur: http://localhost:${this.port}`);
      console.log(`🏥 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`❓ Questions chargées: ${this.questions.length}`);
      console.log(`📊 Endpoints disponibles:`);
      console.log(`   • GET  /api/v1/health`);
      console.log(`   • POST /api/v1/assessments/start`);
      console.log(`   • POST /api/v1/assessments/:id/answer`);
      console.log(`   • GET  /api/v1/results/:assessmentId`);
      console.log(`   • GET  /api/v1/dimensions`);
      console.log(`   • GET  /api/v1/questions`);
    });
  }
}

// Démarrer le serveur
const server = new Server();
server.start();

module.exports = server;
