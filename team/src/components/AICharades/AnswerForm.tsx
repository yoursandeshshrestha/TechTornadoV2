"use client";

import React from "react";
import { ArrowLeft, ArrowRight, Lightbulb, Zap, Database } from "lucide-react";

interface AnswerFormProps {
  userAnswer: string;
  setUserAnswer: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isCorrect: boolean;
  isAnswered: boolean;
  onShowHint: (show: boolean) => void;
  showHint: boolean;
  onPrevious: () => void;
  onNext: () => void;
  currentQuestionIndex: number;
  totalQuestions: number;
}

const AnswerForm: React.FC<AnswerFormProps> = ({
  userAnswer,
  setUserAnswer,
  onSubmit,
  isCorrect,
  isAnswered,
  onShowHint,
  showHint,
  onPrevious,
  onNext,
  currentQuestionIndex,
  totalQuestions,
}) => {
  return (
    <div className="bg-black/60 backdrop-blur-md rounded-lg border-2 border-purple-500/30 p-6 flex flex-col shadow-[0_0_20px_rgba(168,85,247,0.2)]">
      <h2 className="text-2xl font-mono font-bold text-purple-400 mb-6 flex items-center gap-3 justify-center">
        Show Us What You’ve Got?
      </h2>

      <form onSubmit={onSubmit} className="space-y-6 flex-grow flex flex-col">
        <div className="flex gap-3 max-w-lg mx-auto">
          <div className="relative flex-1">
            <input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder={
                isAnswered ? "You got the +1 point" : "Enter your answer..."
              }
              className={`w-full px-5 py-4 bg-black/70 border-2 border-purple-500/30 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-xl text-gray-300 placeholder-gray-500 font-mono shadow-[inset_0_0_15px_rgba(168,85,247,0.1)] ${
                isAnswered ? "opacity-70" : ""
              }`}
              disabled={isCorrect || isAnswered}
            />
          </div>
          <button
            type="button"
            onClick={() => onShowHint(!showHint)}
            className="px-4 text-yellow-400 hover:bg-black/50 rounded-lg transition-colors border-2 border-yellow-500/30 shadow-[0_0_10px_rgba(234,179,8,0.2)]"
          >
            <Lightbulb className="h-8 w-8 filter drop-shadow-[0_0_8px_rgba(253,224,71,0.5)]" />
          </button>
        </div>

        {/* Navigation and Submit Buttons */}
        <div className="flex items-center justify-center gap-6 pt-8 max-w-lg mx-auto">
          <button
            type="button"
            onClick={onPrevious}
            disabled={currentQuestionIndex === 0}
            className={`px-5 py-3 rounded-lg flex items-center ${
              currentQuestionIndex === 0
                ? "text-gray-600 bg-gray-800/50 cursor-not-allowed"
                : "text-blue-400 bg-black/50 hover:bg-blue-900/30 border-2 border-blue-500/30 hover:shadow-[0_0_10px_rgba(59,130,246,0.3)] transition-all duration-300"
            }`}
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            Previous
          </button>

          <button
            type="submit"
            disabled={isCorrect || isAnswered}
            className={`px-10 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-medium rounded-lg hover:from-cyan-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] border-2 border-cyan-500/40 relative overflow-hidden group ${
              isCorrect || isAnswered ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <span className="relative z-10 flex items-center justify-center font-mono text-lg">
              <Zap className="h-6 w-6 mr-2 group-hover:animate-pulse" />
              PROCESS
            </span>
            <span className="absolute inset-0 bg-gradient-to-r from-cyan-600/50 to-blue-600/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
          </button>

          <button
            type="button"
            onClick={onNext}
            disabled={currentQuestionIndex === totalQuestions - 1}
            className={`px-5 py-3 rounded-lg flex items-center ${
              currentQuestionIndex === totalQuestions - 1
                ? "text-gray-600 bg-gray-800/50 cursor-not-allowed"
                : "text-blue-400 bg-black/50 hover:bg-blue-900/30 border-2 border-blue-500/30 hover:shadow-[0_0_10px_rgba(59,130,246,0.3)] transition-all duration-300"
            }`}
          >
            Next
            <ArrowRight className="h-5 w-5 ml-1" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default AnswerForm;
