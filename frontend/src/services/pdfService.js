/**
 * PDFExportService - Service d'export PDF côté client
 * Utilise jsPDF pour générer des rapports PDF dans le navigateur
 * Compatible avec le système d'export et le Dashboard
 */

import jsPDF from "jspdf";
import "jspdf-autotable";

// ============================================
// CONSTANTES & CONFIGURATION
// ============================================
const COLORS = {
  primary: [59, 130, 246], // blue-500
  primaryDark: [37, 99, 235], // blue-600
  success: [16, 185, 129], // green-500
  warning: [245, 158, 11], // amber-500
  danger: [239, 68, 68], // red-500
  gray: [107, 114, 128], // gray-500
  grayLight: [243, 244, 246], // gray-100
  grayDark: [31, 41, 55], // gray-800
  white: [255, 255, 255],
};

const MATURITY_LEVELS = {
  beginner: { label: "Débutant", color: COLORS.danger, icon: "🌱" },
  emerging: { label: "Émergent", color: COLORS.warning, icon: "🌿" },
  intermediate: { label: "Intermédiaire", color: COLORS.primary, icon: "🌳" },
  advanced: { label: "Avancé", color: COLORS.success, icon: "🚀" },
};

const COMPANY_SIZES = {
  micro: "1-10 employés",
  small: "11-50 employés",
  medium: "51-250 employés",
  large: "250+ employés",
};

const SECTORS = {
  retail: "Commerce & Distribution",
  services: "Services professionnels",
  manufacturing: "Industrie & Production",
  tech: "Technologie & IT",
  finance: "Finance & Assurance",
  health: "Santé",
  education: "Éducation & Formation",
  other: "Autre secteur",
};

// ============================================
// HELPERS
// ============================================
const getScoreLevel = (score) => {
  if (score >= 76) return { label: "Excellent", color: COLORS.success };
  if (score >= 51) return { label: "Bon", color: COLORS.primary };
  if (score >= 26) return { label: "Moyen", color: COLORS.warning };
  return { label: "Faible", color: COLORS.danger };
};

