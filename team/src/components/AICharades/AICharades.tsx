"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { getTokenFromCookie, removeTokenCookie } from "@/utils/auth";
import { Toaster, toast } from "sonner";

// Import component parts
import { LoadingScreen, ResultsScreen } from "./GameScreens";

// Import common RoundNotActiveScreen
import RoundNotActiveScreen from "@/components/common/RoundNotActiveScreen";
import GameScreen from "./GameScreen";
import { Question, GameState, AnswerResponse } from "@/types/game";

// API Base URL from environment variable
const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:8000";

const AICharades: React.FC = () => {
  useRequireAuth();
  const router = useRouter();
  const { teamData } = useAuth();

  // Game state
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [userAnswer, setUserAnswer] = useState<string>("");
  const [showHint, setShowHint] = useState<boolean>(false);
  const [currentHintIndex, setCurrentHintIndex] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [feedbackMessage, setFeedbackMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [roundActive, setRoundActive] = useState<boolean>(false);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [currentRound, setCurrentRound] = useState<number>(0);
  const [allQuestionsAnswered, setAllQuestionsAnswered] =
    useState<boolean>(false);

  // Fetch the round status and time remaining
  useEffect(() => {
    const fetchGameState = async () => {
      try {
        // Get token from cookie
        const token = getTokenFromCookie();
        if (!token) {
          console.error("No auth token found");
          toast.error("Authentication required");
          router.push("/login");
          return;
        }

        const response = await fetch(`${API_BASE_URL}/api/game/current-state`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        if (response.status === 401 || response.status === 403) {
          console.error("Authentication failed:", response.status);
          toast.error("Authentication failed. Please login again.");
          removeTokenCookie();
          router.push("/login");
          return;
        }

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Game state API error:", response.status, errorText);
          throw new Error(`Failed to fetch game state: ${response.status}`);
        }

        const data: GameState = await response.json();

        // Store the current round number
        setCurrentRound(data.currentRound);

        if (data.currentRound === 1 && data.isGameActive && !data.isPaused) {
          setRoundActive(true);

          // Set round end time
          const endTime = new Date(data.roundEndTime);

          // Calculate initial time left
          const now = new Date();
          const timeRemaining = Math.max(
            0,
            Math.floor((endTime.getTime() - now.getTime()) / 1000)
          );
          setTimeLeft(timeRemaining);
        } else {
          setRoundActive(false);
          if (data.currentRound > 1) {
            // Round is completed, show results
            setShowResults(true);
          }
        }
      } catch (error) {
        console.error("Error fetching game state:", error);
        toast.error("Failed to load game state");

        // For development only - remove for production
        setRoundActive(true);
        setTimeLeft(1800); // 30 minutes
      }
    };

    fetchGameState();
  }, [router]);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        // Get token from cookie
        const token = getTokenFromCookie();
        if (!token) {
          console.error("No auth token found");
          toast.error("Authentication required");
          router.push("/login");
          return;
        }

        // Ensure URL matches exactly with what works in Postman
        const questionsUrl = `${API_BASE_URL}/api/game/questionsbyround/roundNumber/1`;

        const response = await fetch(questionsUrl, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        if (response.status === 401 || response.status === 403) {
          console.error("Authentication failed:", response.status);
          toast.error("Authentication failed. Please login again.");
          removeTokenCookie();
          router.push("/login");
          return;
        }

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Questions API error:", response.status, errorText);
          throw new Error(`Failed to fetch questions: ${response.status}`);
        }

        const responseData = await response.json();

        if (responseData.success) {
          // The API returns the data directly in the data array, not in data.questions
          const data = responseData.data;

          if (Array.isArray(data)) {
            // Transform the questions to match our expected format
            const transformedQuestions: Question[] = data.map((q) => ({
              id: q.questionNumber,
              content: q.content,
              imageUrl: q.media?.image
                ? `${API_BASE_URL}${q.media.image.url}`
                : null,
              hints: q.hints || [],
              // Important: Check both isAnswered AND isSkipped properties
              isAnswered: q.isAnswered || false,
              points: q.points || 0,
            }));

            // Set current score (only count points from questions marked as answered)
            const answeredQuestions = transformedQuestions.filter(
              (q) => q.isAnswered
            );
            const totalPoints = answeredQuestions.reduce(
              (sum, q) => sum + q.points,
              0
            );
            setScore(totalPoints);

            // Check if all questions are answered
            const allAnswered = transformedQuestions.every((q) => q.isAnswered);
            setAllQuestionsAnswered(allAnswered);

            // If all questions are answered, show results
            if (allAnswered && roundActive) {
              setShowResults(true);
              setRoundActive(false);
              toast.success("All questions answered correctly!");
              // Redirect to home after 3 seconds
              setTimeout(() => {
                router.push("/");
              }, 3000);
            } else {
              // Find the first unanswered question
              const firstUnansweredIndex = transformedQuestions.findIndex(
                (q) => !q.isAnswered
              );

              if (firstUnansweredIndex !== -1) {
                setCurrentQuestionIndex(firstUnansweredIndex);
              }
            }

            setQuestions(transformedQuestions);
          }
        }
      } catch (error) {
        console.error("Error fetching questions:", error);
        toast.error("Failed to load questions");
      } finally {
        setIsLoading(false);
      }
    };

    if (roundActive) {
      fetchQuestions();
    } else {
      setIsLoading(false);
    }
  }, [roundActive, router]);

  // Timer countdown
  useEffect(() => {
    if (!roundActive || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          toast.warning("Time's up! Round has ended.");
          setRoundActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [roundActive, timeLeft]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!roundActive) {
      toast.error("This round is not active");
      return;
    }

    if (!userAnswer.trim()) {
      toast.error("Please enter an answer");
      return;
    }

    // Get current question
    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) {
      toast.error("Question not found");
      return;
    }

    // Check if the question has already been answered
    if (currentQuestion.isAnswered) {
      toast.info("This question has already been answered correctly");

      // Find next unanswered question
      const nextUnansweredIndex = questions.findIndex(
        (q, idx) => idx > currentQuestionIndex && !q.isAnswered
      );

      if (nextUnansweredIndex !== -1) {
        setCurrentQuestionIndex(nextUnansweredIndex);
        resetState();
      }
      return;
    }

    try {
      // Get token from cookie
      const token = getTokenFromCookie();
      if (!token) {
        console.error("No auth token found");
        toast.error("Authentication required");
        router.push("/login");
        return;
      }

      // Log the payload for debugging
      const payload = {
        roundNumber: 1,
        questionNumber: currentQuestion.id,
        answer: userAnswer.trim(),
      };

      const response = await fetch(`${API_BASE_URL}/api/game/submit-answer`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 401 || response.status === 403) {
        console.error("Authentication failed:", response.status);
        toast.error("Authentication failed. Please login again.");
        removeTokenCookie();
        router.push("/login");
        return;
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Answer submission error:", response.status, errorText);
        throw new Error(`Failed to submit answer: ${response.status}`);
      }

      const data: AnswerResponse = await response.json();

      if (!data.success) {
        if (data.message === "This round is not active") {
          setRoundActive(false);
          toast.error("This round is no longer active");
        } else if (data.message === "Question already answered correctly") {
          toast.info("You've already answered this question correctly");

          // Mark the question as answered
          setQuestions((prev) =>
            prev.map((q) =>
              q.id === currentQuestion.id ? { ...q, isAnswered: true } : q
            )
          );

          // Find next unanswered question
          const nextUnansweredIndex = questions.findIndex(
            (q, idx) => idx > currentQuestionIndex && !q.isAnswered
          );

          if (nextUnansweredIndex !== -1) {
            setCurrentQuestionIndex(nextUnansweredIndex);
            resetState();
          }
        } else {
          toast.error(data.message || "Error submitting answer");
        }
        return;
      }

      if (data.data?.isCorrect) {
        // Correct answer
        setIsCorrect(true);
        const pointsEarned = data.data.pointsEarned;

        // Update questions state to mark this as answered
        setQuestions((prev) => {
          const updatedQuestions = prev.map((q) =>
            q.id === currentQuestion.id
              ? { ...q, isAnswered: true, points: pointsEarned }
              : q
          );

          // Check if all questions are now answered
          const allAnswered = updatedQuestions.every((q) => q.isAnswered);
          if (allAnswered) {
            setAllQuestionsAnswered(true);
            // Show results and redirect to home after delay
            setTimeout(() => {
              setShowResults(true);
              toast.success("All questions answered correctly!");
              setTimeout(() => {
                router.push("/");
              }, 3000);
            }, 2000);
          }

          return updatedQuestions;
        });

        setScore((prev) => prev + pointsEarned);
        setFeedbackMessage(`Correct! +${pointsEarned} points`);

        // Move to next question after 2 seconds if not all questions are answered
        setTimeout(() => {
          if (!allQuestionsAnswered) {
            const nextQuestionNum = data.data?.nextQuestion;

            // First try to find the question with the nextQuestion ID
            const nextQuestionIndex = questions.findIndex(
              (q) => q.id === nextQuestionNum
            );

            if (
              nextQuestionIndex !== -1 &&
              nextQuestionIndex < questions.length
            ) {
              setCurrentQuestionIndex(nextQuestionIndex);
              resetState();
            } else {
              // If that fails, try to find any unanswered question
              const anyUnansweredIndex = questions.findIndex(
                (q) => !q.isAnswered
              );
              if (anyUnansweredIndex !== -1) {
                setCurrentQuestionIndex(anyUnansweredIndex);
                resetState();
              } else {
                // All questions completed
                setFeedbackMessage("All challenges completed!");
              }
            }
          }
        }, 2000);
      } else {
        // Wrong answer
        setFeedbackMessage("Incorrect answer. Try again or use a hint.");
        setTimeout(() => setFeedbackMessage(""), 2000);
      }
    } catch (error) {
      console.error("Error submitting answer:", error);
      toast.error("Error submitting answer. Please try again.");
    }
  };

  const resetState = () => {
    setUserAnswer("");
    setShowHint(false);
    setCurrentHintIndex(0);
    setIsCorrect(false);
    setFeedbackMessage("");
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      resetState();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
      resetState();
    }
  };

  const showNextHint = () => {
    const currentQuestion = questions[currentQuestionIndex];
    if (
      currentQuestion &&
      currentHintIndex < currentQuestion.hints.length - 1
    ) {
      setCurrentHintIndex((prev) => prev + 1);
    }
    setShowHint(true);
  };

  const goBackToDashboard = () => {
    router.push("/");
  };

  // Render appropriate screen based on game state
  if (isLoading) {
    return <LoadingScreen />;
  }

  if (allQuestionsAnswered && !showResults) {
    return (
      <RoundNotActiveScreen
        onClick={goBackToDashboard}
        round={currentRound}
        isCompleted={true}
      />
    );
  }

  if (!roundActive && !showResults) {
    return (
      <RoundNotActiveScreen onClick={goBackToDashboard} round={currentRound} />
    );
  }

  if (showResults) {
    return (
      <ResultsScreen score={score} onBackToDashboard={goBackToDashboard} />
    );
  }

  // Render game screen
  return (
    <>
      <Toaster position="top-right" richColors />
      <GameScreen
        teamData={teamData}
        questions={questions}
        currentQuestionIndex={currentQuestionIndex}
        userAnswer={userAnswer}
        setUserAnswer={setUserAnswer}
        showHint={showHint}
        setShowHint={setShowHint}
        currentHintIndex={currentHintIndex}
        timeLeft={timeLeft}
        isCorrect={isCorrect}
        score={score}
        feedbackMessage={feedbackMessage}
        handleSubmit={handleSubmit}
        handleNext={handleNext}
        handlePrevious={handlePrevious}
        showNextHint={showNextHint}
        goBackToDashboard={goBackToDashboard}
      />
    </>
  );
};

export default AICharades;
