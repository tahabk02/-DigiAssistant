import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Target, Users, Heart, Workflow, Cpu, Shield } from "lucide-react";
import Button from "../Common/Button";
import Card from "../Common/Card";
import useAssessment from "../../hooks/useAssessment";
import { COMPANY_SIZES, SECTORS } from "../../utils/constants";

const WelcomeScreen = () => {
  const navigate = useNavigate();
  const { startAssessment, loading, error } = useAssessment();

  const [formData, setFormData] = useState({
    name: "",
    size: "",
    sector: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleStart = async (e) => {
    e.preventDefault();

    try {
      const assessmentId = await startAssessment(formData);
      navigate(`/assessment/${assessmentId}`);
    } catch (err) {
      console.error("Error starting assessment:", err);
    }
  };

  const dimensions = [
    {
      icon: Target,
      name: "Stratégie",
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      icon: Users,
      name: "Culture & Humain",
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      icon: Heart,
      name: "Relation Client",
      color: "text-pink-600",
      bg: "bg-pink-50",
    },
    {
      icon: Workflow,
      name: "Processus",
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
    {
      icon: Cpu,
      name: "Technologie",
      color: "text-cyan-600",
      bg: "bg-cyan-50",
    },
    {
      icon: Shield,
      name: "Sécurité",
      color: "text-green-600",
      bg: "bg-green-50",
    },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12 fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Évaluez votre{" "}
            <span className="text-blue-600">Maturité Digitale</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Un diagnostic conversationnel et adaptatif pour comprendre vos
            forces et identifier vos opportunités d'amélioration.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Form Card */}
          <Card className="slide-up">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Commencez votre diagnostic
            </h2>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleStart} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de l'entreprise (optionnel)
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Votre entreprise"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Taille de l'entreprise
                </label>
                <select
                  name="size"
                  value={formData.size}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Sélectionnez...</option>
                  {Object.entries(COMPANY_SIZES).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Secteur d'activité
                </label>
                <select
                  name="sector"
                  value={formData.sector}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Sélectionnez...</option>
                  {Object.entries(SECTORS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={loading}
              >
                Démarrer le diagnostic
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center text-sm text-gray-600">
                <svg
                  className="w-5 h-5 text-green-500 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Durée estimée: 10-15 minutes</span>
              </div>
            </div>
          </Card>

          {/* Info Card */}
          <div
            className="space-y-6 slide-up"
            style={{ animationDelay: "0.1s" }}
          >
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                📊 6 Dimensions évaluées
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {dimensions.map((dim, index) => (
                  <div
                    key={index}
                    className={`${dim.bg} rounded-lg p-3 flex items-center space-x-2`}
                  >
                    <dim.icon className={`w-5 h-5 ${dim.color}`} />
                    <span className="text-sm font-medium text-gray-700">
                      {dim.name}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                ✨ Ce que vous obtiendrez
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  <span className="text-sm text-gray-700">
                    Un profil de maturité digitale personnalisé
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  <span className="text-sm text-gray-700">
                    Des scores détaillés par dimension
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  <span className="text-sm text-gray-700">
                    Une analyse de vos forces et axes d'amélioration
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  <span className="text-sm text-gray-700">
                    Des recommandations actionnables
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  <span className="text-sm text-gray-700">
                    Un rapport PDF téléchargeable
                  </span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
