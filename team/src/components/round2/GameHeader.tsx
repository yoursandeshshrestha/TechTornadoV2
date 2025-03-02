// components/round2/GameHeader.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Clock } from "lucide-react";
import { getGameState, calculateRemainingTime } from "@/utils/apiService";

interface GameHeaderProps {
  title: string;
  currentQuestionNumber: number;
  totalQuestions: number;
  showBackButton?: boolean;
  backButtonUrl?: string;
}

const GameHeader: React.FC<GameHeaderProps> = ({
  title,
  currentQuestionNumber,
  totalQuestions,
  showBackButton = true,
  backButtonUrl = "/challenges/crack-the-password",
}) => {
  const router = useRouter();
  const [remainingTime, setRemainingTime] = useState<number | null>(null);
  const [isRoundActive, setIsRoundActive] = useState(true);

  useEffect(() => {
    const fetchGameState = async () => {
      const gameState = await getGameState();

      if (gameState) {
        if (gameState.currentRound !== 2) {
          setIsRoundActive(false);
          return;
        }

        const timeRemaining = calculateRemainingTime(gameState.roundEndTime);
        setRemainingTime(timeRemaining);

        // Set up interval to update the remaining time
        const interval = setInterval(() => {
          setRemainingTime((prev) => {
            if (prev === null || prev <= 1000) {
              clearInterval(interval);
              // Refresh game state when time is up
              fetchGameState();
              return 0;
            }
            return prev - 1000;
          });
        }, 1000);

        return () => clearInterval(interval);
      }
    };

    fetchGameState();

    // Refresh game state every minute
    const refreshInterval = setInterval(fetchGameState, 60000);
    return () => clearInterval(refreshInterval);
  }, []);

  // Format remaining time as MM:SS
  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  if (!isRoundActive) {
    return (
      <div className="bg-red-900/80 text-white p-4 rounded-lg mb-6 text-center">
        <h2 className="text-xl font-bold">Round 2 is not currently active</h2>
        <p className="mt-2">Please check back when the round is active.</p>
        <Link
          href="/challenges"
          className="mt-4 inline-block bg-white text-red-900 px-4 py-2 rounded-lg font-medium"
        >
          Return to Challenges
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-900/80 border border-blue-500/30 rounded-lg p-4 mb-6 flex flex-col md:flex-row items-center justify-between">
      <div className="flex items-center gap-2 mb-2 md:mb-0">
        {showBackButton && (
          <button
            onClick={() => router.push(backButtonUrl)}
            className="flex items-center gap-2 bg-gray-800/80 px-3 py-1 rounded-full text-blue-400 hover:bg-gray-700/80 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="font-mono">Back</span>
          </button>
        )}
        <span className="font-mono text-blue-400 text-xl font-bold ml-2">
          {title} {currentQuestionNumber}/{totalQuestions}
        </span>
      </div>

      <div className="flex items-center gap-4">
        {remainingTime !== null && (
          <div className="flex items-center gap-2 bg-gray-800/80 px-3 py-1 rounded-full text-blue-400">
            <Clock className="h-4 w-4" />
            <span className="font-mono">{formatTime(remainingTime)}</span>
          </div>
        )}

        <div className="flex justify-center space-x-1">
          {Array.from({ length: totalQuestions }).map((_, index) => (
            <Link
              key={index}
              href={`/challenges/crack-the-password/${index + 1}`}
              className={`w-6 h-6 rounded-full flex items-center justify-center ${
                index + 1 === currentQuestionNumber
                  ? "bg-blue-500 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              <span className="text-xs">{index + 1}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GameHeader;
