import React, { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Star,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Target,
  Lightbulb,
  ArrowRight,
} from "lucide-react";

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
    {children}
  </div>
);

const ProgressBar = ({ value, color = "green" }) => {
  const colors = {
    green: "bg-green-500",
    orange: "bg-orange-500",
    blue: "bg-blue-500",
  };
  return (
    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
      <div
        className={`${colors[color]} h-2 rounded-full transition-all duration-700 ease-out`}
        style={{ width: `${value}%` }}
      />
    </div>
  );
};

const GapAnalysis = ({ strengths, gaps }) => {
  const [expandedStrength, setExpandedStrength] = useState(null);
  const [expandedGap, setExpandedGap] = useState(null);
  const [activeTab, setActiveTab] = useState("strengths");

  const avgImprovement = gaps?.length
    ? Math.round(
        gaps.reduce((sum, g) => sum + (g.improvementPotential || 0), 0) /
          gaps.length
      )
    : 0;

  const totalStrengths = strengths?.length || 0;
  const totalGaps = gaps?.length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      {/* Header Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card className="text-center border-l-4 border-green-500">
          <p className="text-3xl font-bold text-green-600">{totalStrengths}</p>
          <p className="text-sm text-gray-600">Points Forts</p>
        </Card>
        <Card className="text-center border-l-4 border-orange-500">
          <p className="text-3xl font-bold text-orange-600">{totalGaps}</p>
          <p className="text-sm text-gray-600">Axes d'Amélioration</p>
        </Card>
        <Card className="text-center border-l-4 border-blue-500">
          <p className="text-3xl font-bold text-blue-600">+{avgImprovement}%</p>
          <p className="text-sm text-gray-600">Potentiel Moyen</p>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-2 mb-6">
        <button
          onClick={() => setActiveTab("strengths")}
          className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-300 flex items-center justify-center space-x-2 ${
            activeTab === "strengths"
              ? "bg-green-500 text-white shadow-lg shadow-green-200"
              : "bg-white text-gray-600 hover:bg-green-50"
          }`}
        >
          <Star className="w-5 h-5" />
          <span>Points Forts ({totalStrengths})</span>
        </button>
        <button
          onClick={() => setActiveTab("gaps")}
          className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-300 flex items-center justify-center space-x-2 ${
            activeTab === "gaps"
              ? "bg-orange-500 text-white shadow-lg shadow-orange-200"
              : "bg-white text-gray-600 hover:bg-orange-50"
          }`}
        >
          <Target className="w-5 h-5" />
          <span>À Améliorer ({totalGaps})</span>
        </button>
      </div>

      {/* Strengths Section */}
      {activeTab === "strengths" && (
        <div className="space-y-4">
          {strengths && strengths.length > 0 ? (
            strengths.map((strength, index) => (
              <Card
                key={index}
                className="cursor-pointer hover:shadow-xl transition-all duration-300 border-l-4 border-green-500"
              >
                <div
                  className="flex items-center justify-between"
                  onClick={() =>
                    setExpandedStrength(
                      expandedStrength === index ? null : index
                    )
                  }
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gradient-to-br from-green-400 to-green-600 rounded-xl shadow-lg">
                      <Star className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">
                        {strength.dimensionName}
                      </h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            strength.level === "excellent"
                              ? "bg-green-100 text-green-700"
                              : strength.level === "good"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {strength.level === "excellent"
                            ? "Excellent"
                            : strength.level === "good"
                            ? "Bon"
                            : "Modéré"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-3xl font-bold text-green-600">
                        {strength.percentage}%
                      </p>
                      <div className="flex items-center text-green-500 text-sm">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        <span>Performance</span>
                      </div>
                    </div>
                    {expandedStrength === index ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>
                <ProgressBar value={strength.percentage} color="green" />

                {expandedStrength === index && (
                  <div className="mt-4 pt-4 border-t border-gray-100 animate-fadeIn">
                    <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-xl">
                      <Lightbulb className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-green-800">
                          Recommandation
                        </p>
                        <p className="text-sm text-green-700 mt-1">
                          Capitalisez sur cette force en partageant les
                          meilleures pratiques avec les autres équipes.
                          Documentez vos processus pour maintenir ce niveau
                          d'excellence.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            ))
          ) : (
            <Card className="text-center py-12">
              <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Aucune force identifiée</p>
              <p className="text-gray-400 text-sm mt-2">
                Continuez à développer vos compétences
              </p>
            </Card>
          )}
        </div>
      )}

      {/* Gaps Section */}
      {activeTab === "gaps" && (
        <div className="space-y-4">
          {gaps && gaps.length > 0 ? (
            gaps.map((gap, index) => (
              <Card
                key={index}
                className="cursor-pointer hover:shadow-xl transition-all duration-300 border-l-4 border-orange-500"
              >
                <div
                  className="flex items-center justify-between"
                  onClick={() =>
                    setExpandedGap(expandedGap === index ? null : index)
                  }
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl shadow-lg">
                      <AlertTriangle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">
                        {gap.dimensionName}
                      </h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                          +{gap.improvementPotential}% potentiel
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-3xl font-bold text-orange-600">
                        {gap.percentage}%
                      </p>
                      <div className="flex items-center text-orange-500 text-sm">
                        <TrendingDown className="w-4 h-4 mr-1" />
                        <span>Actuel</span>
                      </div>
                    </div>
                    {expandedGap === index ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>
                <ProgressBar value={gap.percentage} color="orange" />

                {expandedGap === index && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-start space-x-3 p-4 bg-orange-50 rounded-xl">
                      <Target className="w-5 h-5 text-orange-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-orange-800">
                          Plan d'Action
                        </p>
                        <p className="text-sm text-orange-700 mt-1">
                          Priorisez cette dimension dans votre roadmap.
                          Identifiez les quick-wins et établissez des KPIs pour
                          mesurer votre progression.
                        </p>
                        <div className="flex items-center mt-3 text-orange-600 font-medium text-sm">
                          <span>Voir les recommandations détaillées</span>
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            ))
          ) : (
            <Card className="text-center py-12">
              <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">
                Aucun axe d'amélioration majeur
              </p>
              <p className="text-gray-400 text-sm mt-2">
                Excellente performance globale!
              </p>
            </Card>
          )}
        </div>
      )}

      {/* Global Potential Card */}
      {gaps && gaps.length > 0 && (
        <Card className="mt-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-xl mb-2">
                🚀 Potentiel de Progression
              </h3>
              <p className="text-blue-100 text-sm">
                En travaillant sur vos {totalGaps} axes d'amélioration, vous
                pouvez significativement augmenter votre maturité digitale.
              </p>
            </div>
            <div className="text-center bg-white/20 rounded-2xl p-4 backdrop-blur">
              <p className="text-4xl font-bold">+{avgImprovement}%</p>
              <p className="text-xs text-blue-100">Progression moyenne</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

// Demo with sample data
export default function App() {
  const sampleStrengths = [
    { dimensionName: "Innovation & R&D", level: "excellent", percentage: 92 },
    { dimensionName: "Culture Digitale", level: "good", percentage: 78 },
    { dimensionName: "Expérience Client", level: "excellent", percentage: 88 },
  ];

  const sampleGaps = [
    {
      dimensionName: "Automatisation des Processus",
      percentage: 45,
      improvementPotential: 35,
    },
    {
      dimensionName: "Data & Analytics",
      percentage: 52,
      improvementPotential: 28,
    },
    {
      dimensionName: "Cybersécurité",
      percentage: 58,
      improvementPotential: 22,
    },
  ];

  return <GapAnalysis strengths={sampleStrengths} gaps={sampleGaps} />;
}
