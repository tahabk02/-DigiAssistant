import React, { useState } from "react";
import {
  Target,
  Users,
  Heart,
  Workflow,
  Cpu,
  Shield,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Card from "../Common/Card";
import {
  getScoreColor,
  getScoreLabel,
  getScoreBgColor,
} from "../../utils/formatters";

const DimensionScores = ({ dimensions }) => {
  const [expandedDimension, setExpandedDimension] = useState(null);

  if (!dimensions || dimensions.length === 0) {
    return null;
  }

  // Get icon for dimension
  const getDimensionIcon = (dimensionId) => {
    const icons = {
      strategy: Target,
      culture: Users,
      customer: Heart,
      process: Workflow,
      technology: Cpu,
      security: Shield,
    };
    const Icon = icons[dimensionId] || Target;
    return <Icon className="w-5 h-5" />;
  };

  // Get color based on score - utilise maintenant getScoreBgColor
  const getBarColor = (score) => {
    return getScoreBgColor(score);
  };

  const toggleExpand = (dimensionId) => {
    setExpandedDimension(
      expandedDimension === dimensionId ? null : dimensionId
    );
  };

  return (
    <Card>
      <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
        <span className="mr-2">📊</span>
        Scores par Dimension
      </h2>

      <div className="space-y-4">
        {dimensions.map((dim) => (
          <div
            key={dim.dimensionId}
            className="border border-gray-200 rounded-lg overflow-hidden"
          >
            {/* Dimension Header */}
            <button
              onClick={() => toggleExpand(dim.dimensionId)}
              className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`p-2 rounded-lg ${getBarColor(
                    dim.percentage
                  )} bg-opacity-10`}
                >
                  <span className={getScoreColor(dim.percentage)}>
                    {getDimensionIcon(dim.dimensionId)}
                  </span>
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900">
                    {dim.dimensionName}
                  </h3>
                  <p className="text-xs text-gray-500">{dim.description}</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {/* Score */}
                <div className="text-right">
                  <p
                    className={`text-2xl font-bold ${getScoreColor(
                      dim.percentage
                    )}`}
                  >
                    {dim.percentage}%
                  </p>
                  <p className="text-xs text-gray-500">
                    {getScoreLabel(dim.percentage)}
                  </p>
                </div>

                {/* Expand Icon */}
                {expandedDimension === dim.dimensionId ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </div>
            </button>

            {/* Progress Bar */}
            <div className="px-4 pb-4">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${getBarColor(
                    dim.percentage
                  )} transition-all duration-500`}
                  style={{ width: `${dim.percentage}%` }}
                />
              </div>
            </div>

            {/* Expanded Pillar Details */}
            {expandedDimension === dim.dimensionId && dim.pillarScores && (
              <div className="px-4 pb-4 pt-2 bg-gray-50 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Détail par pilier
                </h4>
                <div className="space-y-3">
                  {dim.pillarScores.map((pillar) => (
                    <div
                      key={pillar.pillarId}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm text-gray-600 capitalize">
                        {pillar.pillarId.replace(/_/g, " ")}
                      </span>
                      <div className="flex items-center space-x-3">
                        <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${getBarColor(
                              pillar.percentage
                            )} transition-all`}
                            style={{ width: `${pillar.percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-700 w-12 text-right">
                          {pillar.percentage}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex flex-wrap gap-4 justify-center text-xs">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-green-500 mr-2" />
            <span>Excellent (76-100%)</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-blue-500 mr-2" />
            <span>Bon (51-75%)</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-orange-500 mr-2" />
            <span>Moyen (26-50%)</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-red-500 mr-2" />
            <span>Faible (0-25%)</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default DimensionScores;
