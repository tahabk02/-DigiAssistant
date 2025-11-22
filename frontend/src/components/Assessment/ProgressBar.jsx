import React from "react";
import { formatDuration } from "../../utils/formatters";

const ProgressBar = ({ progress }) => {
  const percentage = progress?.percentComplete || 0;
  const questionsAnswered = progress?.questionsAnswered || 0;
  const estimatedMinutes =
    progress?.estimatedTimeRemaining?.estimatedMinutes || 0;

  return (
    <div className="bg-white border-b border-gray-200 sticky top-16 z-30">
      <div className="max-w-4xl mx-auto px-4 py-4">
        {/* Progress Info */}
        <div className="flex items-center justify-between mb-2 text-sm">
          <div className="flex items-center space-x-4">
            <span className="font-medium text-gray-700">
              Progression: {percentage}%
            </span>
            <span className="text-gray-500">
              {questionsAnswered} questions répondues
            </span>
          </div>
          {estimatedMinutes > 0 && (
            <span className="text-gray-500">
              ⏱️ Environ {formatDuration(estimatedMinutes)} restant
            </span>
          )}
        </div>

        {/* Progress Bar */}
        <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500 ease-out progress-shimmer"
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Dimension Progress */}
        {progress?.dimensionProgress && (
          <div className="flex items-center gap-2 mt-3">
            {progress.dimensionProgress.map((dim, index) => (
              <div
                key={dim.dimensionId}
                className="flex-1"
                title={`${dim.dimensionName}: ${dim.progress}%`}
              >
                <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      dim.status === "completed"
                        ? "bg-green-500"
                        : dim.status === "in_progress"
                        ? "bg-blue-500"
                        : "bg-gray-300"
                    }`}
                    style={{ width: `${dim.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressBar;
