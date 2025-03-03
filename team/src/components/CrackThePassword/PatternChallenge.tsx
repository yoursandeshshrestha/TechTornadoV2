"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  KeyRound,
  AlertTriangle,
  Lightbulb,
  Compass,
  Lock,
  Check,
  Hash,
} from "lucide-react";
import { PatternChallenge as PatternChallengeType } from "@/data/round2QuestionData";
import GameHeader from "./GameHeader";
import SuccessScreen from "./SuccessScreen";
import { submitAnswer } from "@/utils/apiService";

interface PatternChallengeProps {
  challenge: PatternChallengeType;
  totalQuestions: number;
}

const PatternChallenge: React.FC<PatternChallengeProps> = ({
  challenge,
  totalQuestions,
}) => {
  const [userAnswer, setUserAnswer] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [success, setSuccess] = useState(false);
  const [selectedPath, setSelectedPath] = useState<number | null>(null);
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
          setErrorMessage("Incorrect code. Try again.");
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

  const handlePathSelect = (path: number) => {
    setSelectedPath(path);
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
        title="DOOR UNLOCKED!"
        message="You successfully cracked the code and escaped the digital maze."
        currentQuestion={challenge.id}
        totalQuestions={totalQuestions}
        pointsEarned={pointsEarned}
      />
    );
  }

  return (
    <div>
      <GameHeader
        title="Digital Maze"
        currentQuestionNumber={challenge.id}
        totalQuestions={totalQuestions}
      />

      {/* Main Content */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Maze Visualization */}
        <div className="bg-gray-900/80 backdrop-blur-md rounded-lg border border-blue-500/30 p-6 flex flex-col">
          <h2 className="text-xl font-mono font-bold text-blue-400 mb-4 flex items-center gap-2">
            <Compass className="h-5 w-5" />
            Digital Maze
          </h2>

          <div className="flex-grow relative h-64 md:h-80">
            {/* Center exit door */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-20 h-20 bg-gray-800 rounded-lg border-2 border-yellow-500 flex items-center justify-center shadow-[0_0_15px_rgba(234,179,8,0.3)] relative">
                <Lock className="h-8 w-8 text-yellow-500" />
                <div className="absolute -bottom-8 text-yellow-500 font-mono text-xs">
                  EXIT
                </div>
              </div>
            </div>

            {/* Paths */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 ${
                  selectedPath === challenge.paths[0]
                    ? "bg-blue-600 border-2 border-white"
                    : "bg-gray-800 hover:bg-gray-700"
                }`}
                onClick={() => handlePathSelect(challenge.paths[0])}
              >
                <span className="font-mono text-xl font-bold text-white">
                  {challenge.paths[0]}
                </span>
              </div>
              <div className="absolute -bottom-24 -left-12 text-blue-400 font-mono text-xs">
                PATH 1
              </div>
            </div>

            <div className="absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2">
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 ${
                  selectedPath === challenge.paths[1]
                    ? "bg-blue-600 border-2 border-white"
                    : "bg-gray-800 hover:bg-gray-700"
                }`}
                onClick={() => handlePathSelect(challenge.paths[1])}
              >
                <span className="font-mono text-xl font-bold text-white">
                  {challenge.paths[1]}
                </span>
              </div>
              <div className="absolute -bottom-24 -left-12 text-blue-400 font-mono text-xs">
                PATH 2
              </div>
            </div>

            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2">
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 ${
                  selectedPath === challenge.paths[2]
                    ? "bg-blue-600 border-2 border-white"
                    : "bg-gray-800 hover:bg-gray-700"
                }`}
                onClick={() => handlePathSelect(challenge.paths[2])}
              >
                <span className="font-mono text-xl font-bold text-white">
                  {challenge.paths[2]}
                </span>
              </div>
              <div className="absolute -bottom-24 -left-12 text-blue-400 font-mono text-xs">
                PATH 3
              </div>
            </div>

            <div className="absolute top-1/2 left-0 transform -translate-x-1/2 -translate-y-1/2">
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 ${
                  selectedPath === challenge.paths[3]
                    ? "bg-blue-600 border-2 border-white"
                    : "bg-gray-800 hover:bg-gray-700"
                }`}
                onClick={() => handlePathSelect(challenge.paths[3])}
              >
                <span className="font-mono text-xl font-bold text-white">
                  {challenge.paths[3]}
                </span>
              </div>
              <div className="absolute -bottom-24 -left-12 text-blue-400 font-mono text-xs">
                PATH 4
              </div>
            </div>

            {/* Connection lines */}
            <svg
              className="absolute inset-0 w-full h-full"
              xmlns="http://www.w3.org/2000/svg"
            >
              <line
                x1="50%"
                y1="0"
                x2="50%"
                y2="50%"
                stroke="#3b82f6"
                strokeWidth="2"
                strokeDasharray="5,5"
              />
              <line
                x1="100%"
                y1="50%"
                x2="50%"
                y2="50%"
                stroke="#3b82f6"
                strokeWidth="2"
                strokeDasharray="5,5"
              />
              <line
                x1="50%"
                y1="100%"
                x2="50%"
                y2="50%"
                stroke="#3b82f6"
                strokeWidth="2"
                strokeDasharray="5,5"
              />
              <line
                x1="0"
                y1="50%"
                x2="50%"
                y2="50%"
                stroke="#3b82f6"
                strokeWidth="2"
                strokeDasharray="5,5"
              />
            </svg>
          </div>
        </div>

        {/* Password Entry */}
        <div className="bg-gray-900/80 backdrop-blur-md rounded-lg border border-blue-500/30 p-6 flex flex-col">
          <h2 className="text-xl font-mono font-bold text-blue-400 mb-4 flex items-center gap-2">
            <KeyRound className="h-5 w-5" />
            Door Lock
          </h2>

          <div className="bg-gray-800 rounded-lg p-4 mb-6 border border-gray-700">
            <div className="flex items-start gap-2">
              <Hash className="h-5 w-5 text-yellow-400 mt-1 flex-shrink-0" />
              <div>
                <p className="text-white font-mono">{challenge.description}</p>
                <div className="mt-2 flex gap-2 items-center">
                  {challenge.paths.map((num, index) => (
                    <span
                      key={index}
                      className="inline-block bg-gray-700 px-3 py-1 rounded font-mono text-yellow-400"
                    >
                      {num}
                    </span>
                  ))}
                  <span className="inline-block bg-gray-700 px-3 py-1 rounded font-mono text-yellow-400">
                    ?
                  </span>
                </div>
              </div>
            </div>
          </div>

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
                  placeholder="Enter 2-digit code..."
                  maxLength={2}
                  className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-2xl text-blue-400 placeholder-gray-500 font-mono text-center tracking-widest shadow-inner"
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
                  {isSubmitting ? "SUBMITTING..." : "UNLOCK DOOR"}
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

export default PatternChallenge;
