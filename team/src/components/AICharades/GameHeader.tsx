"use client";

import React from "react";
import { Brain, Star, Timer } from "lucide-react";

interface GameHeaderProps {
  teamName?: string;
  score: number;
  timeLeft: number;
}

const GameHeader: React.FC<GameHeaderProps> = ({
  teamName,
  score,
  timeLeft,
}) => {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="relative z-10 max-w-4xl mx-auto mb-6">
      <div className="bg-black/60 backdrop-blur-md border-2 border-cyan-500/30 rounded-lg p-4 flex items-center justify-between shadow-[0_0_20px_rgba(6,182,212,0.3)]">
        <div className="flex items-center gap-2">
          <div className="bg-cyan-900/50 p-2 rounded-full">
            <Brain className="h-6 w-6 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              AI Charades
            </h1>
            {teamName && (
              <div className="text-sm text-cyan-300">Team: {teamName}</div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-black/70 px-3 py-1 rounded-full border border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.2)]">
            <Star className="h-5 w-5 text-yellow-400" />
            <span className="font-mono text-lg font-semibold text-white">
              {score}
            </span>
          </div>
          <div className="flex items-center gap-2 bg-black/70 px-3 py-1 rounded-full border border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.2)]">
            <Timer className="h-5 w-5 text-red-400" />
            <span className="font-mono text-lg font-semibold text-white">
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameHeader;
