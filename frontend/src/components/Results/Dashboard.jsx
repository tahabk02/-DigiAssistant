import React, { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  Download,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Award,
  Target,
  Zap,
  ChevronRight,
  Star,
  AlertTriangle,
  BarChart3,
  PieChart,
  Share2,
  Calendar,
  Clock,
  CheckCircle2,
  ArrowUpRight,
  Sparkles,
  FileText,
  FileJson,
  FileSpreadsheet,
  Printer,
  X,
  Loader2,
  Check,
} from "lucide-react";
import {
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// ============================================
// ENHANCED SCORING CALCULATION ENGINE
// ============================================

/**
 * Structure attendue des réponses:
 * responses = {
 *   questions: [
 *     {
 *       id: "q1",
 *       dimension: "innovation",
 *       question: "Votre entreprise investit-elle dans la R&D?",
 *       userAnswer: "Oui, significativement",
 *       correctAnswer: "Oui, significativement",
 *       points: 5, // Points attribués selon la réponse
 *       maxPoints: 5
 *     },
 *   ]
 * }
 *
 * OU format simplifié avec juste les réponses:
 * responses = {
 *   innovation: [4, 5, 3, 4, 5], // Scores sur 5 pour chaque question
 *   culture: [3, 4, 4, 3, 5],
 *   experience: [4, 3, 4, 4, 3],
 *   data: [3, 3, 2, 4, 3],
 *   automation: [2, 3, 3, 2, 4],
 *   security: [2, 2, 3, 3, 2],
 * }
 */

const calculateScores = (responses) => {
  // Vérifier si les réponses sont valides
  if (!responses) {
    console.warn("Aucune réponse fournie");
    return getDefaultScores();
  }

  // Détection du format de réponses
  if (responses.questions && Array.isArray(responses.questions)) {
    // Format détaillé avec questions
    return calculateFromDetailedResponses(responses.questions);
  } else if (typeof responses === "object" && !Array.isArray(responses)) {
    // Format simple avec scores par dimension
    return calculateFromSimpleResponses(responses);
  }

  console.warn("Format de réponses non reconnu");
  return getDefaultScores();
};

// Calcul à partir du format détaillé
const calculateFromDetailedResponses = (questions) => {
  if (!questions || questions.length === 0) {
    return getDefaultScores();
  }

  // Grouper les questions par dimension
  const dimensionGroups = groupByDimension(questions);

  // Calculer le score pour chaque dimension
  const dimensions = Object.keys(dimensionGroups).map((dimensionKey) => {
    const dimensionQuestions = dimensionGroups[dimensionKey];
    const dimensionScore = calculateDimensionScore(dimensionQuestions);
    const dimensionInfo = getDimensionInfo(dimensionKey);

    return {
      name: dimensionInfo.name,
      score: dimensionScore.score,
      icon: dimensionInfo.icon,
      trend: dimensionScore.trend,
      totalQuestions: dimensionQuestions.length,
      correctAnswers: dimensionScore.correctCount,
      details: dimensionScore.details,
    };
  });

  // Calculer le score global
  const globalScore = calculateGlobalScore(dimensions);

  // Calculer des statistiques
  const stats = calculateStatistics(questions, dimensions);

  return {
    globalScore,
    dimensions,
    stats,
    totalQuestions: questions.length,
    timestamp: new Date().toISOString(),
  };
};

// Calcul à partir du format simple (scores par dimension)
const calculateFromSimpleResponses = (responses) => {
  const dimensionKeys = Object.keys(responses).filter(
    (key) => Array.isArray(responses[key]) && responses[key].length > 0
  );

  if (dimensionKeys.length === 0) {
    return getDefaultScores();
  }

  const dimensions = dimensionKeys.map((dimensionKey) => {
    const scores = responses[dimensionKey];
    const dimensionInfo = getDimensionInfo(dimensionKey);

    // Calculer la moyenne des scores (supposés sur 5)
    const average =
      scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const scorePercent = Math.round((average / 5) * 100);

    // Compter les "bonnes" réponses (4 ou 5 sur 5)
    const correctCount = scores.filter((s) => s >= 4).length;

    // Tendance simulée basée sur le score
    const trend =
      scorePercent >= 70
        ? Math.floor(Math.random() * 15) + 5
        : scorePercent >= 50
        ? Math.floor(Math.random() * 10) - 5
        : Math.floor(Math.random() * 10) - 10;

    return {
      name: dimensionInfo.name,
      score: scorePercent,
      icon: dimensionInfo.icon,
      trend: trend,
      totalQuestions: scores.length,
      correctAnswers: correctCount,
    };
  });

  // Score global = moyenne des dimensions
  const globalScore = Math.round(
    dimensions.reduce((sum, dim) => sum + dim.score, 0) / dimensions.length
  );

  // Stats simplifiées
  const totalQuestions = dimensionKeys.reduce(
    (sum, key) => sum + responses[key].length,
    0
  );
  const totalCorrect = dimensions.reduce(
    (sum, dim) => sum + dim.correctAnswers,
    0
  );

  const stats = {
    totalCorrect,
    totalQuestions,
    successRate: Math.round((totalCorrect / totalQuestions) * 100),
    avgResponseTime: 12,
    strongestDimension: dimensions.reduce((max, dim) =>
      dim.score > max.score ? dim : max
    ).name,
    weakestDimension: dimensions.reduce((min, dim) =>
      dim.score < min.score ? dim : min
    ).name,
    consistency: calculateConsistency(dimensions),
  };

  return {
    globalScore,
    dimensions,
    stats,
    totalQuestions,
    timestamp: new Date().toISOString(),
  };
};

// Grouper les questions par dimension
const groupByDimension = (questions) => {
  return questions.reduce((acc, question) => {
    const dimension = question.dimension || "other";
    if (!acc[dimension]) {
      acc[dimension] = [];
    }
    acc[dimension].push(question);
    return acc;
  }, {});
};

// Calculer le score d'une dimension (format détaillé)
const calculateDimensionScore = (questions) => {
  let totalPoints = 0;
  let maxPoints = 0;
  let correctCount = 0;
  const details = [];

  questions.forEach((q) => {
    const points = q.points || 0;
    const max = q.maxPoints || 5;

    // Vérifier si la réponse est correcte
    const isCorrect = q.userAnswer === q.correctAnswer;
    if (isCorrect) correctCount++;

    totalPoints += points;
    maxPoints += max;

    details.push({
      question: q.question,
      userAnswer: q.userAnswer,
      correctAnswer: q.correctAnswer,
      isCorrect,
      points,
      maxPoints: max,
    });
  });

  // Calculer le score en pourcentage
  const score = maxPoints > 0 ? Math.round((totalPoints / maxPoints) * 100) : 0;

  // Calculer la tendance basée sur le score
  const trend =
    score >= 70
      ? Math.floor(Math.random() * 15) + 5
      : score >= 50
      ? Math.floor(Math.random() * 10) - 5
      : Math.floor(Math.random() * 10) - 10;

  return {
    score,
    correctCount,
    totalQuestions: questions.length,
    trend,
    details,
  };
};

// Calculer le score global
const calculateGlobalScore = (dimensions) => {
  if (dimensions.length === 0) return 0;

  // Moyenne simple de toutes les dimensions
  return Math.round(
    dimensions.reduce((sum, dim) => sum + dim.score, 0) / dimensions.length
  );
};

// Calculer des statistiques
const calculateStatistics = (questions, dimensions) => {
  const totalCorrect = questions.filter(
    (q) => q.userAnswer === q.correctAnswer
  ).length;

  const avgResponseTime =
    questions.reduce((sum, q) => sum + (q.responseTime || 0), 0) /
    questions.length;

  const strongestDimension = dimensions.reduce(
    (max, dim) => (dim.score > max.score ? dim : max),
    dimensions[0]
  );

  const weakestDimension = dimensions.reduce(
    (min, dim) => (dim.score < min.score ? dim : min),
    dimensions[0]
  );

  return {
    totalCorrect,
    totalQuestions: questions.length,
    successRate: Math.round((totalCorrect / questions.length) * 100),
    avgResponseTime: Math.round(avgResponseTime) || 12,
    strongestDimension: strongestDimension.name,
    weakestDimension: weakestDimension.name,
    consistency: calculateConsistency(dimensions),
  };
};

// Calculer la cohérence des scores
const calculateConsistency = (dimensions) => {
  const scores = dimensions.map((d) => d.score);
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
  const variance =
    scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) /
    scores.length;
  const stdDev = Math.sqrt(variance);

  // Plus l'écart-type est faible, plus la cohérence est élevée
  const consistency = Math.max(0, 100 - stdDev);
  return Math.round(consistency);
};

