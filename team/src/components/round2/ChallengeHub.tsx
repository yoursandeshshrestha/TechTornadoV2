"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileText,
  Monitor,
  Cpu,
  Compass,
  Shuffle,
  ChevronRight,
  Clock,
  Lightbulb,
} from "lucide-react";
import { allChallenges, Challenge } from "@/data/round2QuestionData";
import { getGameState, calculateRemainingTime } from "@/utils/apiService";
import { useAuth } from "@/hooks/useAuth";

const ChallengeHub: React.FC = () => {
  const { teamData } = useAuth();
  const router = useRouter();
  const [remainingTime, setRemainingTime] = useState<number | null>(null);
  const [isRoundActive, setIsRoundActive] = useState(true);
  const [showInstructions, setShowInstructions] = useState(false);

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
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-gray-800 rounded-lg p-8 text-center space-y-6 border border-red-900">
          <h1 className="text-3xl font-bold text-red-400">
            Round 2 Not Active
          </h1>
          <p className="text-gray-300">
            The Crack the Password round is not currently active. Please check
            back later.
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  // Get challenge icon based on type
  const getChallengeIcon = (id: number) => {
    if (id <= 3) return <FileText className="h-5 w-5" />;
    if (id <= 5) return <Cpu className="h-5 w-5" />;
    if (id <= 8) return <Monitor className="h-5 w-5" />;
    if (id === 9) return <Compass className="h-5 w-5" />;
    return <Shuffle className="h-5 w-5" />;
  };

  // Determine challenge status color
  const getChallengeStatusColor = (id: number) => {
    return "bg-gray-700 hover:bg-gray-600";
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center p-4"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1639322537228-f710d846310a?q=80')",
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900/95 via-blue-900/90 to-gray-900/95 z-0"></div>

      <div className="relative z-10 max-w-5xl mx-auto pt-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Crack the Password
            </h1>
            <p className="text-blue-300 text-lg md:text-xl">
              Round 2: Solve 10 password challenges
            </p>
            {teamData && (
              <p className="text-gray-400 mt-2">Team: {teamData.teamName}</p>
            )}
          </div>

          {remainingTime !== null && (
            <div className="flex items-center gap-3 bg-gray-800/80 p-3 rounded-lg border border-blue-500/30 mt-4 md:mt-0">
              <Clock className="h-5 w-5 text-blue-400" />
              <div>
                <div className="text-xs text-gray-400">Remaining Time</div>
                <div className="text-xl font-mono text-white">
                  {formatTime(remainingTime)}
                </div>
              </div>
            </div>
          )}
        </div>

        {showInstructions && (
          <div className="bg-gray-800/80 border border-blue-500/30 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-blue-400 mb-4">
              Round 2 Instructions
            </h2>
            <div className="space-y-4 text-gray-300">
              <p>
                Welcome to Round 2:{" "}
                <strong className="text-white">Crack the Password</strong>! This
                round contains 10 different password challenges for your team to
                solve.
              </p>

              <div>
                <h3 className="text-white font-bold mb-1">Challenge Types:</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    <span className="text-blue-300">PDF Challenges (1-3):</span>{" "}
                    Figure out the password to unlock a PDF file. Inside the
                    PDF, you'll find a secret message to submit.
                  </li>
                  <li>
                    <span className="text-blue-300">
                      Simple Challenges (4-5):
                    </span>{" "}
                    Solve pattern and logic problems to find the correct
                    answers.
                  </li>
                  <li>
                    <span className="text-blue-300">
                      Terminal Challenges (6-8):
                    </span>{" "}
                    Use hints to determine the password for C programs that will
                    reveal secret messages when run.
                  </li>
                  <li>
                    <span className="text-blue-300">Digital Maze (9):</span>{" "}
                    Find the pattern in a sequence of numbers to unlock the exit
                    door.
                  </li>
                  <li>
                    <span className="text-blue-300">Word Unscramble (10):</span>{" "}
                    Rearrange scrambled letters to form the correct word.
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-white font-bold mb-1">Tips:</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Each correct answer is worth 5 points</li>
                  <li>You have unlimited attempts for each challenge</li>
                  <li>You can navigate between challenges at any time</li>
                  <li>
                    For terminal challenges, you'll need to run C programs on
                    your computer to find the secret messages
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-white font-bold mb-1">
                  Terminal Instructions (Challenges 6-8):
                </h3>
                <ol className="list-decimal pl-5 space-y-1">
                  <li>Open a terminal window on the computer</li>
                  <li>Navigate to the folder containing the C program files</li>
                  <li>
                    Run the program (example:{" "}
                    <code className="bg-gray-700 px-1 rounded">
                      ./ai_research.c
                    </code>
                    )
                  </li>
                  <li>
                    When prompted, enter the password you've figured out from
                    the hints
                  </li>
                  <li>
                    The program will reveal the secret message if the password
                    is correct
                  </li>
                  <li>
                    Enter this secret message in the challenge to earn points
                  </li>
                </ol>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(allChallenges as Challenge[]).map((challenge) => (
            <Link
              key={challenge.id}
              href={`/challenges/crack-the-password/${challenge.id}`}
              className={`${getChallengeStatusColor(
                challenge.id
              )} border border-blue-500/30 rounded-lg p-5 hover:scale-105 transition-transform`}
            >
              <div className="flex items-start gap-4">
                <div className="bg-blue-900/50 text-blue-300 rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0">
                  {getChallengeIcon(challenge.id)}
                </div>
                <div className="flex-grow">
                  <h3 className="text-white font-bold mb-1 flex items-center justify-between">
                    <span>Challenge {challenge.id}</span>
                    <ChevronRight className="h-4 w-4 text-blue-400" />
                  </h3>
                  <p className="text-gray-300 text-sm line-clamp-2">
                    {challenge.title}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChallengeHub;
