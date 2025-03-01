"use client";

import React from "react";
import { Cpu, Sparkles, HelpCircle, Star } from "lucide-react";
import { Question } from "@/types/game";

interface QuestionContentProps {
  question: Question;
}

interface HintSectionProps {
  showHint: boolean;
  hints?: string[];
  currentHintIndex: number;
  onShowNextHint: () => void;
}

interface FeedbackMessageProps {
  message: string;
  isCorrect: boolean;
}

interface QuestionCardProps {
  currentQuestion: Question;
  questionIndex: number;
  totalQuestions: number;
  showHint: boolean;
  currentHintIndex: number;
  onShowNextHint: () => void;
  feedbackMessage: string;
  isCorrect: boolean;
}

// Question Content Component
const QuestionContent: React.FC<QuestionContentProps> = ({ question }) => {
  if (question.imageUrl) {
    return (
      <div className="relative group mb-6 flex justify-center">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
        <div className="relative max-w-md mx-auto">
          <img
            src={question.imageUrl}
            alt="AI Generated Image"
            className="w-full h-64 object-cover rounded-lg shadow-lg border-2 border-blue-500/30"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="text-2xl text-white font-medium text-center py-16 px-8 bg-gradient-to-br from-blue-900/30 to-purple-900/30 rounded-xl border-2 border-blue-500/30 shadow-[inset_0_0_20px_rgba(59,130,246,0.2)] mb-6 max-w-md mx-auto">
      <Sparkles className="inline-block h-8 w-8 text-cyan-400 mr-2 mb-1" />
      {question.content || ""}
    </div>
  );
};

// Hint Section Component
const HintSection: React.FC<HintSectionProps> = ({
  showHint,
  hints,
  currentHintIndex,
  onShowNextHint,
}) => {
  if (!showHint || !hints || hints.length === 0) return null;

  return (
    <div className="bg-black/70 border-2 border-purple-500/30 rounded-lg p-4 mb-4 text-gray-300 space-y-2 shadow-[inset_0_0_15px_rgba(168,85,247,0.2)]">
      <div className="flex items-center gap-2">
        <HelpCircle className="h-4 w-4 text-purple-400" />
        <h3 className="font-mono font-bold text-purple-400">HINTS:</h3>
      </div>
      <ul className="list-disc pl-5 space-y-1">
        {hints.slice(0, currentHintIndex + 1).map((hint, index) => (
          <li key={index} className="text-sm">
            {hint}
          </li>
        ))}
      </ul>
      {currentHintIndex < hints.length - 1 && (
        <button
          onClick={onShowNextHint}
          className="text-xs text-purple-400 hover:text-purple-300 underline mt-2"
        >
          Show more hints
        </button>
      )}
    </div>
  );
};

// Feedback Message Component
const FeedbackMessage: React.FC<FeedbackMessageProps> = ({
  message,
  isCorrect,
}) => {
  if (!message) return null;

  return (
    <div
      className={`mt-auto rounded-lg p-3 flex items-start gap-2 animate-fade-in ${
        isCorrect
          ? "bg-green-900/30 border-2 border-green-500/30 text-green-400"
          : "bg-red-900/30 border-2 border-red-500/30 text-red-400"
      }`}
    >
      {isCorrect ? (
        <Star className="h-4 w-4 mt-0.5 flex-shrink-0" />
      ) : (
        <HelpCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
      )}
      <p className="text-sm">{message}</p>
    </div>
  );
};

// Main Question Card Component
const QuestionCard: React.FC<QuestionCardProps> = ({
  currentQuestion,
  questionIndex,
  totalQuestions,
  showHint,
  currentHintIndex,
  onShowNextHint,
  feedbackMessage,
  isCorrect,
}) => {
  return (
    <div className="bg-black/60 backdrop-blur-md rounded-lg border-2 border-blue-500/30 p-6 flex flex-col shadow-[0_0_20px_rgba(59,130,246,0.2)]">
      <h2 className="text-2xl font-mono font-bold text-blue-400 mb-6 flex items-center gap-3 justify-center">
        <Cpu className="h-6 w-6" />
        Question no {questionIndex + 1}/{totalQuestions}
        {currentQuestion.isAnswered && (
          <span className="text-sm bg-green-500/20 text-green-300 px-2 py-1 rounded-md ml-2">
            Completed
          </span>
        )}
      </h2>

      <div className="flex-grow flex flex-col">
        <QuestionContent question={currentQuestion} />

        <HintSection
          showHint={showHint}
          hints={currentQuestion.hints}
          currentHintIndex={currentHintIndex}
          onShowNextHint={onShowNextHint}
        />

        <FeedbackMessage message={feedbackMessage} isCorrect={isCorrect} />
      </div>
    </div>
  );
};

export default QuestionCard;
