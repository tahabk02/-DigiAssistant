import React, { useState, useEffect } from "react";
import { CheckCircle, ChevronRight } from "lucide-react";
import Button from "../Common/Button";
import Card from "../Common/Card";

const QuestionCard = ({ question, onSubmit, loading }) => {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showHint, setShowHint] = useState(true);

  // Reset selection when question changes
  useEffect(() => {
    setSelectedAnswer(null);
  }, [question?.id]);

  // Hide hint after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowHint(false), 3000);
    return () => clearTimeout(timer);
  }, [question?.id]);

  const handleSubmit = () => {
    if (selectedAnswer && onSubmit) {
      onSubmit(selectedAnswer);
    }
  };

  const handleKeyPress = (e, answerId) => {
    if (e.key === "Enter" && !loading) {
      setSelectedAnswer(answerId);
      setTimeout(() => handleSubmit(), 100);
    }
  };

  if (!question) return null;

  // Get dimension info
  const getDimensionInfo = () => {
    const dimensions = {
      strategy: {
        icon: "🎯",
        name: "Stratégie",
        color: "bg-blue-100 text-blue-800",
      },
      culture: {
        icon: "👥",
        name: "Culture & Humain",
        color: "bg-purple-100 text-purple-800",
      },
      customer: {
        icon: "❤️",
        name: "Relation Client",
        color: "bg-pink-100 text-pink-800",
      },
      process: {
        icon: "⚙️",
        name: "Processus",
        color: "bg-orange-100 text-orange-800",
      },
      technology: {
        icon: "💻",
        name: "Technologie",
        color: "bg-cyan-100 text-cyan-800",
      },
      security: {
        icon: "🔒",
        name: "Sécurité",
        color: "bg-green-100 text-green-800",
      },
    };

    return (
      dimensions[question.dimension] || {
        icon: "👋",
        name: "Introduction",
        color: "bg-gray-100 text-gray-800",
      }
    );
  };

  const dimensionInfo = getDimensionInfo();

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 fade-in">
      <Card padding="lg" className="slide-up">
        {/* Dimension Badge */}
        <div className="mb-6">
          <span
            className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${dimensionInfo.color}`}
          >
            <span className="mr-2">{dimensionInfo.icon}</span>
            {dimensionInfo.name}
          </span>
        </div>

        {/* Question Text */}
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 leading-tight">
          {question.text}
        </h2>

        {/* Options */}
        <div className="space-y-3 mb-8">
          {question.options?.map((option, index) => {
            const isSelected = selectedAnswer === option.id;
            const letterKey = String.fromCharCode(65 + index); // A, B, C, D

            return (
              <button
                key={option.id}
                onClick={() => setSelectedAnswer(option.id)}
                onKeyPress={(e) => handleKeyPress(e, option.id)}
                disabled={loading}
                tabIndex={0}
                className={`
                  w-full text-left px-6 py-4 rounded-xl border-2 transition-all duration-200 group
                  ${
                    isSelected
                      ? "border-blue-500 bg-blue-50 shadow-md scale-[1.02]"
                      : "border-gray-200 bg-white hover:border-blue-300 hover:bg-gray-50 hover:shadow-sm"
                  }
                  ${
                    loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                  }
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                `}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start space-x-4 flex-1">
                    {/* Option Letter Badge */}
                    <div
                      className={`
                        w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 transition-all
                        ${
                          isSelected
                            ? "bg-blue-500 text-white"
                            : "bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600"
                        }
                      `}
                    >
                      {letterKey}
                    </div>

                    {/* Option Text */}
                    <div className="flex-1 pt-1">
                      <span
                        className={`text-base leading-relaxed ${
                          isSelected
                            ? "text-gray-900 font-medium"
                            : "text-gray-700"
                        }`}
                      >
                        {option.text}
                      </span>

                      {/* Score indicator for scored questions */}
                      {question.metadata?.isScored &&
                        option.score !== undefined && (
                          <div className="mt-2">
                            <span className="inline-flex items-center text-xs text-gray-500">
                              <span className="mr-1">💡</span>
                              {option.score} point{option.score > 1 ? "s" : ""}
                            </span>
                          </div>
                        )}
                    </div>
                  </div>

                  {/* Check Icon */}
                  {isSelected && (
                    <CheckCircle className="w-6 h-6 text-blue-500 flex-shrink-0 mt-2" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Action Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-6 border-t border-gray-200">
          {/* Question Info */}
          <div className="flex flex-col space-y-1">
            {question.metadata?.isScored && (
              <span className="text-sm text-gray-600 flex items-center">
                <span className="mr-2">💡</span>
                Cette question contribue à votre score
              </span>
            )}
            {question.metadata?.isLastQuestion && (
              <span className="text-sm text-green-600 font-medium flex items-center">
                <span className="mr-2">🎉</span>
                Dernière question !
              </span>
            )}
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={!selectedAnswer || loading}
            loading={loading}
            variant="primary"
            size="lg"
            icon={!loading && <ChevronRight className="w-5 h-5" />}
            className="w-full sm:w-auto"
          >
            {question.metadata?.isLastQuestion
              ? "Terminer le diagnostic"
              : "Continuer"}
          </Button>
        </div>

        {/* Keyboard Hint */}
        {showHint && (
          <div className="mt-6 pt-6 border-t border-gray-200 fade-in">
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs font-mono">
                A
              </kbd>
              <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs font-mono">
                B
              </kbd>
              <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs font-mono">
                C
              </kbd>
              <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs font-mono">
                D
              </kbd>
              <span className="ml-2">
                Utilisez les touches pour sélectionner rapidement
              </span>
            </div>
          </div>
        )}
      </Card>

      {/* Question Type Info */}
      {question.type === "intro" && (
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500">
            ℹ️ Questions d'introduction pour personnaliser votre diagnostic
          </p>
        </div>
      )}
    </div>
  );
};

export default QuestionCard;
