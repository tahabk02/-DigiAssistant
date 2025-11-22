const fs = require("fs");
const path = require("path");

console.log("🚀 Creating all data files for DigiAssistant...\n");

const dataDir = path.join(__dirname, "data");

// Create data directory
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
  console.log("✓ Created data directory\n");
}

// ==================== DIMENSIONS.JSON ====================
const dimensions = {
  dimensions: [
    {
      id: "strategy",
      name: "Stratégie",
      description: "Vision et planification digitale de l'entreprise",
      weight: 1,
      pillars: [
        { id: "vision", name: "Vision Digitale", maxScore: 9 },
        { id: "objectives", name: "Objectifs & KPIs", maxScore: 9 },
        { id: "budget", name: "Budget & Ressources", maxScore: 9 },
        { id: "roadmap", name: "Roadmap de Transformation", maxScore: 9 },
      ],
    },
    {
      id: "culture",
      name: "Culture & Humain",
      description: "Compétences et organisation digitale",
      weight: 1,
      pillars: [
        { id: "skills", name: "Compétences Digitales", maxScore: 9 },
        { id: "training", name: "Formation Continue", maxScore: 9 },
        { id: "change", name: "Gestion du Changement", maxScore: 9 },
        { id: "innovation", name: "Culture d'Innovation", maxScore: 9 },
      ],
    },
    {
      id: "customer",
      name: "Relation Client",
      description: "Expérience et engagement client digital",
      weight: 1,
      pillars: [
        { id: "channels", name: "Canaux Digitaux", maxScore: 9 },
        { id: "experience", name: "Expérience Client", maxScore: 9 },
        {
          id: "data_usage",
          name: "Utilisation des Données Client",
          maxScore: 9,
        },
        { id: "personalization", name: "Personnalisation", maxScore: 9 },
      ],
    },
    {
      id: "process",
      name: "Processus",
      description: "Digitalisation et optimisation des processus métier",
      weight: 1,
      pillars: [
        { id: "automation", name: "Automatisation", maxScore: 9 },
        { id: "integration", name: "Intégration des Systèmes", maxScore: 9 },
        { id: "agility", name: "Agilité Opérationnelle", maxScore: 9 },
        { id: "optimization", name: "Optimisation Continue", maxScore: 9 },
      ],
    },
    {
      id: "technology",
      name: "Technologie",
      description: "Infrastructure et outils digitaux",
      weight: 1,
      pillars: [
        { id: "infrastructure", name: "Infrastructure IT", maxScore: 9 },
        { id: "tools", name: "Outils Digitaux", maxScore: 9 },
        { id: "cloud", name: "Cloud & Mobilité", maxScore: 9 },
        { id: "analytics", name: "Analytics & BI", maxScore: 9 },
      ],
    },
    {
      id: "security",
      name: "Sécurité",
      description: "Cybersécurité et protection des données",
      weight: 1,
      pillars: [
        { id: "policies", name: "Politiques de Sécurité", maxScore: 9 },
        { id: "protection", name: "Protection des Données", maxScore: 9 },
        { id: "compliance", name: "Conformité Réglementaire", maxScore: 9 },
        { id: "awareness", name: "Sensibilisation à la Sécurité", maxScore: 9 },
      ],
    },
  ],
  maturityProfiles: [
    {
      id: "beginner",
      name: "Débutant",
      minScore: 0,
      maxScore: 25,
      description:
        "Début de la transformation digitale avec des initiatives limitées",
      recommendations: [
        "Définir une vision digitale claire",
        "Allouer un budget dédié à la transformation",
        "Former les équipes aux compétences digitales de base",
      ],
      color: "#ef4444",
    },
    {
      id: "emergent",
      name: "Émergent",
      minScore: 26,
      maxScore: 50,
      description:
        "Initiatives digitales en cours avec une adoption progressive",
      recommendations: [
        "Structurer la roadmap de transformation",
        "Renforcer les compétences digitales",
        "Développer les canaux digitaux",
      ],
      color: "#f59e0b",
    },
    {
      id: "challenger",
      name: "Challenger",
      minScore: 51,
      maxScore: 75,
      description: "Maturité digitale avancée avec des pratiques établies",
      recommendations: [
        "Optimiser l'automatisation des processus",
        "Développer l'analyse prédictive",
        "Innover dans l'expérience client",
      ],
      color: "#3b82f6",
    },
    {
      id: "leader",
      name: "Leader",
      minScore: 76,
      maxScore: 100,
      description: "Excellence digitale avec innovation continue",
      recommendations: [
        "Maintenir l'avance technologique",
        "Partager les best practices",
        "Explorer les technologies émergentes",
      ],
      color: "#10b981",
    },
  ],
};

