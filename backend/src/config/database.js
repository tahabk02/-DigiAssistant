// backend/src/config/database.js
const fs = require("fs").promises;
const path = require("path");

/**
 * Simple file-based database for storing assessments
 * In production, replace with MongoDB, PostgreSQL, etc.
 */
class Database {
  constructor() {
    this.dataDir = path.join(__dirname, "../../data");
    this.assessmentsFile = path.join(this.dataDir, "assessments.json");
    this.dimensions = null;
    this.questions = null;
    this.initialized = false;
  }

  /**
   * Initialize database and load reference data
   */
  async initialize() {
    try {
      console.log("🔄 Initializing database...");

      // Ensure data directory exists
      await fs.mkdir(this.dataDir, { recursive: true });
      console.log("✓ Data directory ready");

      // Create assessments file if it doesn't exist
      try {
        await fs.access(this.assessmentsFile);
        console.log("✓ Assessments file exists");
      } catch {
        await fs.writeFile(
          this.assessmentsFile,
          JSON.stringify({ assessments: [] }, null, 2)
        );
        console.log("✓ Assessments file created");
      }

      // Load dimensions and questions from embedded data
      this.dimensions = this.getEmbeddedDimensions();
      console.log(`✓ Loaded ${this.dimensions.dimensions.length} dimensions`);

      this.questions = this.getEmbeddedQuestions();
      console.log(`✓ Loaded ${this.questions.questions.length} questions`);

      this.initialized = true;
      console.log("✅ Database initialized successfully\n");

      return true;
    } catch (error) {
      console.error("❌ Database initialization error:", error.message);
      throw error;
    }
  }

  /**
   * Get embedded dimensions data
   */
  getEmbeddedDimensions() {
    return {
      dimensions: [
        {
          id: "physical_health",
          name: "Santé Physique",
          description:
            "État général de la santé physique et capacités fonctionnelles",
          color: "#3B82F6",
          indicators: [
            "État général",
            "Énergie et vitalité",
            "Fonctionnement physique",
            "Douleurs chroniques",
          ],
        },
        {
          id: "mental_health",
          name: "Santé Mentale",
          description: "Bien-être psychologique et équilibre émotionnel",
          color: "#10B981",
          indicators: [
            "Humeur générale",
            "Gestion du stress",
            "Qualité du sommeil",
            "Estime de soi",
          ],
        },
        {
          id: "lifestyle",
          name: "Mode de Vie",
          description: "Habitudes de vie et comportements santé",
          color: "#F59E0B",
          indicators: [
            "Alimentation",
            "Activité physique",
            "Consommation de substances",
            "Hygiène de vie",
          ],
        },
        {
          id: "social_environment",
          name: "Environnement Social",
          description: "Relations sociales et environnement de vie",
          color: "#8B5CF6",
          indicators: [
            "Relations personnelles",
            "Soutien social",
            "Environnement de travail",
            "Intégration sociale",
          ],
        },
        {
          id: "medical_care",
          name: "Soins Médicaux",
          description: "Accès et qualité des soins de santé",
          color: "#EF4444",
          indicators: [
            "Accès aux soins",
            "Suivi médical",
            "Médicaments",
            "Prévention",
          ],
        },
        {
          id: "quality_life",
          name: "Qualité de Vie",
          description: "Satisfaction globale et bien-être perçu",
          color: "#06B6D4",
          indicators: [
            "Satisfaction de vie",
            "Autonomie",
            "Projets personnels",
            "Équilibre vie pro/perso",
          ],
        },
      ],
    };
  }

  /**
   * Get embedded questions data
   */
  getEmbeddedQuestions() {
    return {
      questions: [
        {
          id: "q1",
          dimension: "physical_health",
          text: "Comment évaluez-vous votre état de santé général ?",
          type: "scale",
          options: [
            { value: 1, label: "Très mauvais" },
            { value: 2, label: "Mauvais" },
            { value: 3, label: "Moyen" },
            { value: 4, label: "Bon" },
            { value: 5, label: "Très bon" },
          ],
        },
        {
          id: "q2",
          dimension: "physical_health",
          text: "À quelle fréquence ressentez-vous des douleurs physiques ?",
          type: "scale",
          options: [
            { value: 1, label: "Toujours" },
            { value: 2, label: "Souvent" },
            { value: 3, label: "Parfois" },
            { value: 4, label: "Rarement" },
            { value: 5, label: "Jamais" },
          ],
        },
        {
          id: "q3",
          dimension: "mental_health",
          text: "Comment évaluez-vous votre niveau de stress ces derniers temps ?",
          type: "scale",
          options: [
            { value: 1, label: "Extrêmement stressé" },
            { value: 2, label: "Très stressé" },
            { value: 3, label: "Modérément stressé" },
            { value: 4, label: "Peu stressé" },
            { value: 5, label: "Pas stressé du tout" },
          ],
        },
        {
          id: "q4",
          dimension: "mental_health",
          text: "Comment qualifieriez-vous la qualité de votre sommeil ?",
          type: "scale",
          options: [
            { value: 1, label: "Très mauvaise" },
            { value: 2, label: "Mauvaise" },
            { value: 3, label: "Moyenne" },
            { value: 4, label: "Bonne" },
            { value: 5, label: "Excellente" },
          ],
        },
        {
          id: "q5",
          dimension: "lifestyle",
          text: "À quelle fréquence pratiquez-vous une activité physique ?",
          type: "scale",
          options: [
            { value: 1, label: "Jamais" },
            { value: 2, label: "Rarement" },
            { value: 3, label: "1-2 fois/semaine" },
            { value: 4, label: "3-4 fois/semaine" },
            { value: 5, label: "Tous les jours" },
          ],
        },
        {
          id: "q6",
          dimension: "lifestyle",
          text: "Comment évaluez-vous votre alimentation ?",
          type: "scale",
          options: [
            { value: 1, label: "Très déséquilibrée" },
            { value: 2, label: "Déséquilibrée" },
            { value: 3, label: "Moyenne" },
            { value: 4, label: "Équilibrée" },
            { value: 5, label: "Très équilibrée" },
          ],
        },
        {
          id: "q7",
          dimension: "social_environment",
          text: "Êtes-vous satisfait de vos relations sociales ?",
          type: "scale",
          options: [
            { value: 1, label: "Très insatisfait" },
            { value: 2, label: "Insatisfait" },
            { value: 3, label: "Neutre" },
            { value: 4, label: "Satisfait" },
            { value: 5, label: "Très satisfait" },
          ],
        },
        {
          id: "q8",
          dimension: "medical_care",
          text: "Comment évaluez-vous votre accès aux soins médicaux ?",
          type: "scale",
          options: [
            { value: 1, label: "Très difficile" },
            { value: 2, label: "Difficile" },
            { value: 3, label: "Acceptable" },
            { value: 4, label: "Facile" },
            { value: 5, label: "Très facile" },
          ],
        },
        {
          id: "q9",
          dimension: "quality_life",
          text: "Dans l'ensemble, êtes-vous satisfait de votre vie ?",
          type: "scale",
          options: [
            { value: 1, label: "Très insatisfait" },
            { value: 2, label: "Insatisfait" },
            { value: 3, label: "Neutre" },
            { value: 4, label: "Satisfait" },
            { value: 5, label: "Très satisfait" },
          ],
        },
        {
          id: "q10",
          dimension: "physical_health",
          text: "Avez-vous de l'énergie pour vos activités quotidiennes ?",
          type: "scale",
          options: [
            { value: 1, label: "Très fatigué" },
            { value: 2, label: "Fatigué" },
            { value: 3, label: "Assez d'énergie" },
            { value: 4, label: "Énergique" },
            { value: 5, label: "Très énergique" },
          ],
        },
      ],
    };
  }

