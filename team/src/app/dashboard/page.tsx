"use client";

import React, { useState } from "react";
import { Wind, ArrowRight, LogOut, Award, User, BookOpen } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { Toaster, toast } from "sonner";

interface Challenge {
  id: string;
  title: string;
  description: string;
  icon: JSX.Element;
  color: string;
  isUnlocked: boolean;
}

interface InstructionModalProps {
  isOpen: boolean;
  onClose: () => void;
  challenge: Challenge;
}

// Instructions modal component
const InstructionModal = ({
  isOpen,
  onClose,
  challenge,
}: InstructionModalProps) => {
  if (!isOpen) return null;

  // Different instructions based on the challenge
  const getInstructions = () => {
    switch (challenge.id) {
      case "ai-charades":
        return (
          <>
            <h2 className="text-xl font-semibold mb-4">
              Welcome to AI_Charades!
            </h2>
            <div className="space-y-2">
              <p>
                <strong>Game Rules:</strong>
              </p>
              <ol className="list-decimal pl-5 space-y-1">
                <li>
                  You will be shown AI-generated images that represent common
                  words or phrases
                </li>
                <li>
                  Your team needs to guess the correct word within the time
                  limit
                </li>
                <li>
                  Each correct guess earns points based on how quickly you
                  answer
                </li>
                <li>You have 3 attempts per image</li>
                <li>
                  Hints will be available but using them reduces the points you
                  can earn
                </li>
              </ol>

              <p className="mt-4">
                <strong>Scoring:</strong>
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Quick correct answer (within 30s): 100 points</li>
                <li>Correct answer (30s-60s): 75 points</li>
                <li>Correct answer with hint: 50 points</li>
                <li>Incorrect attempts: -10 points each</li>
              </ul>

              <p className="mt-4">
                <strong>Tips:</strong>
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Look for obvious patterns and shapes in the images</li>
                <li>Consider both literal and metaphorical interpretations</li>
                <li>Discuss with your teammate before submitting an answer</li>
                <li>Use hints strategically when stuck</li>
              </ul>
            </div>
          </>
        );
      case "crack-password":
        return (
          <>
            <h2 className="text-xl font-semibold mb-4">
              Welcome to Crack the Password!
            </h2>
            <div className="space-y-2">
              <p>
                A challenging cryptography game where you'll need to decode
                encrypted messages and find the hidden passwords.
              </p>

              <p className="mt-4">
                <strong>This challenge is currently locked.</strong>
              </p>
              <p>Complete AI_Charades first to unlock this challenge.</p>
            </div>
          </>
        );
      case "escape-trap":
        return (
          <>
            <h2 className="text-xl font-semibold mb-4">
              Welcome to Escape the Trap!
            </h2>
            <div className="space-y-2">
              <p>
                Navigate through a series of logical puzzles and programming
                challenges to escape the digital maze.
              </p>

              <p className="mt-4">
                <strong>This challenge is currently locked.</strong>
              </p>
              <p>
                Complete previous challenges first to unlock Escape the Trap.
              </p>
            </div>
          </>
        );
      default:
        return <p>No instructions available for this challenge.</p>;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">{challenge.title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="mt-4 text-gray-700">{getInstructions()}</div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            Close
          </button>

          {challenge.isUnlocked && (
            <Link href={`/challenges/${challenge.id}`}>
              <button
                className={`px-4 py-2 rounded bg-${challenge.color}-600 text-white hover:bg-${challenge.color}-700 flex items-center`}
              >
                Enter Game
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default function Dashboard() {
  const { isLoading, teamData, logout } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(
    null
  );

  const challenges: Challenge[] = [
    {
      id: "ai-charades",
      title: "AI_Charades",
      description:
        "Decode the AI-generated images and guess the hidden words. Use your visual perception and AI knowledge to score points!",
      icon: <Wind className="w-7 h-7 text-blue-600" />,
      color: "blue",
      isUnlocked: true,
    },
    {
      id: "crack-password",
      title: "Crack the Password",
      description:
        "A challenging cryptography game where you'll need to decode encrypted messages and find the hidden passwords.",
      icon: <BookOpen className="w-7 h-7 text-purple-600" />,
      color: "purple",
      isUnlocked: false,
    },
    {
      id: "escape-trap",
      title: "Escape the Trap",
      description:
        "Navigate through a series of logical puzzles and programming challenges to escape the digital maze.",
      icon: <Award className="w-7 h-7 text-indigo-600" />,
      color: "indigo",
      isUnlocked: false,
    },
  ];

  const openInstructions = (challenge: Challenge) => {
    setSelectedChallenge(challenge);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  // Handle logout click
  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden relative">
      {/* Toaster component */}
      <Toaster position="top-right" richColors />

      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-slate-200 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.5))] -z-10" />

      {/* Gradient Orbs */}
      <div className="absolute top-0 -left-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob" />
      <div className="absolute top-0 -right-40 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-40 left-20 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000" />

      {/* Header */}
      <header className="px-8 py-6 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <Wind className="h-8 w-8 text-blue-600" />
          <span className="font-bold text-2xl bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            Tech Tornado
          </span>
        </div>
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <User className="h-5 w-5 text-gray-600" />
            <span className="font-medium text-gray-800">
              {teamData?.teamName || "Team Dashboard"}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-1 text-gray-600 hover:text-red-600 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Game Dashboard
          </h1>
          <p className="text-gray-600 mb-8">Choose a challenge to begin</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {challenges.map((challenge) => (
              <div
                key={challenge.id}
                className={`group relative bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 ring-1 ring-black/[0.08] ${
                  !challenge.isUnlocked
                    ? "opacity-75 cursor-not-allowed"
                    : "cursor-pointer"
                }`}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br from-${challenge.color}-50 to-${challenge.color}-100 opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                />
                <div className="relative p-6 flex flex-col h-[320px]">
                  <div
                    className={`bg-${challenge.color}-100/80 w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500`}
                  >
                    {challenge.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {challenge.title}
                  </h3>
                  <p className="text-gray-600 flex-grow">
                    {challenge.description}
                  </p>

                  <div className="flex space-x-3 mt-4">
                    <button
                      onClick={() => openInstructions(challenge)}
                      className="flex-1 flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Instructions
                    </button>

                    {challenge.isUnlocked ? (
                      <Link
                        href={`/challenges/${challenge.id}`}
                        className="flex-1"
                      >
                        <button
                          className={`w-full flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl text-white bg-${challenge.color}-600 hover:bg-${challenge.color}-700`}
                        >
                          Enter
                          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                        </button>
                      </Link>
                    ) : (
                      <button
                        disabled
                        className="flex-1 flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl text-white bg-gray-400 cursor-not-allowed"
                      >
                        Enter
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Instructions Modal */}
      {selectedChallenge && (
        <InstructionModal
          isOpen={modalOpen}
          onClose={closeModal}
          challenge={selectedChallenge}
        />
      )}
    </div>
  );
}
