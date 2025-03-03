"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  Monitor,
  Cpu,
  Compass,
  Shuffle,
  ChevronRight,
  Info,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
} from "lucide-react";
import { allChallenges, Challenge } from "@/data/round2QuestionData";
import { getGameState } from "@/utils/apiService";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

// Import common RoundNotActiveScreen
import RoundNotActiveScreen from "@/components/common/RoundNotActiveScreen";

const ChallengeHub: React.FC = () => {
  const { teamData } = useAuth();
  const [isRoundActive, setIsRoundActive] = useState<boolean>(true);
  const [showInstructions, setShowInstructions] = useState<boolean>(false);
  const [currentRound, setCurrentRound] = useState<number>(0);
  const router = useRouter();

  useEffect(() => {
    const fetchGameState = async (): Promise<void> => {
      try {
        const gameState = await getGameState();

        if (gameState) {
          // Store the current round for the RoundNotActiveScreen
          setCurrentRound(gameState.currentRound);

          if (gameState.currentRound !== 2) {
            setIsRoundActive(false);
          }
        }
      } catch (error) {
        console.error("Error fetching game state:", error);
      }
    };

    fetchGameState();

    // Refresh game state occasionally
    const refreshInterval = setInterval(fetchGameState, 120000); // every 2 minutes
    return () => clearInterval(refreshInterval);
  }, []);

  // Handler for returning to dashboard
  const goBackToDashboard = (): void => {
    router.push("/");
  };

  if (!isRoundActive) {
    return (
      <RoundNotActiveScreen onClick={goBackToDashboard} round={currentRound} />
    );
  }

  // Get challenge icon based on type
  const getChallengeIcon = (id: number): React.ReactNode => {
    if (id <= 3) return <FileText className="h-5 w-5" />;
    if (id <= 5) return <Cpu className="h-5 w-5" />;
    if (id <= 8) return <Monitor className="h-5 w-5" />;
    if (id === 9) return <Compass className="h-5 w-5" />;
    return <Shuffle className="h-5 w-5" />;
  };

  // Determine challenge status color
  const getChallengeStatusColor = (): string => {
    return "bg-gray-700 hover:bg-gray-600";
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center relative"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1639322537228-f710d846310a?q=80')",
      }}
    >
      {/* Add a semi-transparent overlay background */}
      <div className="absolute inset-0 bg-black/80"></div>

      <div className="relative z-10 max-w-5xl mx-auto pt-8 p-4">
        {/* Back button to home */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-blue-300 hover:text-blue-100 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Dashboard</span>
          </Link>
        </div>

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

          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mt-4 md:mt-0">
            {/* Simple message instead of timer */}
            <div className="bg-gray-800/80 p-3 rounded-lg border border-blue-500/30">
              <p className="text-blue-300">Game in progress</p>
            </div>

            <button
              onClick={() => setShowInstructions(!showInstructions)}
              className="flex items-center gap-2 bg-blue-900/80 hover:bg-blue-800 p-3 rounded-lg border border-blue-500/30 text-white transition-colors"
            >
              <Info className="h-5 w-5" />
              <span>Instructions</span>
              {showInstructions ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {showInstructions && (
          <div className="bg-gray-800/90 border border-blue-500/40 rounded-lg p-6 mb-8 shadow-lg">
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
                    PDF, you&apos;ll find a secret message to submit.
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
                    For terminal challenges, you&apos;ll need to run C programs
                    on your computer to find the secret messages
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-white font-bold mb-1">
                  Terminal Instructions (Challenges 6-8):
                </h3>
                <ol className="list-decimal pl-5 space-y-1">
                  <li>Open a terminal window on the computer</li>
                  <li>
                    Navigate to the folder containing the C program files using
                    the <code className="bg-gray-700 px-1 rounded">cd</code>{" "}
                    command
                  </li>
                  <li>
                    Compile the C program using:
                    <code className="bg-gray-700 px-1 rounded">
                      gcc -o ai_research ai_research.c
                    </code>
                  </li>
                  <li>
                    Run the compiled program using:
                    <code className="bg-gray-700 px-1 rounded">
                      ./ai_research
                    </code>
                  </li>
                  <li>
                    When prompted, enter the password you&apos;ve figured out
                    from the hints
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
          {allChallenges.map((challenge: Challenge) => (
            <Link
              key={challenge.id}
              href={`/challenges/crack-the-password/${challenge.id}`}
              className={`${getChallengeStatusColor()} border border-blue-500/30 rounded-lg p-5 hover:scale-105 transition-transform hover:shadow-lg`}
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
