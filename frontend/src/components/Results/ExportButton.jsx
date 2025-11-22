import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Download,
  FileText,
  FileJson,
  ChevronDown,
  Loader2,
  Check,
  AlertCircle,
  Copy,
  FileSpreadsheet,
  Image,
  Mail,
  Printer,
  Eye,
  X,
  FileCheck,
} from "lucide-react";

// ============================================
// PDF GENERATION UTILITY
// ============================================
const generatePDF = (data) => {
  const { globalScore, maturityProfile, dimensions, companyInfo } = data;

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
    .company-info { 
      background: #f9fafb; 
      padding: 20px; 
      border-radius: 12px; 
      margin-bottom: 30px; 
    }
    .company-info h3 { 
      color: #374151; 
      margin-bottom: 15px; 
      font-size: 18px; 
    }
    .info-grid { 
      display: grid; 
      grid-template-columns: 1fr 1fr; 
      gap: 15px; 
      font-size: 14px; 
    }
    .info-item { color: #6b7280; }
    .info-item strong { color: #1f2937; }
    .score-box { 
      text-align: center; 
      padding: 40px; 
      background: linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%); 
      border-radius: 16px; 
      margin: 30px 0; 
    }
    .score-box p:first-child { 
      color: #6b7280; 
      font-size: 14px; 
      margin-bottom: 10px; 
    }
    .score-value { 
      font-size: 72px; 
      font-weight: bold; 
      color: ${getScoreColor(globalScore)}; 
      margin: 10px 0; 
    }
    .score-label { 
      font-size: 24px; 
      font-weight: 600; 
      color: #374151; 
      margin-top: 10px; 
    }
    .dimensions { margin: 30px 0; }
    .dimensions h3 { 
      font-size: 20px; 
      color: #1f2937; 
      margin-bottom: 20px; 
      display: flex; 
      align-items: center; 
      gap: 10px; 
    }
    .dimension-bar { 
      width: 40px; 
      height: 4px; 
      background: #3B82F6; 
      border-radius: 2px; 
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
      font-size: 15px; 
    }
    .dimension-right { 
      display: flex; 
      align-items: center; 
      gap: 20px; 
    }
    .progress-bar { 
      width: 150px; 
      height: 8px; 
      background: #e5e7eb; 
      border-radius: 4px; 
      overflow: hidden; 
    }
    .progress-fill { 
      height: 100%; 
      border-radius: 4px; 
      transition: width 0.3s ease; 
    }
    .dimension-score { 
      font-weight: bold; 
      font-size: 16px; 
      width: 50px; 
      text-align: right; 
    }
    .footer { 
      text-align: center; 
      padding-top: 30px; 
      border-top: 1px solid #e5e7eb; 
      color: #9ca3af; 
      font-size: 12px; 
      margin-top: 40px; 
    }
    @media print {
      body { padding: 20px; }
      .score-box { break-inside: avoid; }
      .dimensions { break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Rapport de Maturité Digitale</h1>
    <p>DigiAssistant - Diagnostic Digital</p>
    <p style="margin-top: 10px;">${new Date().toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })}</p>
  </div>

  <div class="company-info">
    <h3>📋 Informations Entreprise</h3>
    <div class="info-grid">
      <div class="info-item">Entreprise: <strong>${
        companyInfo?.name || "Non renseigné"
      }</strong></div>
      <div class="info-item">Secteur: <strong>${
        companyInfo?.sector || "Non renseigné"
      }</strong></div>
      <div class="info-item">Taille: <strong>${
        companyInfo?.size || "Non renseigné"
      }</strong></div>
      <div class="info-item">Date: <strong>${new Date().toLocaleDateString(
        "fr-FR"
      )}</strong></div>
    </div>
  </div>

  <div class="score-box">
    <p>Score Global de Maturité</p>
    <div class="score-value">${globalScore}%</div>
    <div class="score-label">${maturityProfile?.name || "Intermédiaire"}</div>
  </div>

  <div class="dimensions">
    <h3><span class="dimension-bar"></span> Scores par Dimension</h3>
    ${dimensions
      ?.map(
        (dim) => `
      <div class="dimension-item">
        <span class="dimension-name">${dim.name}</span>
        <div class="dimension-right">
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${
              dim.score
            }%; background: ${getScoreColor(dim.score)};"></div>
          </div>
          <span class="dimension-score" style="color: ${getScoreColor(
            dim.score
          )};">${dim.score}%</span>
        </div>
      </div>
    `
      )
      .join("")}
  </div>

  <div class="footer">
    <p>© ${new Date().getFullYear()} DigiAssistant - Tous droits réservés</p>
    <p style="margin-top: 5px;">Ce rapport a été généré automatiquement le ${new Date().toLocaleString(
      "fr-FR"
    )}</p>
  </div>
</body>
</html>
  `;

  // Create blob and download
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `rapport-maturite-digitale-${Date.now()}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// ============================================
// JSON EXPORT
// ============================================
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

// ============================================
// CSV EXPORT
// ============================================
const exportCSV = (data) => {
  const { dimensions, globalScore, companyInfo } = data;

  let csv = "Dimension,Score,Statut\n";
  csv += `Score Global,${globalScore},${
    globalScore >= 70 ? "Excellent" : globalScore >= 50 ? "Bon" : "À améliorer"
  }\n`;

  dimensions?.forEach((dim) => {
    const status =
      dim.score >= 70 ? "Excellent" : dim.score >= 50 ? "Bon" : "À améliorer";
    csv += `"${dim.name}",${dim.score},${status}\n`;
  });

  csv += `\nEntreprise,${companyInfo?.name || "N/A"}\n`;
  csv += `Secteur,${companyInfo?.sector || "N/A"}\n`;
  csv += `Date,${new Date().toLocaleDateString("fr-FR")}\n`;

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
// EXPORT BUTTON COMPONENT
// ============================================
const ExportButton = ({
  data,
  assessmentId,
  disabled = false,
  size = "md",
  variant = "gradient",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [exportType, setExportType] = useState(null);
  const [exportStatus, setExportStatus] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);
  const [progress, setProgress] = useState(0);
  const containerRef = useRef(null);
  const buttonRef = useRef(null);

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm gap-1.5",
    md: "px-4 py-2.5 text-base gap-2",
    lg: "px-6 py-3 text-lg gap-2.5",
  };

  const variantClasses = {
    gradient:
      "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl",
    solid: "bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg",
    outline: "border-2 border-blue-600 text-blue-600 hover:bg-blue-50",
  };

  const iconSizes = { sm: "w-4 h-4", md: "w-5 h-5", lg: "w-6 h-6" };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target))
        setIsOpen(false);
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    if (exportStatus) {
      const timer = setTimeout(() => {
        setExportStatus(null);
        setStatusMessage("");
        setProgress(0);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [exportStatus]);

  useEffect(() => {
    if (exportType) {
      setProgress(0);
      const interval = setInterval(() => {
        setProgress((p) => Math.min(p + Math.random() * 20, 90));
      }, 150);
      return () => clearInterval(interval);
    }
  }, [exportType]);

  const handleExport = useCallback(
    async (type, exportFn, successMsg) => {
      setExportType(type);
      setIsOpen(false);
      setExportStatus(null);

      try {
        await new Promise((resolve) => setTimeout(resolve, 500));
        exportFn(data);
        setProgress(100);
        await new Promise((resolve) => setTimeout(resolve, 200));
        setExportStatus("success");
        setStatusMessage(successMsg);
      } catch (error) {
        console.error(`Export ${type} error:`, error);
        setExportStatus("error");
        setStatusMessage(error.message || "Erreur lors de l'export");
      } finally {
        setExportType(null);
      }
    },
    [data]
  );

  const handleCopyLink = async () => {
    try {
      const shareUrl = `${window.location.origin}/results/${assessmentId}`;
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setExportStatus("success");
      setStatusMessage("Lien copié !");
      setIsOpen(false);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (error) {
      setExportStatus("error");
      setStatusMessage("Impossible de copier le lien");
    }
  };

  const exportOptions = [
    {
      id: "pdf",
      label: "Rapport HTML",
      desc: "Document complet formaté",
      icon: FileText,
      color: "red",
      onClick: () => handleExport("pdf", generatePDF, "PDF téléchargé !"),
    },
    {
      id: "json",
      label: "Données JSON",
      desc: "Format technique",
      icon: FileJson,
      color: "emerald",
      onClick: () => handleExport("json", exportJSON, "JSON exporté !"),
    },
    {
      id: "csv",
      label: "Export CSV",
      desc: "Compatible Excel",
      icon: FileSpreadsheet,
      color: "green",
      onClick: () => handleExport("csv", exportCSV, "CSV téléchargé !"),
    },
    {
      id: "print",
      label: "Imprimer",
      desc: "Impression directe",
      icon: Printer,
      color: "gray",
      onClick: () => {
        setIsOpen(false);
        window.print();
      },
    },
  ];

  const colorMap = {
    red: "bg-red-100 text-red-600 group-hover:bg-red-200",
    emerald: "bg-emerald-100 text-emerald-600 group-hover:bg-emerald-200",
    green: "bg-green-100 text-green-600 group-hover:bg-green-200",
    gray: "bg-gray-100 text-gray-600 group-hover:bg-gray-200",
  };

  const isDisabled = disabled || exportType !== null;

  return (
    <div className="relative inline-block" ref={containerRef}>
      <button
        ref={buttonRef}
        onClick={() => !isDisabled && setIsOpen(!isOpen)}
        disabled={isDisabled}
        className={`
          flex items-center rounded-xl font-semibold transition-all duration-300
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
          ${sizeClasses[size]}
          ${
            isDisabled
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : exportStatus === "success"
              ? "bg-green-500 text-white"
              : exportStatus === "error"
              ? "bg-red-500 text-white"
              : variantClasses[variant]
          }
          ${!isDisabled && "hover:-translate-y-0.5"}
        `}
      >
        {exportType ? (
          <>
            <div className="relative">
              <Loader2 className={`${iconSizes[size]} animate-spin`} />
              <span className="absolute -top-1 -right-1 text-xs font-bold">
                {Math.round(progress)}%
              </span>
            </div>
            <span>Export...</span>
          </>
        ) : exportStatus === "success" ? (
          <>
            <Check className={iconSizes[size]} />
            <span>Terminé !</span>
          </>
        ) : exportStatus === "error" ? (
          <>
            <AlertCircle className={iconSizes[size]} />
            <span>Erreur</span>
          </>
        ) : (
          <>
            <Download className={iconSizes[size]} />
            <span>Exporter</span>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </>
        )}
      </button>

      {isOpen && !isDisabled && (
        <div
          className="absolute top-full right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden"
          style={{ animation: "dropIn 0.2s ease-out" }}
        >
          <div className="px-5 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold">Options d'export</p>
                  <p className="text-xs text-blue-100">
                    {exportOptions.length} formats disponibles
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="py-2 max-h-72 overflow-y-auto">
            {exportOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={opt.onClick}
                disabled={exportType === opt.id}
                className="w-full flex items-center px-5 py-3 hover:bg-gray-50 transition-all text-left focus:outline-none focus:bg-blue-50 disabled:opacity-50 group"
              >
                <div
                  className={`p-2.5 rounded-xl mr-4 transition-all group-hover:scale-110 ${
                    colorMap[opt.color]
                  }`}
                >
                  <opt.icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {opt.label}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{opt.desc}</p>
                </div>
                {exportType === opt.id ? (
                  <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-300 -rotate-90 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                )}
              </button>
            ))}
          </div>

          {assessmentId && (
            <>
              <div className="border-t border-gray-100" />
              <div className="p-2">
                <button
                  onClick={handleCopyLink}
                  className="w-full flex items-center px-5 py-3 hover:bg-blue-50 rounded-xl transition-all text-left group"
                >
                  <div
                    className={`p-2.5 rounded-xl mr-4 transition-all group-hover:scale-110 ${
                      copiedLink
                        ? "bg-green-100"
                        : "bg-gray-100 group-hover:bg-blue-100"
                    }`}
                  >
                    {copiedLink ? (
                      <Check className="w-5 h-5 text-green-600" />
                    ) : (
                      <Copy className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 group-hover:text-blue-600">
                      {copiedLink ? "Copié !" : "Copier le lien"}
                    </p>
                    <p className="text-xs text-gray-500">
                      Partager les résultats
                    </p>
                  </div>
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {exportStatus && !isOpen && (
        <div
          className={`absolute top-full left-1/2 -translate-x-1/2 mt-3 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap shadow-lg flex items-center gap-2
            ${
              exportStatus === "success"
                ? "bg-green-500 text-white"
                : "bg-red-500 text-white"
            }`}
          style={{ animation: "slideUp 0.3s ease-out" }}
        >
          {exportStatus === "success" ? (
            <Check className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          {statusMessage}
        </div>
      )}

      <style>{`
        @keyframes dropIn { from { opacity: 0; transform: scale(0.95) translateY(-8px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        @keyframes slideUp { from { opacity: 0; transform: translate(-50%, 10px); } to { opacity: 1; transform: translate(-50%, 0); } }
      `}</style>
    </div>
  );
};

// ============================================
// DEMO APPLICATION
// ============================================
export default function App() {
  const sampleData = {
    globalScore: 72,
    maturityProfile: { name: "Intermédiaire Avancé", color: "#3B82F6" },
    companyInfo: {
      name: "TechCorp SARL",
      sector: "Technologie",
      size: "51-250 employés",
    },
    dimensions: [
      { name: "Innovation & R&D", score: 85 },
      { name: "Culture Digitale", score: 78 },
      { name: "Expérience Client", score: 72 },
      { name: "Data & Analytics", score: 65 },
      { name: "Automatisation", score: 58 },
      { name: "Cybersécurité", score: 52 },
    ],
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 flex flex-col items-center justify-center p-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          🚀 Système d'Export Fonctionnel
        </h1>
        <p className="text-gray-600 text-lg">
          Téléchargez vos rapports en HTML, JSON ou CSV
        </p>
      </div>

      <div className="flex flex-col items-center gap-8">
        <ExportButton
          data={sampleData}
          assessmentId="demo-assessment-123"
          size="lg"
          variant="gradient"
        />

        <div className="flex gap-4">
          <ExportButton data={sampleData} size="md" variant="solid" />
          <ExportButton data={sampleData} size="md" variant="outline" />
        </div>

        <div className="mt-8 p-6 bg-white rounded-2xl shadow-lg max-w-md">
          <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-blue-600" />
            Fonctionnalités
          </h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              Export HTML formaté (comme PDF)
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              Export JSON et CSV
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              Barre de progression animée
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              Copie de lien de partage
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              Impression directe
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