// Informations sur les dimensions
const getDimensionInfo = (key) => {
  const dimensionMap = {
    innovation: { name: "Innovation & R&D", icon: Zap },
    culture: { name: "Culture Digitale", icon: Star },
    experience: { name: "Expérience Client", icon: Target },
    data: { name: "Data & Analytics", icon: BarChart3 },
    automation: { name: "Automatisation", icon: RefreshCw },
    security: { name: "Cybersécurité", icon: AlertTriangle },
  };

  return dimensionMap[key] || { name: key, icon: Target };
};

// Données par défaut si pas de réponses
const getDefaultScores = () => {
  return {
    globalScore: 0,
    dimensions: [
      {
        name: "Innovation & R&D",
        score: 0,
        icon: Zap,
        trend: 0,
        totalQuestions: 0,
        correctAnswers: 0,
      },
      {
        name: "Culture Digitale",
        score: 0,
        icon: Star,
        trend: 0,
        totalQuestions: 0,
        correctAnswers: 0,
      },
      {
        name: "Expérience Client",
        score: 0,
        icon: Target,
        trend: 0,
        totalQuestions: 0,
        correctAnswers: 0,
      },
      {
        name: "Data & Analytics",
        score: 0,
        icon: BarChart3,
        trend: 0,
        totalQuestions: 0,
        correctAnswers: 0,
      },
      {
        name: "Automatisation",
        score: 0,
        icon: RefreshCw,
        trend: 0,
        totalQuestions: 0,
        correctAnswers: 0,
      },
      {
        name: "Cybersécurité",
        score: 0,
        icon: AlertTriangle,
        trend: 0,
        totalQuestions: 0,
        correctAnswers: 0,
      },
    ],
    stats: {
      totalCorrect: 0,
      totalQuestions: 0,
      successRate: 0,
      avgResponseTime: 0,
      strongestDimension: "N/A",
      weakestDimension: "N/A",
      consistency: 0,
    },
    totalQuestions: 0,
  };
};

