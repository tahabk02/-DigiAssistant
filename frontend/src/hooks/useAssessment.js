import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { apiService } from "../services/api";

export const useAssessment = (assessmentId = null) => {
  const [assessment, setAssessment] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const navigate = useNavigate();

  // Start a new assessment
  const startAssessment = useCallback(async (companyData) => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiService.startAssessment(companyData);

      if (result.success) {
        setCurrentQuestion(result.currentQuestion);
        setProgress(result.progress);
        return result.assessmentId;
      }
    } catch (err) {
      setError(err.message || "Erreur lors du démarrage du diagnostic");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Submit an answer
  const submitAnswer = useCallback(
    async (questionId, answerId) => {
      if (!assessmentId) {
        throw new Error("Assessment ID is required");
      }

      setLoading(true);
      setError(null);

      try {
        const result = await apiService.submitAnswer(assessmentId, {
          questionId,
          answerId,
        });

        if (result.success) {
          if (result.completed) {
            setIsCompleted(true);
            setCurrentQuestion(null);
            return { completed: true, redirectTo: result.redirectTo };
          } else {
            setCurrentQuestion(result.nextQuestion);
            setProgress(result.progress);
            return { completed: false, nextQuestion: result.nextQuestion };
          }
        }
      } catch (err) {
        setError(err.message || "Erreur lors de la soumission de la réponse");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [assessmentId]
  );

  // Load assessment details
  const loadAssessment = useCallback(async () => {
    if (!assessmentId) return;

    setLoading(true);
    setError(null);

    try {
      const result = await apiService.getAssessment(assessmentId);

      if (result.success) {
        setAssessment(result.assessment);
        setCurrentQuestion(result.assessment.currentQuestion);
        setProgress(result.assessment.progress);
      }
    } catch (err) {
      setError(err.message || "Erreur lors du chargement du diagnostic");
    } finally {
      setLoading(false);
    }
  }, [assessmentId]);

  // Load assessment on mount if ID provided
  useEffect(() => {
    if (assessmentId) {
      loadAssessment();
    }
  }, [assessmentId, loadAssessment]);

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timeout = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timeout);
    }
  }, [error]);

  return {
    // State
    assessment,
    currentQuestion,
    progress,
    loading,
    error,
    isCompleted,

    // Methods
    startAssessment,
    submitAnswer,
    loadAssessment,

    // Computed
    hasProgress: progress !== null,
    progressPercentage: progress?.percentComplete || 0,
    questionsAnswered: progress?.questionsAnswered || 0,
    estimatedTimeRemaining:
      progress?.estimatedTimeRemaining?.estimatedMinutes || 0,
  };
};

export default useAssessment;
