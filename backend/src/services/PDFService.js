/**
 * PDFService - Service de génération de rapports PDF
 * Utilise Puppeteer pour la conversion HTML -> PDF
 * Compatible avec le système d'export frontend
 */

const puppeteer = require("puppeteer");

class PDFService {
  constructor() {
    this.browserInstance = null;
    this.defaultOptions = {
      format: "A4",
      printBackground: true,
      margin: { top: "15mm", right: "15mm", bottom: "20mm", left: "15mm" },
      displayHeaderFooter: true,
      headerTemplate: `<div style="font-size:10px;text-align:center;width:100%;color:#9ca3af;">DigiAssistant - Rapport de Maturité Digitale</div>`,
      footerTemplate: `<div style="font-size:9px;text-align:center;width:100%;color:#9ca3af;">Page <span class="pageNumber"></span> sur <span class="totalPages"></span> | Généré le <span class="date"></span></div>`,
    };
  }

  // Initialise le navigateur (réutilisable)
  async initBrowser() {
    if (!this.browserInstance) {
      this.browserInstance = await puppeteer.launch({
        headless: "new",
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-gpu",
          "--font-render-hinting=none",
        ],
      });
    }
    return this.browserInstance;
  }

  // Ferme le navigateur
  async closeBrowser() {
    if (this.browserInstance) {
      await this.browserInstance.close();
      this.browserInstance = null;
    }
  }

  // Génère le rapport PDF complet
  async generateReport(assessment, scores, options = {}) {
    const startTime = Date.now();

    try {
      const html = this.generateHTML(assessment, scores);
      const pdfBuffer = await this.convertHTMLToPDF(html, options);

      const filename = this.generateFilename(assessment);

      console.log(`PDF generated in ${Date.now() - startTime}ms`);

      return {
        buffer: pdfBuffer,
        filename,
        mimeType: "application/pdf",
        size: pdfBuffer.length,
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error("PDF generation error:", error);
      throw new Error(`Échec de la génération PDF: ${error.message}`);
    }
  }

  // Génère le nom du fichier
  generateFilename(assessment) {
    const companyName =
      assessment.companyInfo?.name?.replace(/[^a-zA-Z0-9]/g, "_") ||
      "diagnostic";
    const date = new Date().toISOString().split("T")[0];
    return `DigiAssistant_Rapport_${companyName}_${date}.pdf`;
  }

  // Template HTML amélioré pour le PDF
  generateHTML(assessment, scores) {
    const { globalScore, maturityProfile, dimensionScores, strengths, gaps } =
      scores;
    const company = assessment.companyInfo || {};
    const date = new Date(
      assessment.completedAt || Date.now()
    ).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const getScoreColor = (score) =>
      score >= 70 ? "#10B981" : score >= 50 ? "#F59E0B" : "#EF4444";
    const getScoreLabel = (score) =>
      score >= 76
        ? "Excellent"
        : score >= 51
        ? "Bon"
        : score >= 26
        ? "Moyen"
        : "Faible";
    const getScoreBadgeClass = (score) =>
      score >= 70
        ? "badge-success"
        : score >= 50
        ? "badge-warning"
        : "badge-danger";

    return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Rapport DigiAssistant - ${company.name || "Diagnostic"}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      line-height: 1.6;
      color: #1e293b;
      background: #fff;
      font-size: 14px;
    }
    
    .container { max-width: 800px; margin: 0 auto; padding: 40px; }
    
    /* Header */
    .header {
      text-align: center;
      padding: 40px;
      background: linear-gradient(135deg, #3B82F6 0%, #6366F1 100%);
      color: white;
      border-radius: 16px;
      margin-bottom: 30px;
    }
    .logo { font-size: 28px; font-weight: 700; margin-bottom: 8px; letter-spacing: -0.5px; }
    .header h1 { font-size: 24px; font-weight: 600; margin-bottom: 8px; }
    .header .subtitle { font-size: 14px; opacity: 0.9; }
    
    /* Score Card */
    .score-card {
      background: linear-gradient(135deg, ${
        maturityProfile?.color || "#3B82F6"
      }22, ${maturityProfile?.color || "#3B82F6"}11);
      border: 2px solid ${maturityProfile?.color || "#3B82F6"};
      border-radius: 16px;
      padding: 40px;
      text-align: center;
      margin-bottom: 30px;
    }
    .score-value {
      font-size: 72px;
      font-weight: 700;
      color: ${maturityProfile?.color || "#3B82F6"};
      line-height: 1;
    }
    .score-label { font-size: 14px; color: #64748b; margin-bottom: 8px; }
    .maturity-name {
      font-size: 24px;
      font-weight: 600;
      color: #1e293b;
      margin-top: 16px;
    }
    .maturity-desc {
      font-size: 14px;
      color: #64748b;
      margin-top: 8px;
      max-width: 500px;
      margin-left: auto;
      margin-right: auto;
    }
    
    /* Info Box */
    .info-box {
      background: #f8fafc;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 30px;
    }
    .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
    .info-item { display: flex; flex-direction: column; }
    .info-label { font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
    .info-value { font-size: 15px; font-weight: 600; color: #1e293b; margin-top: 4px; }
    
    /* Section */
    .section { margin: 30px 0; page-break-inside: avoid; }
    .section-title {
      font-size: 18px;
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 20px;
      padding-bottom: 12px;
      border-bottom: 3px solid #3B82F6;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .section-icon {
      width: 28px;
      height: 28px;
      background: #3B82F6;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 14px;
    }
    
    /* Dimension Cards */
    .dimension {
      background: #fff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 16px 20px;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .dimension:hover { border-color: #3B82F6; }
    .dimension-info { flex: 1; }
    .dimension-name { font-weight: 600; color: #1e293b; font-size: 15px; }
    .dimension-bar {
      height: 8px;
      background: #e2e8f0;
      border-radius: 4px;
      margin-top: 8px;
      overflow: hidden;
      width: 200px;
    }
    .dimension-fill { height: 100%; border-radius: 4px; transition: width 0.3s; }
    .dimension-score { font-size: 24px; font-weight: 700; min-width: 70px; text-align: right; }
    
    /* Badges */
    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
    }
    .badge-success { background: #D1FAE5; color: #065F46; }
    .badge-warning { background: #FEF3C7; color: #92400E; }
    .badge-danger { background: #FEE2E2; color: #991B1B; }
    
    /* Recommendations */
    .recommendation {
      background: #FEF9C3;
      border-left: 4px solid #EAB308;
      border-radius: 0 12px 12px 0;
      padding: 20px;
      margin-bottom: 12px;
    }
    .recommendation-list { list-style: none; }
    .recommendation-item {
      padding: 12px 0;
      border-bottom: 1px solid #FDE68A;
      display: flex;
      align-items: flex-start;
      gap: 12px;
    }
    .recommendation-item:last-child { border-bottom: none; }
    .recommendation-number {
      width: 24px;
      height: 24px;
      background: #EAB308;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 700;
      flex-shrink: 0;
    }
    
    /* Strengths & Gaps */
    .sg-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .sg-column h3 { font-size: 16px; margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }
    .strength-item, .gap-item {
      padding: 12px 16px;
      border-radius: 10px;
      margin-bottom: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .strength-item { background: #ECFDF5; border-left: 4px solid #10B981; }
    .gap-item { background: #FEF2F2; border-left: 4px solid #EF4444; }
    .sg-name { font-weight: 500; }
    .sg-score { font-weight: 700; font-size: 18px; }
    
    /* Footer */
    .footer {
      margin-top: 50px;
      padding-top: 20px;
      border-top: 2px solid #e2e8f0;
      text-align: center;
      color: #64748b;
      font-size: 12px;
    }
    .footer-logo { font-size: 16px; font-weight: 700; color: #3B82F6; margin-bottom: 8px; }
    
    /* Print styles */
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .section { page-break-inside: avoid; }
      .header { -webkit-print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <div class="logo">🚀 DigiAssistant</div>
      <h1>Rapport de Maturité Digitale</h1>
      <p class="subtitle">Évaluation complète de votre transformation numérique</p>
    </div>

    <!-- Company Info -->
    <div class="info-box">
      <div class="info-grid">
        <div class="info-item">
          <span class="info-label">Entreprise</span>
          <span class="info-value">${company.name || "Non renseigné"}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Secteur</span>
          <span class="info-value">${this.getSectorLabel(company.sector)}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Taille</span>
          <span class="info-value">${this.getCompanySizeLabel(
            company.size
          )}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Date du diagnostic</span>
          <span class="info-value">${date}</span>
        </div>
      </div>
    </div>

    <!-- Score Card -->
    <div class="score-card">
      <div class="score-label">SCORE GLOBAL DE MATURITÉ</div>
      <div class="score-value">${globalScore}%</div>
      <div class="maturity-name">${
        maturityProfile?.name || "Profil Intermédiaire"
      }</div>
      <div class="maturity-desc">${
        maturityProfile?.description ||
        "Votre organisation montre une maturité digitale en développement avec un potentiel d'amélioration significatif."
      }</div>
    </div>

    <!-- Dimensions -->
    <div class="section">
      <h2 class="section-title">
        <span class="section-icon">📊</span>
        Scores par Dimension
      </h2>
      ${dimensionScores
        .map(
          (dim) => `
        <div class="dimension">
          <div class="dimension-info">
            <div class="dimension-name">${dim.dimensionName}</div>
            <div class="dimension-bar">
              <div class="dimension-fill" style="width: ${
                dim.percentage
              }%; background: ${getScoreColor(dim.percentage)};"></div>
            </div>
          </div>
          <div class="dimension-score" style="color: ${getScoreColor(
            dim.percentage
          )};">${dim.percentage}%</div>
          <span class="badge ${getScoreBadgeClass(
            dim.percentage
          )}">${getScoreLabel(dim.percentage)}</span>
        </div>
      `
        )
        .join("")}
    </div>

    <!-- Strengths & Gaps -->
    <div class="section">
      <h2 class="section-title">
        <span class="section-icon">💡</span>
        Forces et Axes d'Amélioration
      </h2>
      <div class="sg-grid">
        <div class="sg-column">
          <h3 style="color: #10B981;">✨ Points Forts</h3>
          ${
            strengths.length
              ? strengths
                  .map(
                    (s) => `
            <div class="strength-item">
              <span class="sg-name">${s.dimensionName}</span>
              <span class="sg-score" style="color: #10B981;">${s.percentage}%</span>
            </div>
          `
                  )
                  .join("")
              : '<p style="color: #64748b;">Aucun point fort identifié</p>'
          }
        </div>
        <div class="sg-column">
          <h3 style="color: #EF4444;">⚠️ À Améliorer</h3>
          ${
            gaps.length
              ? gaps
                  .map(
                    (g) => `
            <div class="gap-item">
              <span class="sg-name">${g.dimensionName}</span>
              <span class="sg-score" style="color: #EF4444;">${g.percentage}%</span>
            </div>
          `
                  )
                  .join("")
              : '<p style="color: #64748b;">Aucun axe d\'amélioration majeur</p>'
          }
        </div>
      </div>
    </div>

    <!-- Recommendations -->
    ${
      maturityProfile?.recommendations?.length
        ? `
    <div class="section">
      <h2 class="section-title">
        <span class="section-icon">🎯</span>
        Recommandations Prioritaires
      </h2>
      <div class="recommendation">
        <ul class="recommendation-list">
          ${maturityProfile.recommendations
            .map(
              (rec, i) => `
            <li class="recommendation-item">
              <span class="recommendation-number">${i + 1}</span>
              <span>${rec}</span>
            </li>
          `
            )
            .join("")}
        </ul>
      </div>
    </div>
    `
        : ""
    }

    <!-- Footer -->
    <div class="footer">
      <div class="footer-logo">DigiAssistant</div>
      <p>Ce rapport a été généré automatiquement le ${date}</p>
      <p>© ${new Date().getFullYear()} DigiAssistant - Tous droits réservés</p>
    </div>
  </div>
</body>
</html>`;
  }

  // Convertit HTML en PDF
  async convertHTMLToPDF(html, customOptions = {}) {
    const browser = await this.initBrowser();
    let page;

    try {
      page = await browser.newPage();
      await page.setContent(html, {
        waitUntil: "networkidle0",
        timeout: 30000,
      });

      // Attendre le chargement des fonts
      await page.evaluateHandle("document.fonts.ready");

      const pdfOptions = { ...this.defaultOptions, ...customOptions };
      const pdfBuffer = await page.pdf(pdfOptions);

      return pdfBuffer;
    } finally {
      if (page) await page.close();
    }
  }

  // Labels helpers
  getCompanySizeLabel(size) {
    const labels = {
      micro: "1-10 employés",
      small: "11-50 employés",
      medium: "51-250 employés",
      large: "250+ employés",
    };
    return labels[size] || size || "Non renseigné";
  }

  getSectorLabel(sector) {
    const labels = {
      retail: "Commerce & Distribution",
      services: "Services professionnels",
      manufacturing: "Industrie & Production",
      tech: "Technologie & IT",
      finance: "Finance & Assurance",
      health: "Santé",
      education: "Éducation & Formation",
      other: "Autre secteur",
    };
    return labels[sector] || sector || "Non renseigné";
  }
}

module.exports = new PDFService();