const formatDate = (date) => {
  return new Date(date || Date.now()).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

// ============================================
// PDF GENERATOR CLASS
// ============================================
class PDFGenerator {
  constructor() {
    this.doc = null;
    this.pageWidth = 210;
    this.pageHeight = 297;
    this.margin = 20;
    this.contentWidth = this.pageWidth - this.margin * 2;
    this.yPos = 0;
  }

  // Initialise un nouveau document
  init() {
    this.doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });
    this.yPos = this.margin;
    return this;
  }

  // Vérifie si on doit ajouter une nouvelle page
  checkPageBreak(neededSpace = 30) {
    if (this.yPos + neededSpace > this.pageHeight - 30) {
      this.doc.addPage();
      this.yPos = this.margin;
      return true;
    }
    return false;
  }

  // Ajoute le header avec gradient
  addHeader(title, subtitle) {
    // Background gradient (simulé avec rectangles)
    this.doc.setFillColor(...COLORS.primary);
    this.doc.rect(0, 0, this.pageWidth, 50, "F");

    // Accent bar
    this.doc.setFillColor(...COLORS.primaryDark);
    this.doc.rect(0, 45, this.pageWidth, 5, "F");

    // Logo & Title
    this.doc.setTextColor(...COLORS.white);
    this.doc.setFontSize(12);
    this.doc.setFont("helvetica", "bold");
    this.doc.text("🚀 DigiAssistant", this.margin, 18);

    this.doc.setFontSize(22);
    this.doc.text(title, this.pageWidth / 2, 30, { align: "center" });

    this.doc.setFontSize(11);
    this.doc.setFont("helvetica", "normal");
    this.doc.text(subtitle, this.pageWidth / 2, 40, { align: "center" });

    this.yPos = 65;
    return this;
  }

  // Ajoute les infos de l'entreprise
  addCompanyInfo(companyInfo) {
    this.doc.setFillColor(...COLORS.grayLight);
    this.doc.roundedRect(
      this.margin,
      this.yPos,
      this.contentWidth,
      30,
      3,
      3,
      "F"
    );

    this.doc.setTextColor(...COLORS.gray);
    this.doc.setFontSize(9);
    this.doc.setFont("helvetica", "bold");

    const col1X = this.margin + 5;
    const col2X = this.margin + this.contentWidth / 2;
    const rowHeight = 12;

    // Row 1
    this.doc.text("ENTREPRISE", col1X, this.yPos + 8);
    this.doc.text("SECTEUR", col2X, this.yPos + 8);

    this.doc.setTextColor(...COLORS.grayDark);
    this.doc.setFontSize(11);
    this.doc.setFont("helvetica", "normal");
    this.doc.text(companyInfo?.name || "Non renseigné", col1X, this.yPos + 14);
    this.doc.text(
      SECTORS[companyInfo?.sector] || companyInfo?.sector || "Non renseigné",
      col2X,
      this.yPos + 14
    );

    // Row 2
    this.doc.setTextColor(...COLORS.gray);
    this.doc.setFontSize(9);
    this.doc.setFont("helvetica", "bold");
    this.doc.text("TAILLE", col1X, this.yPos + 22);
    this.doc.text("DATE", col2X, this.yPos + 22);

    this.doc.setTextColor(...COLORS.grayDark);
    this.doc.setFontSize(11);
    this.doc.setFont("helvetica", "normal");
    this.doc.text(
      COMPANY_SIZES[companyInfo?.size] || companyInfo?.size || "Non renseigné",
      col1X,
      this.yPos + 28
    );
    this.doc.text(formatDate(), col2X, this.yPos + 28);

    this.yPos += 40;
    return this;
  }

  // Ajoute la carte de score global
  addScoreCard(globalScore, maturityLevel) {
    const maturity =
      MATURITY_LEVELS[maturityLevel] || MATURITY_LEVELS.intermediate;
    const scoreLevel = getScoreLevel(globalScore);

    // Card background
    this.doc.setFillColor(...maturity.color, 0.1);
    this.doc.setDrawColor(...maturity.color);
    this.doc.setLineWidth(0.5);
    this.doc.roundedRect(
      this.margin,
      this.yPos,
      this.contentWidth,
      45,
      4,
      4,
      "FD"
    );

    // Score
    this.doc.setTextColor(...COLORS.gray);
    this.doc.setFontSize(10);
    this.doc.text(
      "SCORE GLOBAL DE MATURITÉ DIGITALE",
      this.pageWidth / 2,
      this.yPos + 10,
      { align: "center" }
    );

    this.doc.setTextColor(...maturity.color);
    this.doc.setFontSize(36);
    this.doc.setFont("helvetica", "bold");
    this.doc.text(`${globalScore}%`, this.pageWidth / 2, this.yPos + 28, {
      align: "center",
    });

    // Maturity level badge
    this.doc.setFontSize(14);
    this.doc.text(
      `${maturity.icon} ${maturity.label}`,
      this.pageWidth / 2,
      this.yPos + 40,
      { align: "center" }
    );

    this.yPos += 55;
    return this;
  }

  // Ajoute un titre de section
  addSectionTitle(icon, title) {
    this.checkPageBreak(20);

    this.doc.setFillColor(...COLORS.primary);
    this.doc.roundedRect(this.margin, this.yPos, 8, 8, 2, 2, "F");

    this.doc.setTextColor(...COLORS.white);
    this.doc.setFontSize(10);
    this.doc.text(icon, this.margin + 4, this.yPos + 6, { align: "center" });

    this.doc.setTextColor(...COLORS.grayDark);
    this.doc.setFontSize(14);
    this.doc.setFont("helvetica", "bold");
    this.doc.text(title, this.margin + 12, this.yPos + 6);

    // Underline
    this.doc.setDrawColor(...COLORS.primary);
    this.doc.setLineWidth(0.5);
    this.doc.line(
      this.margin,
      this.yPos + 10,
      this.margin + this.contentWidth,
      this.yPos + 10
    );

    this.yPos += 18;
    return this;
  }

  // Ajoute le tableau des dimensions
  addDimensionsTable(dimensions) {
    this.checkPageBreak(60);

    const tableData = dimensions.map((dim) => {
      const level = getScoreLevel(dim.percentage);
      return [dim.dimensionName, `${dim.percentage}%`, level.label];
    });

    this.doc.autoTable({
      startY: this.yPos,
      head: [["Dimension", "Score", "Niveau"]],
      body: tableData,
      theme: "grid",
      headStyles: {
        fillColor: COLORS.primary,
        textColor: COLORS.white,
        fontStyle: "bold",
        fontSize: 10,
        halign: "left",
      },
      bodyStyles: {
        textColor: COLORS.grayDark,
        fontSize: 10,
      },
      alternateRowStyles: {
        fillColor: COLORS.grayLight,
      },
      columnStyles: {
        0: { cellWidth: 90 },
        1: { cellWidth: 30, halign: "center", fontStyle: "bold" },
        2: { cellWidth: 50, halign: "center" },
      },
      styles: {
        cellPadding: 4,
        lineColor: [229, 231, 235],
        lineWidth: 0.1,
      },
      margin: { left: this.margin, right: this.margin },
    });

    this.yPos = this.doc.lastAutoTable.finalY + 10;
    return this;
  }

  // Ajoute les barres de progression des dimensions
  addDimensionBars(dimensions) {
    dimensions.forEach((dim, index) => {
      this.checkPageBreak(15);

      const level = getScoreLevel(dim.percentage);
      const barWidth = (this.contentWidth - 70) * (dim.percentage / 100);

      // Label
      this.doc.setTextColor(...COLORS.grayDark);
      this.doc.setFontSize(10);
      this.doc.setFont("helvetica", "normal");
      this.doc.text(dim.dimensionName, this.margin, this.yPos + 4);

      // Background bar
      this.doc.setFillColor(229, 231, 235);
      this.doc.roundedRect(
        this.margin,
        this.yPos + 7,
        this.contentWidth - 70,
        4,
        2,
        2,
        "F"
      );

      // Progress bar
      this.doc.setFillColor(...level.color);
      this.doc.roundedRect(this.margin, this.yPos + 7, barWidth, 4, 2, 2, "F");

      // Score
      this.doc.setTextColor(...level.color);
      this.doc.setFont("helvetica", "bold");
      this.doc.text(
        `${dim.percentage}%`,
        this.margin + this.contentWidth - 15,
        this.yPos + 4,
        { align: "right" }
      );

      this.yPos += 14;
    });

    this.yPos += 5;
    return this;
  }

  // Ajoute les forces et faiblesses
  addStrengthsAndGaps(strengths, gaps) {
    this.checkPageBreak(40);

    const colWidth = (this.contentWidth - 10) / 2;

    // Strengths column
    this.doc.setTextColor(...COLORS.success);
    this.doc.setFontSize(12);
    this.doc.setFont("helvetica", "bold");
    this.doc.text("✨ Points Forts", this.margin, this.yPos);

    let strengthY = this.yPos + 8;
    if (strengths && strengths.length > 0) {
      strengths.slice(0, 4).forEach((s, i) => {
        this.doc.setFillColor(236, 253, 245);
        this.doc.roundedRect(this.margin, strengthY, colWidth, 10, 2, 2, "F");

        this.doc.setTextColor(...COLORS.grayDark);
        this.doc.setFontSize(9);
        this.doc.setFont("helvetica", "normal");
        this.doc.text(s.dimensionName || s, this.margin + 3, strengthY + 6);

        if (s.percentage) {
          this.doc.setTextColor(...COLORS.success);
          this.doc.setFont("helvetica", "bold");
          this.doc.text(
            `${s.percentage}%`,
            this.margin + colWidth - 3,
            strengthY + 6,
            { align: "right" }
          );
        }

        strengthY += 12;
      });
    } else {
      this.doc.setTextColor(...COLORS.gray);
      this.doc.setFontSize(9);
      this.doc.text(
        "Aucun point fort identifié",
        this.margin + 3,
        strengthY + 6
      );
    }

    // Gaps column
    const gapX = this.margin + colWidth + 10;
    this.doc.setTextColor(...COLORS.danger);
    this.doc.setFontSize(12);
    this.doc.setFont("helvetica", "bold");
    this.doc.text("⚠️ À Améliorer", gapX, this.yPos);

    let gapY = this.yPos + 8;
    if (gaps && gaps.length > 0) {
      gaps.slice(0, 4).forEach((g, i) => {
        this.doc.setFillColor(254, 242, 242);
        this.doc.roundedRect(gapX, gapY, colWidth, 10, 2, 2, "F");

        this.doc.setTextColor(...COLORS.grayDark);
        this.doc.setFontSize(9);
        this.doc.setFont("helvetica", "normal");
        this.doc.text(g.dimensionName || g, gapX + 3, gapY + 6);

        if (g.percentage) {
          this.doc.setTextColor(...COLORS.danger);
          this.doc.setFont("helvetica", "bold");
          this.doc.text(`${g.percentage}%`, gapX + colWidth - 3, gapY + 6, {
            align: "right",
          });
        }

        gapY += 12;
      });
    } else {
      this.doc.setTextColor(...COLORS.gray);
      this.doc.setFontSize(9);
      this.doc.text("Aucun axe d'amélioration", gapX + 3, gapY + 6);
    }

    this.yPos = Math.max(strengthY, gapY) + 10;
    return this;
  }

  // Ajoute les recommandations
  addRecommendations(recommendations) {
    if (!recommendations || recommendations.length === 0) return this;

    this.checkPageBreak(50);
    this.addSectionTitle("🎯", "Recommandations Prioritaires");

    this.doc.setFillColor(254, 249, 195);
    this.doc.setDrawColor(234, 179, 8);
    this.doc.setLineWidth(0.5);

    const boxHeight = 8 + recommendations.length * 10;
    this.doc.roundedRect(
      this.margin,
      this.yPos,
      this.contentWidth,
      boxHeight,
      3,
      3,
      "FD"
    );

    let recY = this.yPos + 8;
    recommendations.forEach((rec, index) => {
      this.checkPageBreak(12);

      // Number badge
      this.doc.setFillColor(234, 179, 8);
      this.doc.circle(this.margin + 6, recY - 1, 3, "F");
      this.doc.setTextColor(...COLORS.white);
      this.doc.setFontSize(8);
      this.doc.setFont("helvetica", "bold");
      this.doc.text(`${index + 1}`, this.margin + 6, recY + 0.5, {
        align: "center",
      });

      // Text
      this.doc.setTextColor(...COLORS.grayDark);
      this.doc.setFontSize(10);
      this.doc.setFont("helvetica", "normal");
      this.doc.text(rec, this.margin + 12, recY);

      recY += 10;
    });

    this.yPos = recY + 5;
    return this;
  }

  // Ajoute le footer sur toutes les pages
  addFooter() {
    const pageCount = this.doc.internal.getNumberOfPages();

    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);

      // Footer line
      this.doc.setDrawColor(...COLORS.grayLight);
      this.doc.setLineWidth(0.3);
      this.doc.line(
        this.margin,
        this.pageHeight - 15,
        this.pageWidth - this.margin,
        this.pageHeight - 15
      );

      // Footer text
      this.doc.setTextColor(...COLORS.gray);
      this.doc.setFontSize(8);
      this.doc.setFont("helvetica", "normal");

      this.doc.text(
        `Page ${i} sur ${pageCount}`,
        this.margin,
        this.pageHeight - 10
      );

      this.doc.text(
        `DigiAssistant © ${new Date().getFullYear()}`,
        this.pageWidth / 2,
        this.pageHeight - 10,
        { align: "center" }
      );

      this.doc.text(
        formatDate(),
        this.pageWidth - this.margin,
        this.pageHeight - 10,
        { align: "right" }
      );
    }

    return this;
  }

  // Retourne le document
  getDoc() {
    return this.doc;
  }
}