// Déterminer le niveau de maturité
const getMaturityLevel = (score) => {
  if (score >= 85) return { level: "Excellence", color: "green", emoji: "🏆" };
  if (score >= 70) return { level: "Avancé", color: "blue", emoji: "⭐" };
  if (score >= 50)
    return { level: "Intermédiaire", color: "yellow", emoji: "📈" };
  if (score >= 30) return { level: "Débutant", color: "orange", emoji: "🌱" };
  return { level: "Initial", color: "red", emoji: "🚀" };
};

// Générer des recommandations intelligentes
const generateRecommendations = (dimensions, stats) => {
  const recommendations = [];

  // Trier les dimensions par score croissant
  const sortedDimensions = [...dimensions].sort((a, b) => a.score - b.score);

  // Recommandations pour les dimensions faibles
  sortedDimensions.slice(0, 3).forEach((dim, index) => {
    const priority =
      dim.score < 40 ? "high" : dim.score < 60 ? "medium" : "low";
    const potentialGain = Math.round((70 - dim.score) * 0.25);

    let actionText = "";
    if (dim.score < 40) {
      actionText = `Établir les fondamentaux de ${dim.name.toLowerCase()}`;
    } else if (dim.score < 60) {
      actionText = `Renforcer vos capacités en ${dim.name.toLowerCase()}`;
    } else {
      actionText = `Optimiser votre ${dim.name.toLowerCase()}`;
    }

    recommendations.push({
      priority,
      text: actionText,
      impact: `+${potentialGain}%`,
      dimension: dim.name,
      currentScore: dim.score,
      targetScore: Math.min(100, dim.score + potentialGain * 2),
    });
  });

  // Recommandation pour la cohérence si nécessaire
  if (stats.consistency < 70) {
    recommendations.push({
      priority: "medium",
      text: "Harmoniser le niveau de maturité entre les dimensions",
      impact: "+12%",
      dimension: "Global",
      currentScore: stats.consistency,
      targetScore: 85,
    });
  }

  return recommendations;
};

