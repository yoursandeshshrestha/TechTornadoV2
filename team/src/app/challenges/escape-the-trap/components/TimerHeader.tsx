import React from "react";
import { Terminal, AlertTriangle, Clock } from "lucide-react";

interface TimerHeaderProps {
  currentChallengeIndex: number;
  totalChallenges: number;
  attempts: number;
  maxAttempts: number;
  timeLeft: number;
  isPaused: boolean;
}

const TimerHeader: React.FC<TimerHeaderProps> = ({
  currentChallengeIndex,
  totalChallenges,
  attempts,
  maxAttempts,
  timeLeft,
  isPaused,
}) => {
  const formatTime = (seconds: number): string => {
    // Handle invalid values
    if (typeof seconds !== "number" || isNaN(seconds) || seconds < 0) {
      return "00:00"; // Default fallback when time is invalid
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="relative z-10 max-w-4xl mx-auto mb-6">
      <div className="bg-black border-2 border-green-500/50 rounded-t-lg p-3 flex items-center justify-between shadow-[0_0_15px_rgba(34,197,94,0.3)]">
        <div className="flex items-center gap-2">
          <Terminal className="h-5 w-5 text-green-500" />
          <span className="font-mono text-green-500 text-sm">
            secure_terminal@escape:~# CHALLENGE {currentChallengeIndex + 1}/
            {totalChallenges}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-gray-800 px-2 py-1 rounded text-xs font-mono text-yellow-400">
            <AlertTriangle className="h-3 w-3" />
            <span>
              ATTEMPTS: {attempts}/{maxAttempts}
            </span>
          </div>
          <div className="flex items-center gap-1 bg-gray-800 px-2 py-1 rounded text-xs font-mono text-red-400">
            <Clock className="h-3 w-3" />
            <span>{formatTime(timeLeft)}</span>
          </div>
          {isPaused && (
            <div className="flex items-center gap-1 bg-yellow-800/50 px-2 py-1 rounded text-xs font-mono text-yellow-400">
              <span>GAME PAUSED</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TimerHeader;
