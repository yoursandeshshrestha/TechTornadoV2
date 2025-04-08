"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  KeyRound,
  AlertTriangle,
  Lightbulb,
  Check,
  Hash,
} from "lucide-react";
import GameHeader from "./GameHeader";
import { submitAnswer } from "@/utils/apiService";

// ✅ Internal type definition
export interface SimpleChallengeProps {
  challenge: {
    id: number;
    title: string;
    description: string;
    hint: string;
    answer: string;
  };
  totalQuestions: number;
}

const SimpleChallenge: React.FC<SimpleChallengeProps> = ({
  challenge,
  totalQuestions,
}) => {
  const [userAnswer, setUserAnswer] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [pointsEarned, setPointsEarned] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // ✅ Check localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isCompleted =
        localStorage.getItem(`simple-challenge-${challenge.id}-completed`) ===
        "true";

      if (isCompleted) {
        setSuccess(true);
        setUserAnswer(
          localStorage.getItem(`simple-challenge-${challenge.id}-answer`) ||
            challenge.answer
        );
        setPointsEarned(
          Number(
            localStorage.getItem(`simple-challenge-${challenge.id}-points`)
          ) || 0
        );
      }
    }
  }, [challenge.id, challenge.answer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting || success) return;
    setIsSubmitting(true);

    try {
      const response = await submitAnswer(challenge.id, userAnswer);

      if (response.success && response.data) {
        if (response.data.isCorrect) {
          const earnedPoints = response.data.pointsEarned;
          setPointsEarned(earnedPoints);
          setSuccess(true);
          setUserAnswer(challenge.answer);

          // ✅ Save to localStorage
          localStorage.setItem(
            `simple-challenge-${challenge.id}-completed`,
            "true"
          );
          localStorage.setItem(
            `simple-challenge-${challenge.id}-answer`,
            challenge.answer
          );
          localStorage.setItem(
            `simple-challenge-${challenge.id}-points`,
            earnedPoints.toString()
          );
        } else {
          setErrorMessage("Incorrect answer. Try again.");
          setTimeout(() => setErrorMessage(""), 3000);
        }
      } else {
        setErrorMessage(
          response.message || "Error submitting answer. Please try again."
        );
        setTimeout(() => setErrorMessage(""), 3000);
      }
    } catch (error) {
      console.error("Error submitting answer:", error);
      setErrorMessage("Error submitting answer. Please try again.");
      setTimeout(() => setErrorMessage(""), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrevious = () => {
    if (challenge.id > 1) {
      router.push(`/challenges/crack-the-password/${challenge.id - 1}`);
    } else {
      router.push("/challenges");
    }
  };

  const handleNext = () => {
    if (challenge.id < totalQuestions) {
      router.push(`/challenges/crack-the-password/${challenge.id + 1}`);
    } else {
      router.push("/challenges");
    }
  };

  return (
    <div>
      <GameHeader
        title={challenge.title}
        currentQuestionNumber={challenge.id}
        totalQuestions={totalQuestions}
      />

      {/* Main Content */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Challenge Description */}
        <div className="bg-gray-900/80 backdrop-blur-md rounded-lg border border-blue-500/30 p-6 flex flex-col">
          <h2 className="text-xl font-mono font-bold text-blue-400 mb-4 flex items-center gap-2">
            <Hash className="h-5 w-5" />
            Question {challenge.id}
          </h2>

          <div className="flex-grow">
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <p className="text-white font-mono">{challenge.description}</p>
            </div>
          </div>
        </div>

        {/* Answer Entry */}
        <div className="bg-gray-900/80 backdrop-blur-md rounded-lg border border-blue-500/30 p-6 flex flex-col">
          <h2 className="text-xl font-mono font-bold text-blue-400 mb-4 flex items-center gap-2">
            <KeyRound className="h-5 w-5" />
            Enter Answer
          </h2>

          {showHint && (
            <div className="bg-yellow-900/30 border border-yellow-500/30 rounded-lg p-4 mb-6 text-yellow-300 flex items-start gap-2 animate-fade-in">
              <Lightbulb className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <p className="text-sm font-mono">{challenge.hint}</p>
            </div>
          )}

          {errorMessage && (
            <div className="bg-red-900/30 border border-red-500/30 rounded-lg p-4 mb-6 text-red-300 flex items-start gap-2 animate-fade-in">
              <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <p className="text-sm font-mono">{errorMessage}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-900/30 border border-green-500/30 rounded-lg p-4 mb-6 text-green-300 flex items-start gap-2 animate-fade-in">
              <Check className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div className="text-sm font-mono">
                <p className="font-bold">CHALLENGE COMPLETED!</p>
                <p>You successfully solved the {challenge.title} challenge!</p>
                <p className="mt-2">Points earned: {pointsEarned}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-auto">
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={userAnswer}
                  onChange={(e) => !success && setUserAnswer(e.target.value)}
                  placeholder="Enter your answer..."
                  className={`flex-1 px-4 py-3 bg-gray-800 border ${
                    success
                      ? "border-green-500 text-green-400 cursor-not-allowed"
                      : "border-gray-700 text-blue-400"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xl placeholder-gray-500 font-mono text-center tracking-widest shadow-inner`}
                  disabled={success}
                  readOnly={success}
                />
                <button
                  type="button"
                  onClick={() => setShowHint(!showHint)}
                  className={`px-3 text-yellow-500 hover:bg-gray-800 rounded-lg transition-colors ${
                    success ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  disabled={success}
                >
                  <Lightbulb className="h-6 w-6" />
                </button>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || success}
                className={`w-full px-8 py-3 ${
                  success
                    ? "bg-gradient-to-r from-green-600 to-emerald-600"
                    : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                } text-white font-medium rounded-lg transition-all duration-300 shadow-lg hover:shadow-blue-500/25 border border-blue-500/20 relative overflow-hidden group disabled:opacity-70 disabled:cursor-not-allowed`}
              >
                <span className="relative z-10 flex items-center justify-center font-mono">
                  {success ? (
                    <>
                      <Check className="h-5 w-5 mr-2" />
                      CORRECT ANSWER!
                    </>
                  ) : isSubmitting ? (
                    "SUBMITTING..."
                  ) : (
                    <>
                      <Check className="h-5 w-5 mr-2 group-hover:animate-pulse" />
                      SUBMIT ANSWER
                    </>
                  )}
                </span>
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Challenge {challenge.id} of {totalQuestions}
            </p>
            <div className="flex justify-center mt-2 space-x-1">
              {Array.from({ length: totalQuestions }).map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index + 1 === challenge.id ? "bg-blue-500" : "bg-gray-600"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-6 max-w-4xl mx-auto">
        <button
          onClick={handlePrevious}
          className="px-4 py-2 bg-gray-800/80 hover:bg-gray-700/80 text-white rounded-md transition-colors duration-300 flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Previous
        </button>
        <button
          onClick={handleNext}
          className={`px-4 py-2 ${
            success
              ? "bg-green-700/80 hover:bg-green-600/80"
              : "bg-gray-800/80 hover:bg-gray-700/80"
          } text-white rounded-md transition-colors duration-300 flex items-center gap-2`}
        >
          Next
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default SimpleChallenge;