// Write dimensions.json
fs.writeFileSync(
  path.join(dataDir, "dimensions.json"),
  JSON.stringify(dimensions, null, 2)
);
console.log("✅ Created dimensions.json (6 dimensions, 4 maturity profiles)");

// ==================== QUESTIONS.JSON ====================
const questions = require("./artifacts-data/questions-full.json");

// If questions file doesn't exist, create minimal version
const questionsData = {
  questions: [
    {
      id: "intro_company_size",
      type: "intro",
      text: "Bonjour ! Combien d'employés compte votre entreprise ?",
      options: [
        { id: "micro", text: "1-10 employés", value: "micro" },
        { id: "small", text: "11-50 employés", value: "small" },
        { id: "medium", text: "51-250 employés", value: "medium" },
        { id: "large", text: "250+ employés", value: "large" },
      ],
      dimension: null,
      pillar: null,
      nextQuestion: "intro_sector",
    },
    {
      id: "intro_sector",
      type: "intro",
      text: "Dans quel secteur opérez-vous ?",
      options: [
        { id: "retail", text: "Commerce", value: "retail" },
        { id: "services", text: "Services", value: "services" },
        { id: "tech", text: "Technologie", value: "tech" },
        { id: "other", text: "Autre", value: "other" },
      ],
      dimension: null,
      pillar: null,
      nextQuestion: "strategy_vision_1",
    },
    {
      id: "strategy_vision_1",
      type: "scored",
      text: "Votre entreprise a-t-elle une vision digitale définie ?",
      options: [
        { id: "none", text: "Non", score: 0 },
        { id: "informal", text: "Informelle", score: 3 },
        { id: "documented", text: "Documentée", score: 6 },
        { id: "strategic", text: "Intégrée à la stratégie", score: 9 },
      ],
      dimension: "strategy",
      pillar: "vision",
      nextQuestion: null,
    },
  ],
};

fs.writeFileSync(
  path.join(dataDir, "questions.json"),
  JSON.stringify(questionsData, null, 2)
);
console.log("✅ Created questions.json (3 sample questions - expand later)");

// ==================== ASSESSMENTS.JSON ====================
const assessments = {
  assessments: [],
};

fs.writeFileSync(
  path.join(dataDir, "assessments.json"),
  JSON.stringify(assessments, null, 2)
);
console.log("✅ Created assessments.json (empty)");

// ==================== SCORING-RULES.JSON ====================
const scoringRules = {
  scoringRules: {
    description: "Règles de scoring pour le diagnostic",
    version: "1.0.0",
    globalScoring: {
      maxPillarScore: 9,
      pillarsPerDimension: 4,
      maxDimensionScore: 36,
      numberOfDimensions: 6,
      maxGlobalScore: 100,
    },
  },
};

fs.writeFileSync(
  path.join(dataDir, "scoring-rules.json"),
  JSON.stringify(scoringRules, null, 2)
);
console.log("✅ Created scoring-rules.json");

console.log("\n✅ ALL DATA FILES CREATED SUCCESSFULLY!\n");
console.log("📁 Location:", dataDir);
console.log("\n📝 Files created:");
console.log("  - dimensions.json");
console.log("  - questions.json");
console.log("  - assessments.json");
console.log("  - scoring-rules.json");
console.log("\n🚀 You can now run: npm run dev\n");