  /**
   * Check if database is initialized
   */
  checkInitialized() {
    if (!this.initialized) {
      throw new Error("Database not initialized. Call initialize() first.");
    }
  }

  /**
   * Get all dimensions
   */
  getDimensions() {
    this.checkInitialized();
    return this.dimensions;
  }

  /**
   * Get all questions
   */
  getQuestions() {
    this.checkInitialized();
    return this.questions;
  }

  /**
   * Get questions by dimension
   */
  getQuestionsByDimension(dimensionId) {
    this.checkInitialized();
    return this.questions.questions.filter((q) => q.dimension === dimensionId);
  }

  /**
   * Get question by ID
   */
  getQuestionById(questionId) {
    this.checkInitialized();
    return this.questions.questions.find((q) => q.id === questionId);
  }

  /**
   * Load all assessments
   */
  async loadAssessments() {
    try {
      const data = await fs.readFile(this.assessmentsFile, "utf8");
      return JSON.parse(data).assessments;
    } catch (error) {
      console.error("Error loading assessments:", error);
      return [];
    }
  }

  /**
   * Save assessments
   */
  async saveAssessments(assessments) {
    try {
      await fs.writeFile(
        this.assessmentsFile,
        JSON.stringify({ assessments }, null, 2)
      );
      return true;
    } catch (error) {
      console.error("Error saving assessments:", error);
      throw error;
    }
  }

  /**
   * Create new assessment
   */
  async createAssessment(assessmentData) {
    try {
      const assessments = await this.loadAssessments();
      const newAssessment = {
        id: this.generateId(),
        ...assessmentData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      assessments.push(newAssessment);
      await this.saveAssessments(assessments);
      return newAssessment;
    } catch (error) {
      console.error("Error creating assessment:", error);
      throw error;
    }
  }

  /**
   * Get assessment by ID
   */
  async getAssessmentById(assessmentId) {
    try {
      const assessments = await this.loadAssessments();
      return assessments.find((a) => a.id === assessmentId);
    } catch (error) {
      console.error("Error getting assessment:", error);
      throw error;
    }
  }

  /**
   * Update assessment
   */
  async updateAssessment(assessmentId, updates) {
    try {
      const assessments = await this.loadAssessments();
      const index = assessments.findIndex((a) => a.id === assessmentId);

      if (index === -1) {
        throw new Error("Assessment not found");
      }

      assessments[index] = {
        ...assessments[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      await this.saveAssessments(assessments);
      return assessments[index];
    } catch (error) {
      console.error("Error updating assessment:", error);
      throw error;
    }
  }

  /**
   * Delete assessment
   */
  async deleteAssessment(assessmentId) {
    try {
      const assessments = await this.loadAssessments();
      const filtered = assessments.filter((a) => a.id !== assessmentId);
      await this.saveAssessments(filtered);
      return true;
    } catch (error) {
      console.error("Error deleting assessment:", error);
      throw error;
    }
  }

  /**
   * Generate unique ID
   */
  generateId() {
    return `assess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get database stats
   */
  async getStats() {
    try {
      const assessments = await this.loadAssessments();
      const completed = assessments.filter((a) => a.status === "completed");
      const inProgress = assessments.filter((a) => a.status === "in_progress");

      return {
        total: assessments.length,
        completed: completed.length,
        inProgress: inProgress.length,
        questionsAvailable: this.questions.questions.length,
        dimensionsAvailable: this.dimensions.dimensions.length,
      };
    } catch (error) {
      console.error("Error getting stats:", error);
      return null;
    }
  }
}

// Export singleton instance
const dbInstance = new Database();
module.exports = dbInstance;