// ============================================
// EXPORT FUNCTIONS
// ============================================

/**
 * Génère le rapport PDF complet
 */
export const generatePDFReport = (results, companyInfo) => {
  const generator = new PDFGenerator().init();

  generator
    .addHeader(
      "Rapport de Maturité Digitale",
      "Évaluation complète de votre transformation numérique"
    )
    .addCompanyInfo(companyInfo)
    .addScoreCard(
      results.overallScore || results.globalScore,
      results.maturityLevel
    )
    .addSectionTitle("📊", "Scores par Dimension")
    .addDimensionsTable(results.dimensionScores)
    .addDimensionBars(results.dimensionScores)
    .addSectionTitle("💡", "Forces et Axes d'Amélioration")
    .addStrengthsAndGaps(results.strengths, results.gaps)
    .addRecommendations(
      results.recommendations || results.maturityProfile?.recommendations
    )
    .addFooter();

  return generator.getDoc();
};

/**
 * Télécharge le PDF
 */
export const downloadPDF = (results, companyInfo, filename = null) => {
  const doc = generatePDFReport(results, companyInfo);
  const companyName =
    companyInfo?.name?.replace(/[^a-zA-Z0-9]/g, "_") || "diagnostic";
  const date = new Date().toISOString().split("T")[0];
  const defaultFilename = `DigiAssistant_Rapport_${companyName}_${date}.pdf`;

  doc.save(filename || defaultFilename);
};

/**
 * Retourne le PDF en blob pour preview ou upload
 */
export const getPDFBlob = (results, companyInfo) => {
  const doc = generatePDFReport(results, companyInfo);
  return doc.output("blob");
};

/**
 * Retourne le PDF en base64 pour email
 */
export const getPDFBase64 = (results, companyInfo) => {
  const doc = generatePDFReport(results, companyInfo);
  return doc.output("datauristring");
};

/**
 * Ouvre le PDF dans un nouvel onglet pour aperçu
 */
export const previewPDF = (results, companyInfo) => {
  const doc = generatePDFReport(results, companyInfo);
  const blob = doc.output("blob");
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank");
};

/**
 * Imprime le PDF directement
 */
export const printPDF = (results, companyInfo) => {
  const doc = generatePDFReport(results, companyInfo);
  doc.autoPrint();
  doc.output("dataurlnewwindow");
};

// Export par défaut
export default {
  generatePDFReport,
  downloadPDF,
  getPDFBlob,
  getPDFBase64,
  previewPDF,
  printPDF,
};
