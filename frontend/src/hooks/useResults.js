import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { apiService } from "../services/api";
import { downloadPDF } from "../services/pdfService";

export const useResults = (assessmentId) => {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
      if (!assessmentId) return;

      try {
        setLoading(true);
        const response = await apiService.getResults(assessmentId);
        setResults(response.data);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching results:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [assessmentId]);

  const exportPDF = async () => {
    if (!results) return;

    setExporting(true);
    try {
      // Utiliser les données existantes pour générer le PDF
      downloadPDF(results, results.companyInfo);
    } catch (err) {
      console.error("Error exporting PDF:", err);
      alert("Erreur lors de l'export PDF");
    } finally {
      setExporting(false);
    }
  };

  const exportJSON = async () => {
    if (!results) return;

    try {
      const dataStr = JSON.stringify(results, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });

      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `digiassistant-donnees-${
        results.companyInfo?.name || "diagnostic"
      }-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error exporting JSON:", err);
      alert("Erreur lors de l'export JSON");
    }
  };

  const loadResults = async () => {
    if (!assessmentId) return;

    try {
      setLoading(true);
      const response = await apiService.getResults(assessmentId);
      setResults(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    // Données
    results,
    comparison: results?.comparison,

    // Scores calculés
    globalScore: results?.overallScore || 0,
    maturityProfile: {
      level: results?.maturityLevel,
      label: results?.maturityLabel,
    },
    dimensionScores: results?.dimensionScores || [],
    strengths: results?.strengths || [],
    gaps: results?.gaps || [],

    // États
    loading,
    error,
    exporting,

    // Méthodes
    loadResults,
    exportPDF,
    exportJSON,
  };
};

export default useResults;