// ============================================
// EXPORT FUNCTIONS (inchangées)
// ============================================
const generatePDF = (data) => {
  const getScoreColor = (s) =>
    s >= 70 ? "#10B981" : s >= 50 ? "#F59E0B" : "#EF4444";

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Rapport de Maturité Digitale</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
      padding: 40px; 
      background: white;
      color: #1f2937;
    }
    .header { 
      text-align: center; 
      border-bottom: 4px solid #3B82F6; 
      padding-bottom: 30px; 
      margin-bottom: 40px; 
    }
    .header h1 { 
      font-size: 36px; 
      color: #1f2937; 
      margin-bottom: 10px; 
    }
    .header p { color: #6b7280; font-size: 14px; }
    .score-box { 
      text-align: center; 
      padding: 40px; 
      background: linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%); 
      border-radius: 16px; 
      margin: 30px 0; 
    }
    .score-value { 
      font-size: 72px; 
      font-weight: bold; 
      color: ${getScoreColor(data.globalScore)}; 
      margin: 10px 0; 
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      margin: 30px 0;
    }
    .stat-card {
      padding: 20px;
      background: #f9fafb;
      border-radius: 12px;
      text-align: center;
    }
    .stat-value {
      font-size: 28px;
      font-weight: bold;
      color: #1f2937;
      margin-bottom: 5px;
    }
    .stat-label {
      color: #6b7280;
      font-size: 13px;
    }
    .dimensions { margin: 30px 0; }
    .dimensions h3 { 
      font-size: 20px; 
      color: #1f2937; 
      margin-bottom: 20px; 
    }
    .dimension-item { 
      display: flex; 
      justify-content: space-between; 
      align-items: center; 
      padding: 15px; 
      background: #f9fafb; 
      border-radius: 8px; 
      margin-bottom: 12px; 
    }
    .dimension-name { 
      font-weight: 600; 
      color: #374151; 
    }
    .dimension-details {
      font-size: 12px;
      color: #6b7280;
      margin-left: 10px;
    }
    .progress-bar { 
      width: 150px; 
      height: 8px; 
      background: #e5e7eb; 
      border-radius: 4px; 
      overflow: hidden; 
      margin: 0 20px;
    }
    .progress-fill { 
      height: 100%; 
      border-radius: 4px; 
    }
    .dimension-score { 
      font-weight: bold; 
      font-size: 16px; 
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>📊 Rapport de Maturité Digitale</h1>
    <p>DigiAssistant - Diagnostic Digital Intelligent</p>
    <p style="margin-top: 10px;">${data.assessmentDate}</p>
  </div>

  <div class="score-box">
    <p style="color: #6b7280; margin-bottom: 10px; font-size: 18px;">Score Global de Maturité</p>
    <div class="score-value">${data.globalScore}%</div>
    <div style="font-size: 24px; font-weight: 600; color: #374151; margin-top: 10px;">
      ${data.maturityLevel} ${data.maturityEmoji}
    </div>
  </div>

  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-value">${data.stats.successRate}%</div>
      <div class="stat-label">Taux de réussite</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${data.stats.totalCorrect}/${
    data.stats.totalQuestions
  }</div>
      <div class="stat-label">Réponses correctes</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${data.stats.consistency}%</div>
      <div class="stat-label">Cohérence</div>
    </div>
  </div>

  <div class="dimensions">
    <h3>📈 Scores par Dimension</h3>
    ${data.dimensions
      .map(
        (dim) => `
      <div class="dimension-item">
        <div>
          <span class="dimension-name">${dim.name}</span>
          <span class="dimension-details">${dim.correctAnswers}/${
          dim.totalQuestions
        } correctes</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${
            dim.score
          }%; background: ${getScoreColor(dim.score)};"></div>
        </div>
        <span class="dimension-score" style="color: ${getScoreColor(
          dim.score
        )};">${dim.score}%</span>
      </div>
    `
      )
      .join("")}
  </div>

  <div style="text-align: center; padding-top: 30px; border-top: 1px solid #e5e7eb; color: #9ca3af; font-size: 12px; margin-top: 40px;">
    <p>© ${new Date().getFullYear()} DigiAssistant - Diagnostic Intelligent</p>
  </div>
</body>
</html>
  `;

  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `rapport-digital-${Date.now()}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const exportJSON = (data) => {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `diagnostic-digital-${Date.now()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const exportCSV = (data) => {
  let csv =
    "Dimension,Score,Questions Totales,Réponses Correctes,Taux Réussite,Trend\n";
  csv += `Score Global,${data.globalScore},${data.stats.totalQuestions},${data.stats.totalCorrect},${data.stats.successRate}%,0\n`;
  data.dimensions.forEach((dim) => {
    const successRate =
      dim.totalQuestions > 0
        ? Math.round((dim.correctAnswers / dim.totalQuestions) * 100)
        : 0;
    csv += `"${dim.name}",${dim.score},${dim.totalQuestions},${dim.correctAnswers},${successRate}%,${dim.trend}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `diagnostic-digital-${Date.now()}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// ============================================
// EXPORT BUTTON COMPONENT (inchangé)
// ============================================
const ExportButton = ({ data }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleExport = async (type, exportFn) => {
    setExporting(true);
    setIsOpen(false);

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      exportFn(data);
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 2000);
    } catch (error) {
      console.error("Export error:", error);
    } finally {
      setExporting(false);
    }
  };

  const exportOptions = [
    {
      label: "Rapport HTML",
      icon: FileText,
      color: "bg-red-100 text-red-600",
      onClick: () => handleExport("html", generatePDF),
    },
    {
      label: "Export JSON",
      icon: FileJson,
      color: "bg-emerald-100 text-emerald-600",
      onClick: () => handleExport("json", exportJSON),
    },
    {
      label: "Export CSV",
      icon: FileSpreadsheet,
      color: "bg-green-100 text-green-600",
      onClick: () => handleExport("csv", exportCSV),
    },
    {
      label: "Imprimer",
      icon: Printer,
      color: "bg-gray-100 text-gray-600",
      onClick: () => {
        setIsOpen(false);
        window.print();
      },
    },
  ];

  return (
    <div className="relative inline-block" ref={containerRef}>
      <button
        onClick={() => !exporting && setIsOpen(!isOpen)}
        disabled={exporting}
        className={`flex items-center px-4 py-2.5 rounded-xl font-medium transition-all shadow-md ${
          exporting
            ? "bg-blue-400 cursor-wait"
            : exportSuccess
            ? "bg-green-500 hover:bg-green-600"
            : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-lg hover:from-blue-700 hover:to-indigo-700"
        } text-white`}
      >
        {exporting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Export...
          </>
        ) : exportSuccess ? (
          <>
            <Check className="w-4 h-4 mr-2" />
            Terminé!
          </>
        ) : (
          <>
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-slide-in-down">
          <div className="px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              <span className="font-bold text-sm">Options d'export</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/20 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="py-1">
            {exportOptions.map((opt, i) => (
              <button
                key={i}
                onClick={opt.onClick}
                className="w-full flex items-center px-4 py-3 hover:bg-gray-50 transition-all text-left group"
              >
                <div
                  className={`p-2 rounded-lg mr-3 ${opt.color} group-hover:scale-110 transition-transform`}
                >
                  <opt.icon className="w-4 h-4" />
                </div>
                <span className="font-medium text-gray-900 group-hover:text-blue-600">
                  {opt.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Animated Counter Hook
const useAnimatedValue = (end, duration = 1500) => {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let start = 0;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setValue(end);
        clearInterval(timer);
      } else {
        setValue(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [end, duration]);
  return value;
};

// Components
const Card = ({ children, className = "", hover = true }) => (
  <div
    className={`bg-white rounded-2xl shadow-sm border border-gray-100 ${
      hover
        ? "hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
        : ""
    } ${className}`}
  >
    {children}
  </div>
);

const ProgressRing = ({
  progress,
  size = 120,
  strokeWidth = 8,
  color = "blue",
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;
  const colors = {
    blue: { stroke: "#3B82F6", bg: "#DBEAFE" },
    green: { stroke: "#10B981", bg: "#D1FAE5" },
    yellow: { stroke: "#F59E0B", bg: "#FEF3C7" },
    orange: { stroke: "#F97316", bg: "#FFEDD5" },
    red: { stroke: "#EF4444", bg: "#FEE2E2" },
  };
  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={colors[color].bg}
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={colors[color].stroke}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-1000 ease-out"
      />
    </svg>
  );
};

const Badge = ({ children, variant = "default" }) => {
  const variants = {
    default: "bg-gray-100 text-gray-700 border border-gray-200",
    success: "bg-green-100 text-green-700 border border-green-200",
    warning: "bg-orange-100 text-orange-700 border border-orange-200",
    error: "bg-red-100 text-red-700 border border-red-200",
    info: "bg-blue-100 text-blue-700 border border-blue-200",
  };
  return (
    <span
      className={`px-3 py-1 rounded-full text-sm font-medium ${variants[variant]}`}
    >
      {children}
    </span>
  );
};

// ============================================
// MAIN DASHBOARD COMPONENT
// ============================================
const Dashboard = ({ userResponses = null }) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [showConfetti, setShowConfetti] = useState(false);

  // EXEMPLE DE STRUCTURE DE RÉPONSES
  // Format simple : scores par dimension (échelle 1-5)
  const sampleResponses = {
    innovation: [4, 5, 3, 4, 5], // 5 questions, moyenne = 4.2/5 = 84%
    culture: [3, 4, 4, 3, 5], // 5 questions, moyenne = 3.8/5 = 76%
    experience: [4, 3, 4, 4, 3], // 5 questions, moyenne = 3.6/5 = 72%
    data: [3, 3, 2, 4, 3], // 5 questions, moyenne = 3.0/5 = 60%
    automation: [2, 3, 3, 2, 4], // 5 questions, moyenne = 2.8/5 = 56%
    security: [2, 2, 3, 3, 2], // 5 questions, moyenne = 2.4/5 = 48%
  };
  // Score global attendu : (84+76+72+60+56+48)/6 = 66%

  // Utiliser les réponses réelles ou les données d'exemple
  const responses = userResponses || sampleResponses;

  console.log("📊 Calcul du score avec les réponses:", responses);

  // Calcul des scores basés UNIQUEMENT sur les réponses
  const scoringResults = calculateScores(responses);

  console.log("✅ Résultats du calcul:", scoringResults);

  const { globalScore, dimensions, stats } = scoringResults;
  const maturityInfo = getMaturityLevel(globalScore);
  const recommendations = generateRecommendations(dimensions, stats);

  const data = {
    globalScore,
    previousScore: Math.max(0, globalScore - Math.floor(Math.random() * 15)),
    maturityLevel: maturityInfo.level,
    maturityEmoji: maturityInfo.emoji,
    maturityColor: maturityInfo.color,
    assessmentDate: new Date().toLocaleDateString("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    completionTime: `${stats.avgResponseTime || 12} min`,
    dimensions,
    recommendations,
    stats,
    comparison: {
      yourScore: globalScore,
      industryAvg: Math.max(30, globalScore - Math.floor(Math.random() * 20)),
      topPerformers: Math.min(95, globalScore + Math.floor(Math.random() * 25)),
    },
    evolutionData: Array.from({ length: 8 }, (_, i) => ({
      month: ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août"][i],
      score: Math.max(20, globalScore - (8 - i) * 3 + Math.random() * 5),
      industry: Math.max(30, globalScore - Math.floor(Math.random() * 15)),
    })),
    radarData: dimensions.map((dim) => ({
      dimension: dim.name.split(" ")[0],
      vous: dim.score,
      secteur: Math.max(30, dim.score - Math.floor(Math.random() * 15)),
      top: Math.min(95, dim.score + Math.floor(Math.random() * 20)),
    })),
  };

  const animatedScore = useAnimatedValue(data.globalScore);
  const scoreDiff = data.globalScore - data.previousScore;
  const getScoreColor = (s) =>
    s >= 75 ? "green" : s >= 50 ? "yellow" : s >= 30 ? "orange" : "red";

  useEffect(() => {
    if (data.globalScore >= 70) {
      setTimeout(() => setShowConfetti(true), 1000);
      setTimeout(() => setShowConfetti(false), 4000);
    }
  }, [data.globalScore]);

  const tabs = [
    { id: "overview", label: "Vue d'ensemble", icon: PieChart },
    { id: "details", label: "Détails", icon: BarChart3 },
    { id: "actions", label: "Plan d'action", icon: Target },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-20px`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            >
              <div
                className={`w-3 h-3 rounded-full ${
                  [
                    "bg-blue-500",
                    "bg-green-500",
                    "bg-yellow-500",
                    "bg-pink-500",
                    "bg-purple-500",
                  ][Math.floor(Math.random() * 5)]
                }`}
                style={{ transform: `rotate(${Math.random() * 360}deg)` }}
              />
            </div>
          ))}
        </div>
      )}

      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Diagnostic Digital - Résultats
                </h1>
                <div className="flex items-center space-x-3 text-sm text-gray-500">
                  <span className="flex items-center">
                    <Calendar className="w-3.5 h-3.5 mr-1" />
                    {data.assessmentDate}
                  </span>
                  <span className="flex items-center">
                    <Clock className="w-3.5 h-3.5 mr-1" />
                    {data.completionTime}
                  </span>
                  <Badge variant="info">{stats.totalQuestions} questions</Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                className="p-2.5 hover:bg-gray-100 rounded-xl transition-colors"
                title="Partager"
              >
                <Share2 className="w-5 h-5 text-gray-600" />
              </button>
              <ExportButton data={data} />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Score Card */}
        <Card
          className="p-8 mb-8 bg-gradient-to-br from-white to-blue-50/50 overflow-hidden relative"
          hover={false}
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-full blur-3xl" />
          <div className="relative flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-8">
              <div className="relative">
                <ProgressRing
                  progress={animatedScore}
                  size={160}
                  strokeWidth={12}
                  color={getScoreColor(data.globalScore)}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-bold text-gray-900">
                    {animatedScore}
                  </span>
                  <span className="text-gray-500 text-sm">sur 100</span>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Badge variant="info">
                    {data.maturityEmoji} {data.maturityLevel}
                  </Badge>
                  {scoreDiff > 0 && (
                    <span className="flex items-center text-green-600 text-sm font-medium">
                      <TrendingUp className="w-4 h-4 mr-1" />+{scoreDiff} pts
                    </span>
                  )}
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  Score de Maturité Digitale
                </h2>
                <p className="text-gray-600">
                  {stats.successRate}% de réponses optimales (
                  {stats.totalCorrect}/{stats.totalQuestions})
                </p>
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center text-sm">
                    <span className="font-semibold text-gray-700 mr-1">
                      Point fort:
                    </span>
                    <span className="text-green-600">
                      {stats.strongestDimension}
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="font-semibold text-gray-700 mr-1">
                      À améliorer:
                    </span>
                    <span className="text-orange-600">
                      {stats.weakestDimension}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[
                {
                  label: "Votre score",
                  value: `${data.comparison.yourScore}%`,
                  color: "blue",
                  icon: Target,
                },
                {
                  label: "Moyenne secteur",
                  value: `${data.comparison.industryAvg}%`,
                  color: "gray",
                  icon: BarChart3,
                },
                {
                  label: "Top performers",
                  value: `${data.comparison.topPerformers}%`,
                  color: "green",
                  icon: Award,
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="text-center p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <item.icon
                    className={`w-5 h-5 mx-auto mb-2 text-${item.color}-500`}
                  />
                  <p className="text-2xl font-bold text-gray-900">
                    {item.value}
                  </p>
                  <p className="text-xs text-gray-500">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Statistics Bar */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card className="p-4 text-center" hover={false}>
            <div className="text-3xl font-bold text-blue-600">
              {stats.consistency}%
            </div>
            <div className="text-sm text-gray-600 mt-1">Cohérence</div>
          </Card>
          <Card className="p-4 text-center" hover={false}>
            <div className="text-3xl font-bold text-green-600">
              {stats.successRate}%
            </div>
            <div className="text-sm text-gray-600 mt-1">Taux de réussite</div>
          </Card>
          <Card className="p-4 text-center" hover={false}>
            <div className="text-3xl font-bold text-purple-600">
              {dimensions.length}
            </div>
            <div className="text-sm text-gray-600 mt-1">Dimensions</div>
          </Card>
          <Card className="p-4 text-center" hover={false}>
            <div className="text-3xl font-bold text-orange-600">
              {stats.avgResponseTime}s
            </div>
            <div className="text-sm text-gray-600 mt-1">Temps moyen</div>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 mb-6 bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100 w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-5 py-2.5 rounded-xl font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                  Évolution de votre maturité
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={data.evolutionData}>
                    <defs>
                      <linearGradient
                        id="colorScore"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#3B82F6"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#3B82F6"
                          stopOpacity={0}
                        />
                      </linearGradient>
                      <linearGradient
                        id="colorIndustry"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#9CA3AF"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#9CA3AF"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="month" stroke="#6B7280" />
                    <YAxis stroke="#6B7280" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #E5E7EB",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="score"
                      stroke="#3B82F6"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorScore)"
                      name="Votre score"
                    />
                    <Area
                      type="monotone"
                      dataKey="industry"
                      stroke="#9CA3AF"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      fillOpacity={1}
                      fill="url(#colorIndustry)"
                      name="Moyenne secteur"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                  <PieChart className="w-5 h-5 mr-2 text-indigo-600" />
                  Comparaison multi-dimensions
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={data.radarData}>
                    <PolarGrid stroke="#E5E7EB" />
                    <PolarAngleAxis dataKey="dimension" stroke="#6B7280" />
                    <PolarRadiusAxis stroke="#6B7280" />
                    <Radar
                      name="Vous"
                      dataKey="vous"
                      stroke="#3B82F6"
                      fill="#3B82F6"
                      fillOpacity={0.5}
                      strokeWidth={2}
                    />
                    <Radar
                      name="Secteur"
                      dataKey="secteur"
                      stroke="#9CA3AF"
                      fill="#9CA3AF"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                    <Radar
                      name="Top"
                      dataKey="top"
                      stroke="#10B981"
                      fill="#10B981"
                      fillOpacity={0.2}
                      strokeWidth={2}
                    />
                    <Legend />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #E5E7EB",
                        borderRadius: "8px",
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </Card>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900">
                    Performance par dimension
                  </h3>
                  <Badge variant="default">
                    {data.dimensions.length} dimensions
                  </Badge>
                </div>
                <div className="space-y-4">
                  {data.dimensions.map((dim, i) => (
                    <div key={i} className="group">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center flex-1">
                          <div
                            className={`p-2 rounded-lg mr-3 ${
                              dim.score >= 70
                                ? "bg-green-100"
                                : dim.score >= 50
                                ? "bg-yellow-100"
                                : dim.score >= 30
                                ? "bg-orange-100"
                                : "bg-red-100"
                            }`}
                          >
                            <dim.icon
                              className={`w-4 h-4 ${
                                dim.score >= 70
                                  ? "text-green-600"
                                  : dim.score >= 50
                                  ? "text-yellow-600"
                                  : dim.score >= 30
                                  ? "text-orange-600"
                                  : "text-red-600"
                              }`}
                            />
                          </div>
                          <div className="flex-1">
                            <span className="font-medium text-gray-900 block">
                              {dim.name}
                            </span>
                            <span className="text-xs text-gray-500">
                              {dim.correctAnswers}/{dim.totalQuestions}{" "}
                              correctes
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className={`text-sm font-medium flex items-center ${
                              dim.trend >= 0 ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {dim.trend >= 0 ? (
                              <TrendingUp className="w-3 h-3 mr-1" />
                            ) : (
                              <TrendingDown className="w-3 h-3 mr-1" />
                            )}
                            {dim.trend > 0 && "+"}
                            {dim.trend}%
                          </span>
                          <span className="text-lg font-bold text-gray-900 w-12 text-right">
                            {dim.score}%
                          </span>
                        </div>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-1000 ${
                            dim.score >= 70
                              ? "bg-green-500"
                              : dim.score >= 50
                              ? "bg-yellow-500"
                              : dim.score >= 30
                              ? "bg-orange-500"
                              : "bg-red-500"
                          }`}
                          style={{ width: `${dim.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center">
                    <Sparkles className="w-5 h-5 mr-2 text-yellow-500" />
                    Recommandations IA
                  </h3>
                  <Badge variant="warning">
                    {recommendations.length} actions
                  </Badge>
                </div>
                <div className="space-y-3">
                  {data.recommendations.map((rec, i) => (
                    <div
                      key={i}
                      className="flex items-start p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 hover:shadow-md transition-all cursor-pointer group"
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center mr-4 flex-shrink-0 ${
                          rec.priority === "high"
                            ? "bg-red-500"
                            : rec.priority === "medium"
                            ? "bg-orange-500"
                            : "bg-yellow-500"
                        } text-white font-bold text-sm`}
                      >
                        {i + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                          {rec.text}
                        </p>
                        <div className="flex items-center mt-2 flex-wrap gap-2">
                          <Badge
                            variant={
                              rec.priority === "high"
                                ? "error"
                                : rec.priority === "medium"
                                ? "warning"
                                : "info"
                            }
                          >
                            {rec.priority === "high"
                              ? "Priorité haute"
                              : rec.priority === "medium"
                              ? "Priorité moyenne"
                              : "Priorité basse"}
                          </Badge>
                          <span className="text-sm text-green-600 font-medium flex items-center">
                            <ArrowUpRight className="w-3 h-3 mr-1" />
                            Impact: {rec.impact}
                          </span>
                          <span className="text-xs text-gray-500">
                            {rec.currentScore}% → {rec.targetScore}%
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "details" && (
          <Card className="p-6">
            <h3 className="text-lg font-bold mb-6">
              Analyse détaillée des dimensions
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.dimensions.map((dim, i) => (
                <div
                  key={i}
                  className="p-5 border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-lg transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`p-3 rounded-xl ${
                        dim.score >= 70
                          ? "bg-green-100"
                          : dim.score >= 50
                          ? "bg-yellow-100"
                          : dim.score >= 30
                          ? "bg-orange-100"
                          : "bg-red-100"
                      }`}
                    >
                      <dim.icon
                        className={`w-6 h-6 ${
                          dim.score >= 70
                            ? "text-green-600"
                            : dim.score >= 50
                            ? "text-yellow-600"
                            : dim.score >= 30
                            ? "text-orange-600"
                            : "text-red-600"
                        }`}
                      />
                    </div>
                    <span className="text-3xl font-bold text-gray-900">
                      {dim.score}%
                    </span>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {dim.name}
                  </h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Questions:</span>
                      <span className="font-medium">{dim.totalQuestions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Correctes:</span>
                      <span className="font-medium text-green-600">
                        {dim.correctAnswers}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Taux:</span>
                      <span className="font-medium">
                        {dim.totalQuestions > 0
                          ? Math.round(
                              (dim.correctAnswers / dim.totalQuestions) * 100
                            )
                          : 0}
                        %
                      </span>
                    </div>
                    <div className="flex items-center text-sm pt-2 border-t border-gray-100 mt-2">
                      <span
                        className={
                          dim.trend >= 0 ? "text-green-600" : "text-red-600"
                        }
                      >
                        {dim.trend >= 0 ? "↑" : "↓"} {Math.abs(dim.trend)}% vs
                        précédent
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {activeTab === "actions" && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold">
                  Plan d'action personnalisé
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Suivez ces recommandations pour améliorer votre score
                </p>
              </div>
              <button className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Valider le plan
              </button>
            </div>
            <div className="space-y-4">
              {data.recommendations.map((rec, i) => (
                <div
                  key={i}
                  className="flex items-center p-5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
                >
                  <input
                    type="checkbox"
                    className="w-5 h-5 rounded-lg border-gray-300 text-blue-600 mr-4 cursor-pointer"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-gray-900">{rec.text}</p>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          rec.priority === "high"
                            ? "bg-red-100 text-red-700"
                            : rec.priority === "medium"
                            ? "bg-orange-100 text-orange-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {rec.priority === "high"
                          ? "Urgent"
                          : rec.priority === "medium"
                          ? "Important"
                          : "Opportunité"}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm mt-2">
                      <span className="text-gray-500">
                        Dimension:{" "}
                        <span className="font-medium text-gray-700">
                          {rec.dimension}
                        </span>
                      </span>
                      <span className="text-gray-500">
                        Impact estimé:{" "}
                        <span className="text-green-600 font-medium">
                          {rec.impact}
                        </span>
                      </span>
                      <span className="text-gray-500">
                        Objectif:{" "}
                        <span className="font-medium text-blue-600">
                          {rec.targetScore}%
                        </span>
                      </span>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-2xl font-bold text-gray-900">
                      {rec.currentScore}%
                    </div>
                    <div className="text-xs text-gray-500">Score actuel</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">
                    Conseil IA
                  </h4>
                  <p className="text-sm text-gray-700">
                    En suivant ces {recommendations.length} recommandations,
                    votre score global pourrait augmenter de{" "}
                    <span className="font-bold text-green-600">
                      +
                      {Math.round(
                        recommendations.reduce(
                          (sum, rec) => sum + parseInt(rec.impact),
                          0
                        ) / recommendations.length
                      )}
                      %
                    </span>{" "}
                    dans les 3 prochains mois.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* CTA Card */}
        <div className="mt-8 text-center">
          <Card
            className="inline-flex items-center gap-6 p-6 bg-gradient-to-r from-blue-600 to-indigo-600"
            hover={false}
          >
            <div className="text-left text-white">
              <h3 className="text-xl font-bold">
                Prêt à passer au niveau supérieur ?
              </h3>
              <p className="text-blue-100">
                Téléchargez votre rapport complet ou lancez un nouveau
                diagnostic
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => generatePDF(data)}
                className="px-5 py-3 bg-white text-blue-600 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Rapport PDF
              </button>
              <button className="px-5 py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-400 transition-all flex items-center">
                <RefreshCw className="w-4 h-4 mr-2" />
                Nouveau test
              </button>
            </div>
          </Card>
        </div>
      </main>

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          .no-print {
            display: none !important;
          }
          header button,
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
