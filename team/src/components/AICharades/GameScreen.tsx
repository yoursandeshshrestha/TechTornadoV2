"use client";

import React from "react";
import GameHeader from "./GameHeader";
import QuestionCard from "./QuestionCard";
import AnswerForm from "./AnswerForm";
import BackgroundEffects from "./BackgroundEffects";
import { BackToDashboardButton } from "./GameScreens";
import { Question, TeamData } from "@/types/game";

interface GameScreenProps {
  teamData: TeamData | null;
  questions: Question[];
  currentQuestionIndex: number;
  userAnswer: string;
  setUserAnswer: (value: string) => void;
  showHint: boolean;
  setShowHint: (show: boolean) => void;
  currentHintIndex: number;
  timeLeft: number;
  isCorrect: boolean;
  score: number;
  feedbackMessage: string;
  handleSubmit: (e: React.FormEvent) => void;
  handleNext: () => void;
  handlePrevious: () => void;
  showNextHint: () => void;
  goBackToDashboard: () => void;
}

const GameScreen: React.FC<GameScreenProps> = ({
  teamData,
  questions,
  currentQuestionIndex,
  userAnswer,
  setUserAnswer,
  showHint,
  setShowHint,
  currentHintIndex,
  timeLeft,
  isCorrect,
  score,
  feedbackMessage,
  handleSubmit,
  handleNext,
  handlePrevious,
  showNextHint,
  goBackToDashboard,
}) => {
  const currentQuestion = questions[currentQuestionIndex] || ({} as Question);

  return (
    <div className="min-h-screen bg-[url('https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80')] bg-cover bg-center  overflow-hidden">
      {/* Futuristic overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 via-purple-900/70 to-black/90 backdrop-blur-sm z-0"></div>

      {/* Background effects */}
      <BackgroundEffects />

      {/* Game Header */}
      <GameHeader
        teamName={teamData?.teamName}
        score={score}
        timeLeft={timeLeft}
      />

      {/* Main Content Cards */}
      <div className="relative z-10 max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-180px)] items-center">
        {/* Question Content */}
        <QuestionCard
          currentQuestion={currentQuestion}
          questionIndex={currentQuestionIndex}
          totalQuestions={questions.length}
          showHint={showHint}
          currentHintIndex={currentHintIndex}
          onShowNextHint={showNextHint}
          feedbackMessage={feedbackMessage}
          isCorrect={isCorrect}
        />

        {/* Answer Form */}
        <AnswerForm
          userAnswer={userAnswer}
          setUserAnswer={setUserAnswer}
          onSubmit={handleSubmit}
          isCorrect={isCorrect}
          isAnswered={!!currentQuestion.isAnswered}
          onShowHint={setShowHint}
          showHint={showHint}
          onPrevious={handlePrevious}
          onNext={handleNext}
          currentQuestionIndex={currentQuestionIndex}
          totalQuestions={questions.length}
        />
      </div>

      {/* Back to dashboard button */}
      <BackToDashboardButton onClick={goBackToDashboard} />
    </div>
  );
};

export default GameScreen;
