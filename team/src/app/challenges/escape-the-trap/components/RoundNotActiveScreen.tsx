import React from "react";
import { AlertTriangle } from "lucide-react";

interface RoundNotActiveScreenProps {
  onClick: () => void;
  round: number;
}

const RoundNotActiveScreen: React.FC<RoundNotActiveScreenProps> = ({
  onClick,
  round,
}) => {
  // Dynamic content based on the round number
  const getRoundName = (roundNum: number) => {
    switch (roundNum) {
      case 0:
        return "Registration";
      case 1:
        return "AI Charades";
      case 2:
        return "Crack the Password";
      case 3:
        return "Escape the Trap";
      default:
        return `Round ${roundNum}`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-indigo-950 to-black flex items-center justify-center p-4 overflow-hidden">
      {/* Animated background effects */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated glowing particles */}
        <div className="absolute top-1/4 left-1/4 w-24 h-24 rounded-full bg-yellow-500/10 blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-1/4 right-1/3 w-32 h-32 rounded-full bg-red-500/10 blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/3 right-1/4 w-40 h-40 rounded-full bg-purple-500/10 blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>

        {/* Grid overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSg3OSwgNzAsIDE1MywgMC4xKSIgc3Ryb2tlLXdpZHRoPSIxIj48L3BhdGg+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIj48L3JlY3Q+PC9zdmc+')] opacity-40"></div>
      </div>

      {/* Card with glow effect */}
      <div className="relative max-w-lg w-full rounded-xl overflow-hidden shadow-[0_0_60px_rgba(234,179,8,0.3)] transition-all duration-500">
        {/* Border glow effect */}

        {/* Inner content */}
        <div className="relative bg-gray-900 rounded-xl p-8 md:p-12 backdrop-blur-md border border-yellow-500/10">
          <div className="flex flex-col items-center text-center space-y-8">
            {/* Alert icon with pulsing animation */}
            <div className="relative">
              <div className="absolute inset-0 bg-yellow-500/20 rounded-full blur-md animate-ping"></div>
              <AlertTriangle className="h-20 w-20 text-yellow-500 relative z-10" />
            </div>

            {/* Title with text gradient */}
            <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">
              ROUND NOT ACTIVE
            </h1>

            {/* Description */}
            <div className="space-y-4 text-gray-300">
              <p className="text-xl">Current active round is {round}.</p>
              <p className="text-lg">
                {getRoundName(3)} challenge is not available at this time.
              </p>
            </div>

            {/* Button with hover effect */}
            <button
              onClick={onClick}
              className="mt-8 px-8 py-4 bg-gradient-to-r from-amber-600 to-yellow-500 rounded-lg text-white font-medium text-lg 
              transform hover:scale-105 transition-all duration-300 hover:shadow-[0_0_20px_rgba(245,158,11,0.5)] relative overflow-hidden group"
            >
              <span className="relative z-10">Return to Dashboard</span>
              <span className="absolute inset-0 bg-gradient-to-r from-amber-500 to-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            </button>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="fixed bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500/30 to-transparent"></div>
      <div className="fixed top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500/30 to-transparent"></div>
    </div>
  );
};

export default RoundNotActiveScreen;
