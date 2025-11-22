import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import useAssessment from "../../hooks/useAssessment";
import QuestionCard from "./QuestionCard";
import ProgressBar from "./ProgressBar";
import Loader from "../Common/Loader";
import Button from "../Common/Button";

const ConversationFlow = () => {
  const { assessmentId } = useParams();
  const navigate = useNavigate();

  const {
    currentQuestion,
    progress,
    loading,
    error,
    isCompleted,
    submitAnswer,
    loadAssessment,
  } = useAssessment(assessmentId);

  // Load assessment on mount
  useEffect(() => {
    if (assessmentId) {
      loadAssessment();
    }
  }, [assessmentId, loadAssessment]);

  // Redirect to results when completed
  useEffect(() => {
    if (isCompleted) {
      navigate(`/results/${assessmentId}`);
    }
  }, [isCompleted, assessmentId, navigate]);

  // Handle keyboard shortcuts (A, B, C, D for quick selection)
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!currentQuestion || loading) return;

      // A, B, C, D keys for quick selection
      const keyCode = e.key.toUpperCase().charCodeAt(0);
      const optionIndex = keyCode - 65; // A=0, B=1, C=2, D=3

      if (optionIndex >= 0 && optionIndex < currentQuestion.options.length) {
        const option = currentQuestion.options[optionIndex];
        handleSubmit(option.id);
      }
    };

    window.addEventListener("keypress", handleKeyPress);
    return () => window.removeEventListener("keypress", handleKeyPress);
  }, [currentQuestion, loading]);

  const handleSubmit = async (answerId) => {
    if (!currentQuestion) return;

    try {
      const result = await submitAnswer(currentQuestion.id, answerId);

      if (result.completed) {
        // Will redirect via useEffect
        return;
      }
    } catch (err) {
      console.error("Error submitting answer:", err);
    }
  };

  const handleBack = () => {
    if (
      window.confirm(
        "Êtes-vous sûr de vouloir quitter ? Votre progression sera sauvegardée."
      )
    ) {
      navigate("/");
    }
  };

  // Loading state
  if (loading && !currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader size="lg" text="Chargement du diagnostic..." />
      </div>
    );
  }

  // Error state
  if (error && !currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Erreur de chargement
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => navigate("/")} variant="primary">
            Retour à l'accueil
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Progress Bar */}
      <ProgressBar progress={progress} />

      {/* Back Button */}
      <div className="max-w-4xl mx-auto px-4 py-4">
        <button
          onClick={handleBack}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          <span className="text-sm font-medium">Quitter</span>
        </button>
      </div>

      {/* Question Card */}
      {currentQuestion && (
        <QuestionCard
          question={currentQuestion}
          onSubmit={handleSubmit}
          loading={loading}
        />
      )}

      {/* Error Message (inline) */}
      {error && currentQuestion && (
        <div className="max-w-3xl mx-auto px-4 mt-4 fade-in">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <svg
                className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <h3 className="text-sm font-medium text-red-800">
                  Une erreur est survenue
                </h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Progress Score Display */}
      {progress?.progressScore !== undefined && progress.progressScore > 0 && (
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-900 mb-1">
                  Score intermédiaire
                </p>
                <p className="text-3xl font-bold text-blue-600">
                  {progress.progressScore}%
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  Basé sur vos réponses actuelles
                </p>
              </div>
              <div className="text-5xl">
                {progress.progressScore >= 75
                  ? "🌟"
                  : progress.progressScore >= 50
                  ? "⭐"
                  : progress.progressScore >= 25
                  ? "✨"
                  : "💫"}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Milestone Celebrations */}
      {progress?.percentComplete &&
        [25, 50, 75].includes(progress.percentComplete) && (
          <div className="max-w-3xl mx-auto px-4 py-4 fade-in">
            <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4 border border-green-200 shadow-sm">
              <div className="flex items-center">
                <span className="text-3xl mr-3">
                  {progress.percentComplete === 25 && "🎯"}
                  {progress.percentComplete === 50 && "🎉"}
                  {progress.percentComplete === 75 && "🚀"}
                </span>
                <div>
                  <p className="font-semibold text-green-900">
                    {progress.percentComplete === 25 && "Excellent début !"}
                    {progress.percentComplete === 50 && "Bravo ! À mi-chemin !"}
                    {progress.percentComplete === 75 && "Presque terminé !"}
                  </p>
                  <p className="text-sm text-green-700">
                    {progress.percentComplete}% complété - Continuez comme ça !
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

      {/* Dimension Progress Indicator */}
      {progress?.dimensionProgress && (
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-4">
              Progression par dimension
            </h3>
            <div className="space-y-3">
              {progress.dimensionProgress
                .filter((dim) => dim.progress > 0)
                .map((dim) => (
                  <div
                    key={dim.dimensionId}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm text-gray-700 flex-1">
                      {dim.dimensionName}
                    </span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            dim.status === "completed"
                              ? "bg-green-500"
                              : "bg-blue-500"
                          }`}
                          style={{ width: `${dim.progress}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-600 w-12 text-right">
                        {dim.progress}%
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConversationFlow;
