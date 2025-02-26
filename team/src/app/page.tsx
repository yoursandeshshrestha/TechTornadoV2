"use client";

import React, { useState } from "react";
import { Wind, ArrowRight, LogOut, Award, User, BookOpen } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { Toaster, toast } from "sonner";
import { Challenge } from "@/types/types";
import { InstructionModal } from "@/components/InstructionModal";

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

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
  };

  // Function to get the appropriate button color based on challenge color
  const getButtonColor = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: "bg-blue-600 hover:bg-blue-700",
      purple: "bg-purple-600 hover:bg-purple-700",
      indigo: "bg-indigo-600 hover:bg-indigo-700",
      // Add more color mappings as needed
    };
    return colorMap[color] || "bg-gray-600 hover:bg-gray-700";
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
      <div className="absolute inset-0 bg-grid-slate-200 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.5))] -z-20" />

      {/* Gradient Orbs */}
      <div className="absolute top-0 -left-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob" />
      <div className="absolute top-20 -right-40 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-40 left-20 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000" />

      {/* Header */}
      <header className="px-8 py-6 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <Wind className="h-8 w-8 text-blue-600" />
          <span className="font-bold text-2xl bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            Tech Tornado
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <User className="h-5 w-5 text-gray-600" />
            <span className="font-medium text-gray-800">
              {teamData?.teamName || "Team Dashboard"}
            </span>
          </div>
          {/* Proper styled logout button - Link wrapper added for larger hit box */}
          <button
            onClick={handleLogout}
            className="flex items-center justify-center space-x-2 px-4 py-2 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 hover:text-red-600 transition-colors shadow-sm hover:shadow group"
          >
            <LogOut className="h-5 w-5 group-hover:text-red-600 transition-colors" />
            <span className="font-medium group-hover:text-red-600 transition-colors">
              Logout
            </span>
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
                {/* Background gradient with static classes */}
                <div
                  className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
                    challenge.color === "blue"
                      ? "bg-gradient-to-br from-blue-50 to-blue-100"
                      : challenge.color === "purple"
                      ? "bg-gradient-to-br from-purple-50 to-purple-100"
                      : "bg-gradient-to-br from-indigo-50 to-indigo-100"
                  }`}
                />
                <div className="relative p-6 flex flex-col h-[320px]">
                  {/* Icon background with static classes */}
                  <div
                    className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500 ${
                      challenge.color === "blue"
                        ? "bg-blue-100/80"
                        : challenge.color === "purple"
                        ? "bg-purple-100/80"
                        : "bg-indigo-100/80"
                    }`}
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
                          className={`w-full flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl text-white ${getButtonColor(
                            challenge.color
                          )}`}
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
