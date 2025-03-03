"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { fetchGameState, submitAnswer } from "./utils/apiClient";
import {
  challenges,
  MAX_ATTEMPTS,
  DEFAULT_GAME_DURATION,
} from "./utils/challengeData";
import { GameState } from "./types";

// Import components
import LoadingScreen from "./components/LoadingScreen";
import GameOverScreen from "./components/GameOverScreen";
import RoundNotActiveScreen from "./components/RoundNotActiveScreen";
import CompletionScreen from "./components/CompletionScreen";
import MaxAttemptsScreen from "./components/MaxAttemptsScreen";
import ChallengeDescription from "./components/ChallengeDescription";
import AnswerForm from "./components/AnswerForm";
import TimerHeader from "./components/TimerHeader";
import VisualEffects from "./components/VisualEffects";

// Interface for tracking challenge attempts/completion
interface ChallengeState {
  attempts: {
    [key: number]: number; // question index -> number of attempts
  };
  completed: {
    [key: number]: boolean; // question index -> whether it's been completed
  };
  maxedOut: {
    [key: number]: boolean; // question index -> whether max attempts reached
  };
  timestamp: number; // when this state was created/updated
}

const EscapeTheTrap: React.FC = () => {
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState<number>(0);
  const [userAnswer, setUserAnswer] = useState<string>("");
  const [showHint, setShowHint] = useState<boolean>(false);
  const [currentHintIndex, setCurrentHintIndex] = useState<number>(0);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(DEFAULT_GAME_DURATION);
  const [attempts, setAttempts] = useState<number>(0);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [challengeState, setChallengeState] = useState<ChallengeState | null>(
    null
  );
  const [allChallengesAttempted, setAllChallengesAttempted] =
    useState<boolean>(false);

  const router = useRouter();
  const { teamData } = useAuth(false);

  // Generate team-specific localStorage key
  const getChallengeStateKey = useCallback((): string => {
    // Get team ID or name from teamData or localStorage
    let teamIdentifier: string = "guest";

    if (teamData && teamData.id) {
      teamIdentifier = String(teamData.id);
    } else if (teamData && teamData.name) {
      teamIdentifier = String(teamData.name);
    } else {
      // Try to get from localStorage as fallback
      const storedTeam = localStorage.getItem("team");
      if (storedTeam) {
        try {
          const teamInfo = JSON.parse(storedTeam);
          if (teamInfo.id) {
            teamIdentifier = String(teamInfo.id);
          } else if (teamInfo.name) {
            teamIdentifier = String(teamInfo.name);
          } else if (teamInfo.teamName) {
            teamIdentifier = String(teamInfo.teamName);
          }
        } catch {
          // Use default, ignore error
        }
      }
    }

    return `escape-trap-challenge-state-${teamIdentifier}`;
  }, [teamData]);

  // Initialize a fresh challenge state
  const initializeNewChallengeState = useCallback(() => {
    const newState: ChallengeState = {
      attempts: {},
      completed: {},
      maxedOut: {},
      timestamp: Date.now(),
    };
    setChallengeState(newState);
    localStorage.setItem(getChallengeStateKey(), JSON.stringify(newState));
  }, [getChallengeStateKey]);

  // Find the next challenge that hasn't been completed or maxed out
  const findNextAvailableChallenge = (state: ChallengeState): number => {
    for (let i = 0; i < challenges.length; i++) {
      if (!state.completed[i] && !state.maxedOut[i]) {
        return i;
      }
    }
    return -1; // No available challenges
  };

  // Update challenge state and save to localStorage
  const updateChallengeState = (
    index: number,
    isComplete: boolean = false,
    isMaxedOut: boolean = false,
    attemptCount: number = attempts
  ) => {
    if (!challengeState) return;

    const updatedState = { ...challengeState };

    // Update attempts
    updatedState.attempts[index] = attemptCount;

    // Update completion status if needed
    if (isComplete) {
      updatedState.completed[index] = true;
    }

    // Update maxed out status if needed
    if (isMaxedOut) {
      updatedState.maxedOut[index] = true;
    }

    // Update timestamp for expiration tracking
    updatedState.timestamp = Date.now();

    setChallengeState(updatedState);
    localStorage.setItem(getChallengeStateKey(), JSON.stringify(updatedState));

    // Check if all challenges are either completed or maxed out
    const allAttempted = challenges.every(
      (_, idx) =>
        updatedState.completed[idx] === true ||
        updatedState.maxedOut[idx] === true
    );

    setAllChallengesAttempted(allAttempted);
  };

  // Load challenge state from localStorage
  useEffect(() => {
    const stateKey = getChallengeStateKey();
    const savedState = localStorage.getItem(stateKey);

    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState) as ChallengeState;

        // Check if state has expired (1 hour = 3600000 milliseconds)
        const currentTime = Date.now();
        const stateAge = currentTime - parsedState.timestamp;
        const ONE_HOUR = 3600000;

        if (stateAge > ONE_HOUR) {
          // State has expired, create new one
          initializeNewChallengeState();
        } else {
          // State is valid
          setChallengeState(parsedState);

          // If we have attempts data for the current challenge, load it
          if (
            parsedState.attempts &&
            parsedState.attempts[currentChallengeIndex] !== undefined
          ) {
            setAttempts(parsedState.attempts[currentChallengeIndex]);
          }

          // Check if all challenges are either completed or maxed out
          const allAttempted = challenges.every(
            (_, index) =>
              parsedState.completed[index] === true ||
              parsedState.maxedOut[index] === true
          );

          setAllChallengesAttempted(allAttempted);

          // If current challenge is already completed or maxed out, move to next available challenge
          if (
            parsedState.completed[currentChallengeIndex] ||
            parsedState.maxedOut[currentChallengeIndex]
          ) {
            const nextAvailableIndex = findNextAvailableChallenge(parsedState);
            if (nextAvailableIndex !== -1) {
              setCurrentChallengeIndex(nextAvailableIndex);
              // Update attempts for newly selected challenge
              if (parsedState.attempts[nextAvailableIndex] !== undefined) {
                setAttempts(parsedState.attempts[nextAvailableIndex]);
              } else {
                setAttempts(0);
              }
            } else {
              // No available challenges - all completed or maxed out
              setAllChallengesAttempted(true);
            }
          }
        }
      } catch {
        // Invalid JSON, initialize a new state
        initializeNewChallengeState();
      }
    } else {
      initializeNewChallengeState();
    }
  }, [
    currentChallengeIndex,
    teamData,
    getChallengeStateKey,
    initializeNewChallengeState,
  ]);

  // Fetch game state once on component mount
  useEffect(() => {
    let isMounted = true;

    const getGameState = async () => {
      try {
        const data = await fetchGameState();

        if (isMounted) {
          setGameState(data);

          if (data.roundStartTime && data.roundEndTime) {
            const endTime = new Date(data.roundEndTime).getTime();
            const currentTime = new Date().getTime();
            const remainingMs = Math.max(0, endTime - currentTime);
            const remainingSeconds = Math.floor(remainingMs / 1000);

            const timeToUse =
              data.remainingTime !== null
                ? data.remainingTime
                : remainingSeconds;

            setTimeLeft(timeToUse);
          }

          if (!data.isGameActive) {
            setGameOver(true);
          }
        }
      } catch {
        if (isMounted) {
          setApiError("Could not fetch game state. Using default timer.");
        }
      } finally {
        if (isMounted) {
          // Simulate loading terminal effect
          setTimeout(() => {
            setLoading(false);
          }, 1500);
        }
      }
    };

    getGameState();

    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
    };
  }, []);

  // Game timer countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (!loading && gameState?.isGameActive && !gameState?.isPaused) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 0) {
            clearInterval(timer);
            setGameOver(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [loading, gameState?.isGameActive, gameState?.isPaused]);

  const currentChallenge =
    currentChallengeIndex < challenges.length
      ? challenges[currentChallengeIndex]
      : null;

  const handleSubmit = async (event: React.FormEvent): Promise<void> => {
    event.preventDefault();

    if (isSubmitting) return;

    // Safety check: don't submit if out of challenges
    if (currentChallengeIndex >= challenges.length || !currentChallenge) {
      setSuccessMessage("All challenges completed!");
      setTimeout(() => {
        router.push("/");
      }, 2000);
      return;
    }

    try {
      setIsSubmitting(true);
      setApiError("");

      // Get current round from team data or game state
      const team = localStorage.getItem("team");
      let currentRound = gameState?.currentRound || 3;

      if (team) {
        try {
          const parsedTeamData = JSON.parse(team);
          if (parsedTeamData.currentRound) {
            currentRound = parsedTeamData.currentRound;
          }
        } catch {
          // Error parsing team data, use default
        }
      }

      const response = await submitAnswer({
        roundNumber: currentRound,
        questionNumber: currentChallengeIndex + 1,
        answer: userAnswer,
      });

      // Special case for already answered questions
      if (
        response.success === false &&
        response.message === "Question already answered correctly"
      ) {
        setApiError(
          "You've already answered this question correctly! Moving to next challenge..."
        );

        // Mark as completed in our tracking
        updateChallengeState(currentChallengeIndex, true, false);

        // Treat as correct (for the purpose of progressing)
        setTimeout(() => {
          const nextAvailable = challengeState
            ? findNextAvailableChallenge(challengeState)
            : -1;

          if (nextAvailable !== -1) {
            setCurrentChallengeIndex(nextAvailable);
            resetState();
          } else {
            // All challenges completed or maxed out
            setSuccessMessage(
              "All challenges completed. Returning to homepage..."
            );
            setTimeout(() => {
              router.push("/");
            }, 2000);
          }
        }, 2000);

        return;
      }

      // Special case for maximum attempts reached
      if (
        response.success === false &&
        response.message === "Maximum attempts reached for this challenge"
      ) {
        setApiError(
          "Maximum attempts reached for this challenge. Moving to the next challenge..."
        );

        // Mark as maxed out in our tracking
        updateChallengeState(currentChallengeIndex, false, true);

        // Move to next challenge after showing error
        setTimeout(() => {
          const nextAvailable = challengeState
            ? findNextAvailableChallenge(challengeState)
            : -1;

          if (nextAvailable !== -1) {
            setCurrentChallengeIndex(nextAvailable);
            resetState();
          } else {
            // All challenges completed or maxed out
            setSuccessMessage(
              "Challenge attempts exhausted. Returning to homepage..."
            );
            setTimeout(() => {
              router.push("/");
            }, 2000);
          }
        }, 2000);

        return;
      }

      // If API call succeeded and the answer was correct
      if (response.success === true && response.data?.isCorrect === true) {
        // Correct answer
        setIsCorrect(true);
        setSuccessMessage(
          `Correct! You've successfully solved Challenge ${
            currentChallengeIndex + 1
          }.`
        );

        // Mark as completed in our tracking
        updateChallengeState(currentChallengeIndex, true, false);

        // Move to next challenge after 2 seconds
        setTimeout(() => {
          const nextAvailable = challengeState
            ? findNextAvailableChallenge(challengeState)
            : -1;

          if (nextAvailable !== -1) {
            setCurrentChallengeIndex(nextAvailable);
            resetState();
          } else {
            // Game completed - show success for longer before redirecting
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
        const newAttemptCount = attempts + 1;
        setAttempts(newAttemptCount);

        // Update attempt count in our tracking
        updateChallengeState(
          currentChallengeIndex,
          false,
          false,
          newAttemptCount
        );

        // Check if this will be the max attempts after incrementing
        if (newAttemptCount >= MAX_ATTEMPTS) {
          setSuccessMessage(
            `Maximum attempts reached. Moving to the next challenge...`
          );

          // Mark as maxed out in our tracking
          updateChallengeState(
            currentChallengeIndex,
            false,
            true,
            newAttemptCount
          );

          // Move to next challenge after 2 seconds
          setTimeout(() => {
            const nextAvailable = challengeState
              ? findNextAvailableChallenge(challengeState)
              : -1;

            if (nextAvailable !== -1) {
              setCurrentChallengeIndex(nextAvailable);
              resetState();
            } else {
              // All challenges have been attempted (maxed out)
              const anyCompleted =
                challengeState &&
                Object.values(challengeState.completed).some(
                  (value) => value === true
                );

              if (anyCompleted) {
                setSuccessMessage(
                  "Challenge completed. Returning to homepage..."
                );
              } else {
                setSuccessMessage(
                  "Maximum attempts reached for all challenges. Returning to homepage..."
                );
              }
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
      setApiError(
        error instanceof Error
          ? error.message
          : "An unknown error occurred while submitting your answer. Please try again."
      );
    } finally {
      setIsSubmitting(false);
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

  const goToHome = () => {
    router.push("/");
  };

  // Loading screen
  if (loading) {
    return <LoadingScreen />;
  }

  // Show appropriate screen if all challenges have been attempted
  if (allChallengesAttempted) {
    // Check if any challenges were completed successfully
    const anyCompleted =
      challengeState &&
      Object.values(challengeState.completed).some((value) => value === true);

    if (anyCompleted) {
      // At least one challenge was completed, show completion screen
      return <CompletionScreen onClick={goToHome} />;
    } else {
      // No challenges were completed (all maxed out attempts), show max attempts screen
      return <MaxAttemptsScreen onClick={goToHome} redirectTime={5} />;
    }
  }

  // Check if current round is active
  if (gameState && gameState.currentRound !== 3) {
    return (
      <RoundNotActiveScreen onClick={goToHome} round={gameState.currentRound} />
    );
  }

  // Game over screen
  if (gameOver) {
    return <GameOverScreen onClick={goToHome} />;
  }

  // Safety check - if no current challenge, show completion screen
  if (!currentChallenge) {
    return <CompletionScreen onClick={goToHome} />;
  }

  // Main challenge screen
  return (
    <div className="min-h-screen bg-[url('https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80')] bg-cover bg-center p-4 overflow-hidden">
      {/* Dark overlay with matrix-like effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/95 via-gray-900/95 to-black/95 backdrop-blur-sm z-0"></div>

      {/* Visual effects */}
      <VisualEffects />

      {/* Timer Header */}
      <TimerHeader
        currentChallengeIndex={currentChallengeIndex}
        totalChallenges={challenges.length}
        attempts={attempts}
        maxAttempts={MAX_ATTEMPTS}
        timeLeft={timeLeft}
        isPaused={gameState?.isPaused || false}
      />

      {/* Main Terminal Window */}
      <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Challenge Description */}
        <ChallengeDescription
          challenge={currentChallenge}
          showHint={showHint}
          currentHintIndex={currentHintIndex}
          showNextHint={showNextHint}
          apiError={apiError}
          successMessage={successMessage}
        />

        {/* Answer Form */}
        <AnswerForm
          userAnswer={userAnswer}
          setUserAnswer={setUserAnswer}
          handleSubmit={handleSubmit}
          attempts={attempts}
          maxAttempts={MAX_ATTEMPTS}
          isCorrect={isCorrect}
          isSubmitting={isSubmitting}
          isPaused={gameState?.isPaused || false}
          showHint={showHint}
          setShowHint={setShowHint}
        />
      </div>
    </div>
  );
};

export default EscapeTheTrap;
