import React from "react";
import { useAuth } from "@/hooks/useAuth";

interface RoundNotActiveScreenProps {
  onClick: () => void;
  round: number;
  isCompleted?: boolean;
}

const RoundNotActiveScreen: React.FC<RoundNotActiveScreenProps> = ({
  onClick,
  round,
  isCompleted = false,
}) => {
  const { teamData } = useAuth();

  return (
    <div className="min-h-screen bg-[url('https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80')] bg-cover bg-center p-4 flex items-center justify-center">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 via-purple-900/70 to-black/90 backdrop-blur-sm z-0"></div>
      <div className="relative z-10 w-full max-w-md bg-gray-900/90 p-8 rounded-xl shadow-xl border border-purple-600/20">
        <h2 className="text-2xl font-bold text-white mb-4 text-center">
          {isCompleted
            ? "Round Completed"
            : round === 0
            ? "Round Not Available"
            : `Round ${round} Not Active`}
        </h2>
        <p className="text-lg text-gray-200 mb-6 text-center">
          {isCompleted
            ? "You have already completed this round successfully!"
            : round === 0
            ? "Please wait for the event to start."
            : `This round is not currently active. Please check back later.`}
        </p>

        {teamData && (
          <div className="mb-6">
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg mb-4">
              <span className="text-white font-medium">Team:</span>
              <span className="text-white font-bold">
                {teamData.teamName || "Unknown"}
              </span>
            </div>
          </div>
        )}

        <button
          onClick={onClick}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold py-3 px-4 rounded-lg hover:from-blue-600 hover:to-purple-600 transition duration-300 flex items-center justify-center gap-2"
        >
          <span>Back to Dashboard</span>
        </button>
      </div>
    </div>
  );
};

export default RoundNotActiveScreen;
