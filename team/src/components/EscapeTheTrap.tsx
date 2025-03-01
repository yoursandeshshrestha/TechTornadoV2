"use client";

import React, { useState, useEffect } from "react";
import {
  KeyRound,
  AlertTriangle,
  Clock,
  Eye,
  EyeOff,
  Zap,
  Skull,
  Terminal,
  Shield,
  Home,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { getTokenFromCookie } from "@/utils/auth";
import { useAuth } from "@/hooks/useAuth";
import leettable from "../../public/round3question2.jpg";
import Image, { StaticImageData } from "next/image";

interface Challenge {
  id: number;
  title: string;
  description: string;
  encryptedMessage?: string;
  hints: string[];
  answer: string;
  image?: string | StaticImageData;
}

// Define challenges outside the component to avoid re-creation on each render
const challenges: Challenge[] = [
  {
    id: 1,
    title: "Encrypted Message",
    description:
      "A hacker has locked your system. The only way to escape is by deciphering their encrypted message. But be warned, each word has a different shift pattern.",
    encryptedMessage: "WKLV LV D WHVW",
    hints: [
      "Shift the first word back by 3.",
      "Shift the second word back by 3.",
      "Shift the third word back by 3.",
    ],
    answer: "",
  },
  {
    id: 2,
    title: "Leet Code Password",
    description:
      "A notorious hacker has locked you out of your system! The only way to regain access is by decoding their password written in 1337 (leet) language. But be warned, the hacker is tricky!",
    hints: [
      "The password follows a Word-Number-Word pattern.",
      "The first word is a ferocious animal (written in leet).",
      "The number in the middle is the year a famous hacking movie was released (1995 - Hackers).",
      "The last word is what a hacker loves the most - 'Access', written in leet!",
    ],
    answer: "",
    image: leettable,
  },
];

interface GameState {
  _id: string;
  currentRound: number;
  isRegistrationOpen: boolean;
  isGameActive: boolean;
  isPaused: boolean;
  roundEndTime: string;
  roundStartTime: string;
  remainingTime: number | null;
}

const EscapeTheTrap: React.FC = () => {
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState<number>(0);
  const [userAnswer, setUserAnswer] = useState<string>("");
  const [showHint, setShowHint] = useState<boolean>(false);
  const [currentHintIndex, setCurrentHintIndex] = useState<number>(0);

  // Default game duration as fallback (50 minutes in seconds)
  const DEFAULT_GAME_DURATION = 50 * 60;

  // Game state from the backend
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(DEFAULT_GAME_DURATION);
  const [attempts, setAttempts] = useState<number>(0);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [allChallengesCompleted, setAllChallengesCompleted] =
    useState<boolean>(false);
  const router = useRouter();
  const { teamData } = useAuth(false);

  // Fetch game state from the backend
  useEffect(() => {
    const fetchGameState = async () => {
      try {
        const token = getTokenFromCookie();

        if (!token) {
          throw new Error("No team token found. Please login again.");
        }

        const apiUrl =
          process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:8000";

        const response = await fetch(`${apiUrl}/api/game/current-state`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch game state");
        }

        const data = await response.json();
        setGameState(data);

        // Calculate remaining time based on server data
        if (data.roundStartTime && data.roundEndTime) {
          const endTime = new Date(data.roundEndTime).getTime();
          const currentTime = new Date().getTime();
          const remainingMs = Math.max(0, endTime - currentTime);
          const remainingSeconds = Math.floor(remainingMs / 1000);

          // Use the server-provided remaining time or calculate it
          const timeToUse =
            data.remainingTime !== null ? data.remainingTime : remainingSeconds;

          setTimeLeft(timeToUse);
          console.log(`Time left from server: ${timeToUse} seconds`);
        }

        // Check if game is paused
        if (data.isPaused) {
          console.log("Game is currently paused");
        }

        // Check if game is active
        if (!data.isGameActive) {
          console.log("Game is not active");
          setGameOver(true);
        }
      } catch (error) {
        console.error("Error fetching game state:", error);
        setApiError("Could not fetch game state. Using default timer.");
      }
    };

    fetchGameState().then(() => {
      // Simulate loading terminal effect after fetching game state
      setTimeout(() => {
        setLoading(false);
      }, 1500);
    });
  }, []);

  // Safety check: Ensure currentChallengeIndex is within bounds
  useEffect(() => {
    if (currentChallengeIndex >= challenges.length) {
      console.log("All challenges completed, showing completion screen");
      setAllChallengesCompleted(true);
    }
  }, [currentChallengeIndex]);

  // Updated game timer countdown considering game state from backend
  useEffect(() => {
    if (!loading) {
      // Only start the timer once loading is complete
      // Only start the timer if the game is active and not paused
      if (!gameState || (gameState.isGameActive && !gameState.isPaused)) {
        const timer = setInterval(() => {
          setTimeLeft((prev) => {
            if (prev <= 0) {
              clearInterval(timer);
              setGameOver(true);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        return () => clearInterval(timer);
      }
    }
  }, [loading, gameState]);

  // Only access currentChallenge if index is valid
  const currentChallenge =
    currentChallengeIndex < challenges.length
      ? challenges[currentChallengeIndex]
      : null;
  const maxAttempts = 3;

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  const submitAnswerToAPI = async (answer: string): Promise<boolean> => {
    setIsSubmitting(true);
    setApiError("");

    // Safety check: don't submit if out of challenges
    if (currentChallengeIndex >= challenges.length) {
      console.log("No more challenges to submit");
      setApiError("All challenges completed!");
      setTimeout(() => {
        router.push("/");
      }, 2000);
      return false;
    }

    try {
      const token = getTokenFromCookie();

      if (!token) {
        throw new Error("No team token found. Please login again.");
      }

      // Get team data from local storage to determine the current round
      const team = localStorage.getItem("team");
      // Default to round 3 based on your database info, but try to get from team data if available
      let currentRound = gameState?.currentRound || 3;

      if (team) {
        try {
          const teamData = JSON.parse(team);
          if (teamData.currentRound) {
            currentRound = teamData.currentRound;
          }
        } catch (e) {
          console.error("Error parsing team data:", e);
        }
      }

      const apiUrl =
        process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:8000";

      const response = await fetch(`${apiUrl}/api/game/submit-answer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          roundNumber: currentRound,
          questionNumber: currentChallengeIndex + 1,
          answer: answer,
        }),
      });

      const data = await response.json();
      console.log("API Response:", data);

      // Special case for already answered questions
      if (
        data.success === false &&
        data.message === "Question already answered correctly"
      ) {
        // Show a more user-friendly message
        setApiError(
          "You've already answered this question correctly! Moving to next challenge..."
        );

        // Treat as correct (for the purpose of progressing)
        setTimeout(() => {
          if (currentChallengeIndex < challenges.length - 1) {
            setCurrentChallengeIndex((prev) => prev + 1);
            resetState();
          } else {
            // All challenges completed
            setAllChallengesCompleted(true);
            setSuccessMessage(
              "All challenges completed. Returning to homepage..."
            );
            setTimeout(() => {
              router.push("/");
            }, 2000);
          }
        }, 2000);

        return true;
      }

      // Special case for maximum attempts reached
      if (
        data.success === false &&
        data.message === "Maximum attempts reached for this challenge"
      ) {
        setApiError(
          "Maximum attempts reached for this challenge. Moving to the next challenge..."
        );

        // Move to next challenge after showing error
        setTimeout(() => {
          if (currentChallengeIndex < challenges.length - 1) {
            setCurrentChallengeIndex((prev) => prev + 1);
            resetState();
          } else {
            // All challenges completed
            setAllChallengesCompleted(true);
            setSuccessMessage(
              "Challenge attempts exhausted. Returning to homepage..."
            );
            setTimeout(() => {
              router.push("/");
            }, 2000);
          }
        }, 2000);

        return false;
      }

      // Regular error handling
      if (!response.ok && data.success === false) {
        throw new Error(data.message || "Failed to submit answer");
      }

      // Check the exact response format you provided
      if (data.success === true && data.data?.isCorrect === true) {
        console.log(
          "Answer is correct! Points earned:",
          data.data.pointsEarned
        );
        return true;
      }

      // If the answer is incorrect
      if (data.success === true && data.data?.isCorrect === false) {
        console.log("Answer is incorrect. No points earned.");
        return false;
      }

      // Fallback check, though we shouldn't get here with your response format
      return false;
    } catch (error) {
      console.error("API Error:", error);
      setApiError(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    if (isSubmitting) return;

    // Safety check: don't submit if out of challenges
    if (currentChallengeIndex >= challenges.length || !currentChallenge) {
      setSuccessMessage("All challenges completed!");
      setAllChallengesCompleted(true);
      setTimeout(() => {
        router.push("/");
      }, 2000);
      return;
    }

    try {
      // Send the answer to the API
      const apiResult = await submitAnswerToAPI(userAnswer);
      console.log("API Result:", apiResult);

      // If API call succeeded and the answer was correct
      if (apiResult === true) {
        // Correct answer
        setIsCorrect(true);
        setSuccessMessage(
          `Correct! You've successfully solved Challenge ${
            currentChallengeIndex + 1
          }.`
        );

        // Move to next challenge after 2 seconds
        setTimeout(() => {
          if (currentChallengeIndex < challenges.length - 1) {
            setCurrentChallengeIndex((prev) => prev + 1);
            resetState();
          } else {
            // Game completed - show success for longer before redirecting
            setAllChallengesCompleted(true);
            setSuccessMessage(
              "You've successfully escaped the trap! System access restored. Points have been awarded!"
            );
            setTimeout(() => {
              router.push("/");
            }, 3000);
          }
        }, 2500);
      } else {
        // Wrong answer
        setAttempts((prev) => prev + 1);

        // Check if this will be the max attempts after incrementing
        if (attempts + 1 >= maxAttempts) {
          setSuccessMessage(
            `Maximum attempts reached. Moving to the next challenge...`
          );

          // Move to next challenge after 2 seconds
          setTimeout(() => {
            if (currentChallengeIndex < challenges.length - 1) {
              setCurrentChallengeIndex((prev) => prev + 1);
              resetState();
            } else {
              // Game completed, but with max attempts on the last challenge
              setAllChallengesCompleted(true);
              setSuccessMessage(
                "Challenge completed. Returning to homepage..."
              );
              setTimeout(() => {
                router.push("/");
              }, 2000);
            }
          }, 2000);
        } else {
          // Still have attempts left, show an incorrect message
          setApiError("That answer is incorrect. Try again!");
        }
      }
    } catch (error) {
      // Error is already handled in submitAnswerToAPI function
      console.error("Error handling submit:", error);
      setApiError(
        error instanceof Error
          ? error.message
          : "An unknown error occurred while submitting your answer. Please try again."
      );
    }
  };

  const resetState = (): void => {
    setUserAnswer("");
    setShowHint(false);
    setCurrentHintIndex(0);
    setAttempts(0);
    setIsCorrect(false);
    setSuccessMessage("");
    setApiError("");
  };

  const showNextHint = (): void => {
    if (
      currentChallenge &&
      currentHintIndex < currentChallenge.hints.length - 1
    ) {
      setCurrentHintIndex(currentHintIndex + 1);
    }
    setShowHint(true);
  };

  // Loading screen
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-gray-900 rounded-lg p-8 text-center space-y-6 border border-green-900 shadow-[0_0_50px_rgba(34,197,94,0.5)]">
          <Terminal className="h-20 w-20 text-green-500 mx-auto animate-pulse" />
          <h1 className="text-2xl font-bold text-green-500 font-mono">
            INITIALIZING SECURE TERMINAL
          </h1>
          <div className="flex justify-center items-center gap-1">
            <div
              className="h-3 w-3 bg-green-500 rounded-full animate-pulse"
              style={{ animationDelay: "0ms" }}
            ></div>
            <div
              className="h-3 w-3 bg-green-500 rounded-full animate-pulse"
              style={{ animationDelay: "200ms" }}
            ></div>
            <div
              className="h-3 w-3 bg-green-500 rounded-full animate-pulse"
              style={{ animationDelay: "400ms" }}
            ></div>
          </div>
          <div className="w-full bg-black rounded font-mono text-xs text-green-500 p-4 text-left">
            <p>$ initiating_connection...</p>
            <p>$ establishing_secure_channel...</p>
            <p>$ bypassing_firewall...</p>
            <p>$ accessing_challenge_matrix...</p>
            <p>$ syncing_with_server_timer...</p>
          </div>
        </div>
      </div>
    );
  }

  // Game over screen
  if (gameOver) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-gray-900 rounded-lg p-8 text-center space-y-6 border border-red-900 shadow-[0_0_50px_rgba(220,38,38,0.5)]">
          <Skull className="h-20 w-20 text-red-500 mx-auto" />
          <h1 className="text-3xl font-bold text-red-500">
            TIME&apos;S UP - SYSTEM BREACH FAILED
          </h1>
          <p className="text-gray-400">
            Security protocols detected your intrusion. Connection terminated.
          </p>
          <div className="pt-4">
            <button
              onClick={() => router.push("/")}
              className="px-6 py-3 bg-red-900/50 hover:bg-red-900 text-white rounded-md transition-colors duration-300"
            >
              Return to Homepage
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Safety check - if no current challenge, show completion screen
  if (!currentChallenge) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-gray-900 rounded-lg p-8 text-center space-y-6 border border-green-900 shadow-[0_0_50px_rgba(34,197,94,0.5)]">
          <Shield className="h-20 w-20 text-green-500 mx-auto" />
          <h1 className="text-3xl font-bold text-green-500">
            ALL CHALLENGES COMPLETED
          </h1>
          <p className="text-gray-400">
            You have finished all available challenges. Thank you for playing!
          </p>
          <div className="pt-4">
            <button
              onClick={() => router.push("/")}
              className="px-6 py-3 bg-green-900/50 hover:bg-green-900 text-white rounded-md transition-colors duration-300 flex items-center justify-center gap-2 mx-auto"
            >
              <Home className="h-5 w-5" />
              Return to Homepage
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main challenge screen
  return (
    <div className="min-h-screen bg-[url('https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80')] bg-cover bg-center p-4 overflow-hidden">
      {/* Dark overlay with matrix-like effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/95 via-gray-900/95 to-black/95 backdrop-blur-sm z-0"></div>

      {/* Matrix-like code rain effect */}
      <div className="absolute inset-0 z-0 overflow-hidden opacity-30">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute text-green-500 text-xs font-mono animate-matrix-fall"
            style={{
              left: `${Math.random() * 100}%`,
              top: `-${Math.random() * 100}px`,
              animationDuration: `${5 + Math.random() * 10}s`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          >
            {Array.from({ length: 20 }).map((_, j) => (
              <div key={j}>{Math.random() > 0.5 ? "1" : "0"}</div>
            ))}
          </div>
        ))}
      </div>

      {/* Terminal Header */}
      <div className="relative z-10 max-w-4xl mx-auto mb-6">
        <div className="bg-black border-2 border-green-500/50 rounded-t-lg p-3 flex items-center justify-between shadow-[0_0_15px_rgba(34,197,94,0.3)]">
          <div className="flex items-center gap-2">
            <Terminal className="h-5 w-5 text-green-500" />
            <span className="font-mono text-green-500 text-sm">
              secure_terminal@escape:~# CHALLENGE {currentChallengeIndex + 1}/
              {challenges.length}
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
            {gameState?.isPaused && (
              <div className="flex items-center gap-1 bg-yellow-800/50 px-2 py-1 rounded text-xs font-mono text-yellow-400">
                <span>GAME PAUSED</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Terminal Window */}
      <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Challenge Description */}
        <div className="bg-black/95 backdrop-blur-md rounded-lg shadow-[0_0_30px_rgba(34,197,94,0.3)] border-2 border-green-500/50 p-6 flex flex-col">
          <h2 className="text-xl font-mono font-bold text-green-400 mb-4">
            {currentChallenge.title}
          </h2>

          <div className="bg-gray-900 border-2 border-gray-700 rounded-lg p-4 mb-6 font-mono text-white shadow-inner">
            <p className="mb-4">{currentChallenge.description}</p>

            {currentChallenge.encryptedMessage && (
              <div className="mt-4 p-3 bg-black rounded-md border-2 border-green-500/30 shadow-[0_0_10px_rgba(34,197,94,0.2)]">
                <p className="text-sm text-gray-400 mb-2">Encrypted Message:</p>
                <p className="text-lg text-green-400 font-bold tracking-wider">
                  &quot;{currentChallenge.encryptedMessage}&quot;
                </p>
              </div>
            )}

            {currentChallenge.image && (
              <div className="mt-4 flex justify-center">
                <Image
                  src={currentChallenge.image}
                  alt="Challenge Reference"
                  className="max-w-full rounded-md border border-gray-700 shadow-lg"
                />
              </div>
            )}
          </div>

          {showHint && (
            <div className="bg-yellow-900/30 border-2 border-yellow-500/30 rounded-lg p-4 mb-4 text-yellow-300 space-y-2 shadow-[0_0_15px_rgba(234,179,8,0.2)]">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                <h3 className="font-mono font-bold">HINTS:</h3>
              </div>
              <ul className="list-disc pl-5 space-y-1">
                {currentChallenge.hints
                  .slice(0, currentHintIndex + 1)
                  .map((hint, index) => (
                    <li key={index} className="text-sm">
                      {hint}
                    </li>
                  ))}
              </ul>
              {currentHintIndex < currentChallenge.hints.length - 1 && (
                <button
                  onClick={showNextHint}
                  className="text-xs text-yellow-400 hover:text-yellow-300 underline mt-2"
                >
                  Show more hints
                </button>
              )}
            </div>
          )}

          {apiError && (
            <div className="mt-auto bg-red-900/30 border-2 border-red-500/30 rounded-lg p-3 text-red-400 flex items-start gap-2 animate-fade-in shadow-[0_0_15px_rgba(220,38,38,0.2)]">
              <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <p className="text-sm">{apiError}</p>
            </div>
          )}

          {successMessage && (
            <div className="mt-auto bg-green-900/30 border-2 border-green-500/30 rounded-lg p-3 text-green-400 flex items-start gap-2 animate-fade-in shadow-[0_0_15px_rgba(34,197,94,0.2)]">
              <Shield className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <p className="text-sm">{successMessage}</p>
            </div>
          )}
        </div>

        {/* Answer Form */}
        <div className="bg-black/95 backdrop-blur-md rounded-lg shadow-[0_0_30px_rgba(34,197,94,0.3)] border-2 border-green-500/50 p-6 flex flex-col">
          <h2 className="text-xl font-mono font-bold text-green-400 mb-4 flex items-center gap-2">
            <KeyRound className="h-5 w-5" />
            Enter Solution
          </h2>

          <div className="flex-grow flex flex-col justify-center">
            <div className="bg-gray-900 border-2 border-gray-700 rounded-lg p-4 mb-6 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400 font-mono">
                  root@hacked-system:~#
                </span>
                <span className="text-xs text-gray-500 font-mono">
                  Attempts: {attempts}/{maxAttempts}
                </span>
              </div>
              <div className="h-40 bg-black rounded p-3 font-mono text-green-400 text-sm overflow-auto flex flex-col shadow-[inset_0_0_10px_rgba(34,197,94,0.2)] border border-green-500/20">
                <div className="flex-grow space-y-1">
                  <p>&gt; Initializing security bypass...</p>
                  <p>&gt; Firewall detected. Attempting to circumvent...</p>
                  <p>&gt; Security layer 1 breached.</p>
                  <p>&gt; Security layer 2 active. Requires decryption key.</p>
                  <p className="text-yellow-400">
                    &gt; SYSTEM: Enter decryption key to proceed.
                  </p>
                  {attempts > 0 && (
                    <div className="text-red-400">
                      {Array.from({ length: attempts }).map((_, i) => (
                        <p key={i}>
                          &gt; SYSTEM: Invalid key attempt. Access denied.
                        </p>
                      ))}
                    </div>
                  )}
                  {isCorrect && (
                    <p className="text-green-400">
                      &gt; SYSTEM: Key accepted. Access granted.
                    </p>
                  )}
                </div>
                <div className="flex items-center">
                  <span className="text-green-400 mr-2">$</span>
                  <span className="animate-pulse">_</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Enter your answer..."
                    className="w-full px-4 py-3 bg-black border-2 border-green-500/30 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-lg text-green-400 placeholder-gray-500 font-mono shadow-[inset_0_0_10px_rgba(34,197,94,0.1)]"
                    disabled={isCorrect || isSubmitting || gameState?.isPaused}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setShowHint(!showHint)}
                  className="px-3 text-yellow-500 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  {showHint ? (
                    <EyeOff className="h-6 w-6" />
                  ) : (
                    <Eye className="h-6 w-6" />
                  )}
                </button>
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-center pt-2">
                <button
                  type="submit"
                  disabled={
                    isCorrect ||
                    attempts >= maxAttempts ||
                    isSubmitting ||
                    !userAnswer.trim() ||
                    gameState?.isPaused
                  }
                  className={`px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-[0_0_20px_rgba(34,197,94,0.4)] border-2 border-green-500/40 relative overflow-hidden group ${
                    isCorrect ||
                    attempts >= maxAttempts ||
                    isSubmitting ||
                    !userAnswer.trim() ||
                    gameState?.isPaused
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  <span className="relative z-10 flex items-center justify-center font-mono">
                    {isSubmitting ? (
                      <>
                        <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        PROCESSING
                      </>
                    ) : (
                      <>
                        <Zap className="h-5 w-5 mr-2 group-hover:animate-pulse" />
                        EXECUTE
                      </>
                    )}
                  </span>
                  <span className="absolute inset-0 bg-gradient-to-r from-green-600/50 to-emerald-600/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                </button>
              </div>
            </form>
          </div>

          <div className="mt-6">
            <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
              <span>SYSTEM SECURITY</span>
              <span>{attempts >= maxAttempts ? "LOCKED" : "VULNERABLE"}</span>
            </div>
            <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500"
                style={{ width: `${100 - (attempts / maxAttempts) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Floating elements */}
      <div className="fixed top-1/4 left-1/4 w-2 h-2 rounded-full bg-green-500 opacity-70 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.7)]"></div>
      <div className="fixed top-3/4 left-1/2 w-3 h-3 rounded-full bg-cyan-500 opacity-50 animate-ping shadow-[0_0_10px_rgba(6,182,212,0.7)]"></div>
      <div className="fixed top-1/2 right-1/4 w-2 h-2 rounded-full bg-yellow-300 opacity-60 animate-bounce shadow-[0_0_10px_rgba(253,224,71,0.7)]"></div>
      <div className="fixed top-1/3 right-1/3 w-4 h-4 rounded-full bg-red-500 opacity-40 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.7)]"></div>
      <div className="fixed top-2/3 left-1/3 w-3 h-3 rounded-full bg-purple-500 opacity-30 animate-ping shadow-[0_0_10px_rgba(168,85,247,0.7)]"></div>

      {/* Scan lines effect */}
      <div className="pointer-events-none fixed inset-0 z-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgogIDxkZWZzPgogICAgPHBhdHRlcm4KICAgICAgaWQ9InNjYW5saW5lcyIKICAgICAgd2lkdGg9IjEiCiAgICAgIGhlaWdodD0iOCIKICAgICAgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIKICAgICAgcGF0dGVyblRyYW5zZm9ybT0ic2NhbGUoMSwyKSIKICAgID4KICAgICAgPHJlY3Qgd2lkdGg9IjEiIGhlaWdodD0iMSIgZmlsbD0iIzAwMCIgZmlsbC1vcGFjaXR5PSIwLjA1Ii8+CiAgICA8L3BhdHRlcm4+CiAgPC9kZWZzPgogIDxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjc2NhbmxpbmVzKSIvPgo8L3N2Zz4=')] opacity-20"></div>

      {/* Glitch effect overlay */}
      <div className="pointer-events-none fixed inset-0 z-10 bg-gradient-to-b from-transparent via-green-500/5 to-transparent opacity-30"></div>
    </div>
  );
};

export default EscapeTheTrap;
