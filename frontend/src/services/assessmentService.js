import { apiService } from "./api";

const assessmentService = {
  async start(companyData) {
    const response = await apiService.startAssessment(companyData);
    return response;
  },

  async getDetails(assessmentId) {
    const response = await apiService.getAssessment(assessmentId);
    return response;
  },

  async submitAnswer(assessmentId, questionId, answerId) {
    const response = await apiService.submitAnswer(assessmentId, {
      questionId,
      answerId,
    });
    return response;
  },

  async getProgress(assessmentId) {
    const response = await apiService.getProgress(assessmentId);
    return response;
  },

  async resume(assessmentId) {
    const response = await apiService.resumeAssessment(assessmentId);
    return response;
  },

  async getResults(assessmentId) {
    const response = await apiService.getResults(assessmentId);
    return response;
  },

  async exportToPDF(assessmentId) {
    const response = await apiService.exportPDF(assessmentId);

    // Créer un lien de téléchargement
    const url = window.URL.createObjectURL(new Blob([response]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `digiassistant-resultat-${assessmentId}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    return response;
  },
};

export default assessmentService;
