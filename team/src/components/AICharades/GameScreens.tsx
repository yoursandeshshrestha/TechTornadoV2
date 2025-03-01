"use client";

import React from "react";
import { AlertTriangle, Trophy, ArrowLeft } from "lucide-react";

interface BackToDashboardButtonProps {
  onClick: () => void;
}

interface RoundNotActiveScreenProps {
  onBackToDashboard: () => void;
}

interface ResultsScreenProps {
  score: number;
  onBackToDashboard: () => void;
}

// Loading Screen
export const LoadingScreen: React.FC = () => (
  <div className="min-h-screen bg-[url('https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80')] bg-cover bg-center p-4 flex items-center justify-center">
    <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 via-purple-900/70 to-black/90 backdrop-blur-sm z-0"></div>
    <div className="relative z-10 flex flex-col items-center gap-3">
      <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
      <div className="text-white text-xl font-medium">Loading Game...</div>
    </div>
  </div>
);

// Round Not Active Screen
export const RoundNotActiveScreen: React.FC<RoundNotActiveScreenProps> = ({
  onBackToDashboard,
}) => (
  <div className="min-h-screen bg-[url('https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80')] bg-cover bg-center p-4 flex items-center justify-center">
    <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 via-purple-900/70 to-black/90 backdrop-blur-sm z-0"></div>
    <div className="relative z-10 max-w-md bg-black/60 backdrop-blur-md border-2 border-red-500/30 rounded-lg p-8 flex flex-col items-center text-center shadow-[0_0_20px_rgba(239,68,68,0.3)]">
      <AlertTriangle className="h-16 w-16 text-red-400 mb-6" />
      <h1 className="text-2xl font-bold text-red-400 mb-4">Round Not Active</h1>
      <p className="text-white mb-6">
        Sorry, but Round 1 (AI Charades) is not currently active. Please check
        the schedule and try again during the designated time.
      </p>
      <button
        onClick={onBackToDashboard}
        className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
      >
        Back to Dashboard
      </button>
    </div>
  </div>
);

// Results Screen
export const ResultsScreen: React.FC<ResultsScreenProps> = ({
  score,
  onBackToDashboard,
}) => (
  <div className="min-h-screen  bg-cover bg-center  flex items-center justify-center">
    <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 via-purple-900/70 to-black/90 backdrop-blur-sm z-0"></div>
    <div className="relative z-10 max-w-md bg-black/60 backdrop-blur-md border-2 border-yellow-500/30 rounded-lg p-8 flex flex-col items-center text-center shadow-[0_0_20px_rgba(234,179,8,0.3)]">
      <Trophy className="h-16 w-16 text-yellow-400 mb-6" />
      <h1 className="text-2xl font-bold text-yellow-400 mb-4">
        Round Completed
      </h1>
      <p className="text-white mb-6">
        This round has been completed. Your team scored a total of {score}{" "}
        points.
      </p>
      <p className="text-gray-300 mb-6">
        Keep an eye on the dashboard for upcoming rounds!
      </p>
      <button
        onClick={onBackToDashboard}
        className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
      >
        Back to Dashboard
      </button>
    </div>
  </div>
);

// Back to Dashboard Button
export const BackToDashboardButton: React.FC<BackToDashboardButtonProps> = ({
  onClick,
}) => (
  <div className="relative z-10 max-w-4xl mx-auto flex justify-center">
    <button
      onClick={onClick}
      className="px-5 py-2 rounded-lg text-white bg-black/50 hover:bg-blue-900/30 border-2 border-blue-500/30 transition-all duration-300 flex items-center gap-2"
    >
      <ArrowLeft className="h-4 w-4" />
      Back to Dashboard
    </button>
  </div>
);
