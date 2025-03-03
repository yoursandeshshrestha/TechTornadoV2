"use client";

import React, { useState } from "react";
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
import { SimpleChallenge as SimpleChallengeType } from "@/data/round2QuestionData";
import GameHeader from "./GameHeader";
import SuccessScreen from "./SuccessScreen";
import { submitAnswer } from "@/utils/apiService";

interface SimpleChallengeProps {
  challenge: SimpleChallengeType;
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const response = await submitAnswer(challenge.id, userAnswer);

      if (response.success && response.data) {
        if (response.data.isCorrect) {
          setPointsEarned(response.data.pointsEarned);
          setSuccess(true);
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

  if (success) {
    return (
      <SuccessScreen
        title="CHALLENGE SOLVED!"
        message={`You successfully solved the ${challenge.title} challenge!`}
        currentQuestion={challenge.id}
        totalQuestions={totalQuestions}
        pointsEarned={pointsEarned}
      />
    );
  }

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

          <form onSubmit={handleSubmit} className="mt-auto">
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Enter your answer..."
                  className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xl text-blue-400 placeholder-gray-500 font-mono text-center tracking-widest shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setShowHint(!showHint)}
                  className="px-3 text-yellow-500 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <Lightbulb className="h-6 w-6" />
                </button>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-blue-500/25 border border-blue-500/20 relative overflow-hidden group disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <span className="relative z-10 flex items-center justify-center font-mono">
                  <Check className="h-5 w-5 mr-2 group-hover:animate-pulse" />
                  {isSubmitting ? "SUBMITTING..." : "SUBMIT ANSWER"}
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-blue-600/50 to-indigo-600/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              </button>
            </div>
          </form>
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
          className="px-4 py-2 bg-gray-800/80 hover:bg-gray-700/80 text-white rounded-md transition-colors duration-300 flex items-center gap-2"
        >
          Next
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default SimpleChallenge;
