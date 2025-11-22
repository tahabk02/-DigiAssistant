import React from "react";
import { TrendingUp, Award, Target, Zap } from "lucide-react";

const MaturityProfile = ({ globalScore, profile }) => {
  if (!profile) return null;

  // Get icon based on profile
  const getProfileIcon = () => {
    switch (profile.id) {
      case "leader":
        return <Award className="w-12 h-12" />;
      case "challenger":
        return <TrendingUp className="w-12 h-12" />;
      case "emergent":
        return <Zap className="w-12 h-12" />;
      default:
        return <Target className="w-12 h-12" />;
    }
  };

  // Score ring calculation
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (globalScore / 100) * circumference;

  return (
    <div
      className="relative rounded-2xl p-8 text-white overflow-hidden"
      style={{ backgroundColor: profile.color }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
      </div>

      <div className="relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-8">
          {/* Score Circle */}
          <div className="relative">
            <svg className="w-40 h-40 transform -rotate-90">
              {/* Background circle */}
              <circle
                cx="80"
                cy="80"
                r="45"
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="10"
                fill="none"
              />
              {/* Progress circle */}
              <circle
                cx="80"
                cy="80"
                r="45"
                stroke="white"
                strokeWidth="10"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold">{globalScore}%</span>
              <span className="text-sm opacity-80">Score Global</span>
            </div>
          </div>

          {/* Profile Info */}
          <div className="flex-1 text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-3 mb-3">
              {getProfileIcon()}
              <h2 className="text-3xl font-bold">{profile.name}</h2>
            </div>
            <p className="text-lg opacity-90 mb-6 max-w-xl">
              {profile.description}
            </p>

            {/* Score Range */}
            <div className="inline-flex items-center bg-white/20 rounded-full px-4 py-2">
              <span className="text-sm">
                Score: {profile.scoreRange?.min || 0}% -{" "}
                {profile.scoreRange?.max || 100}%
              </span>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4 lg:gap-6">
            <div className="bg-white/20 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold">
                {globalScore >= 50 ? "✓" : "—"}
              </p>
              <p className="text-xs opacity-80 mt-1">Vision Digitale</p>
            </div>
            <div className="bg-white/20 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold">
                {globalScore >= 40 ? "✓" : "—"}
              </p>
              <p className="text-xs opacity-80 mt-1">Compétences</p>
            </div>
            <div className="bg-white/20 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold">
                {globalScore >= 60 ? "✓" : "—"}
              </p>
              <p className="text-xs opacity-80 mt-1">Innovation</p>
            </div>
            <div className="bg-white/20 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold">
                {globalScore >= 70 ? "✓" : "—"}
              </p>
              <p className="text-xs opacity-80 mt-1">Excellence</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaturityProfile;
