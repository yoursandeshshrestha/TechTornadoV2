"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  KeyRound,
  AlertTriangle,
  Lightbulb,
  Terminal,
  Check,
  Info,
} from "lucide-react";
import { TerminalChallenge as TerminalChallengeType } from "@/data/round2QuestionData";
import GameHeader from "./GameHeader";
import SuccessScreen from "./SuccessScreen";
import { submitAnswer } from "@/utils/apiService";

interface TerminalChallengeProps {
  challenge: TerminalChallengeType;
  totalQuestions: number;
}

const TerminalChallenge: React.FC<TerminalChallengeProps> = ({
  challenge,
  totalQuestions,
}) => {
  const [secretMessageInput, setSecretMessageInput] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [pointsEarned, setPointsEarned] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSecretSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const response = await submitAnswer(challenge.id, secretMessageInput);

      if (response.success && response.data) {
        if (response.data.isCorrect) {
          setPointsEarned(response.data.pointsEarned);
          setSuccess(true);
        } else {
          setErrorMessage("Incorrect secret message. Try again.");
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
        title="TERMINAL HACKED!"
        message={`You successfully decrypted the secret message!`}
        currentQuestion={challenge.id}
        totalQuestions={totalQuestions}
        pointsEarned={pointsEarned}
        secretMessage={challenge.secretMessage}
      />
    );
  }

  return (
    <div>
      <GameHeader
        title="Terminal Challenge"
        currentQuestionNumber={challenge.id}
        totalQuestions={totalQuestions}
      />

      {/* Main Content */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Terminal Visualization */}
        <div className="bg-gray-900/80 backdrop-blur-md rounded-lg border border-blue-500/30 p-6 flex flex-col">
          <h2 className="text-xl font-mono font-bold text-blue-400 mb-4 flex items-center gap-2">
            <Terminal className="h-5 w-5" />
            Challenge {challenge.id}
          </h2>

          <div className="flex-grow flex flex-col">
            <div className="bg-gray-800 rounded-lg p-4 mb-6 border border-gray-700">
              <p className="text-white font-mono">{challenge.description}</p>
            </div>

            <div className="bg-black rounded-lg p-4 mb-6 border border-gray-700 font-mono text-green-400 flex-grow">
              <div className="flex items-center gap-2 mb-2 text-gray-400 text-sm">
                <Terminal className="h-4 w-4" />
                <span>terminal@tech-tornado:~$</span>
              </div>
              <p className="mb-2">cd /challenges</p>
              <div className="flex items-center gap-2 mb-2 text-gray-400 text-sm">
                <Terminal className="h-4 w-4" />
                <span>terminal@tech-tornado:/challenges$</span>
              </div>
              <p className="mb-2">ls</p>
              <p className="mb-2 text-blue-400">{challenge.fileName}</p>
              <div className="flex items-center gap-2 mb-2 text-gray-400 text-sm">
                <Terminal className="h-4 w-4" />
                <span>terminal@tech-tornado:/challenges$</span>
              </div>
              <p className="mb-2">./{challenge.fileName}</p>
              <p className="mb-2 text-yellow-400">
                Enter password to decrypt secret message:
              </p>
              <p className="mb-2 text-gray-400">{">"} ******</p>
              <p className="mb-2 text-red-400">Access granted!</p>
              <p className="mb-2 text-green-400">Decrypting message...</p>
              <p className="mb-2 text-cyan-400">
                Secret message: ****************
              </p>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setShowInstructions(!showInstructions)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-md transition-colors duration-300 flex items-center gap-2"
              >
                <Info className="h-4 w-4" />
                {showInstructions
                  ? "Hide Instructions"
                  : "How to Run C Programs"}
              </button>
            </div>
          </div>
        </div>

        {/* Password Hints and Entry */}
        <div className="bg-gray-900/80 backdrop-blur-md rounded-lg border border-blue-500/30 p-6 flex flex-col">
          <h2 className="text-xl font-mono font-bold text-blue-400 mb-4 flex items-center gap-2">
            <KeyRound className="h-5 w-5" />
            Password Hints
          </h2>

          {showInstructions && (
            <div className="bg-gray-800/80 border border-blue-500/30 rounded-lg p-4 mb-6 text-white">
              <h3 className="font-bold mb-2 text-blue-400">
                {challenge.id === 6 && "Challenge 6 - Execution Process:"}
                {challenge.id === 7 && "Challenge 7 - Execution Process:"}
                {challenge.id === 8 && "Challenge 8 - Execution Process:"}
              </h3>
              <ol className="list-decimal pl-5 space-y-2 text-sm">
                {challenge.id === 6 && (
                  <>
                    <li>Open the Terminal on your system.</li>
                    <li>
                      Navigate to the directory where the C program file (unlock
                      AI) is located using:{" "}
                      <code className="bg-gray-700 px-1 rounded">
                        cd Desktop
                      </code>
                    </li>
                    <li>
                      Compile the C program using:{" "}
                      <code className="bg-gray-700 px-1 rounded">
                        cc unlock\ AI.c
                      </code>
                    </li>
                    <li>
                      Run the program:{" "}
                      <code className="bg-gray-700 px-1 rounded">./a.out</code>
                    </li>
                    <li>
                      The program will prompt for a password. Use the hints
                      below to figure it out and enter it correctly.
                    </li>
                    <li>
                      If the password is correct, the encrypted message will be
                      revealed. Enter that message into the answer box to gain
                      points!
                    </li>
                  </>
                )}
                {challenge.id === 7 && (
                  <>
                    <li>Open the Terminal on your system.</li>
                    <li>
                      Navigate to the directory where the C program file (cyber
                      secret) is located using:{" "}
                      <code className="bg-gray-700 px-1 rounded">
                        cd Desktop
                      </code>
                    </li>
                    <li>
                      Compile the C program using:{" "}
                      <code className="bg-gray-700 px-1 rounded">
                        cc cyber\ secret.c
                      </code>
                    </li>
                    <li>
                      Run the program:{" "}
                      <code className="bg-gray-700 px-1 rounded">./a.out</code>
                    </li>
                    <li>
                      The program will prompt for a password. Use the hints
                      below to figure it out and enter it correctly.
                    </li>
                    <li>
                      If the password is correct, the encrypted message will be
                      revealed. Enter that message into the answer box to gain
                      points!
                    </li>
                  </>
                )}
                {challenge.id === 8 && (
                  <>
                    <li>Open the Terminal on your system.</li>
                    <li>
                      Navigate to the directory where the C program file (enigma
                      code) is located using:{" "}
                      <code className="bg-gray-700 px-1 rounded">
                        cd Desktop
                      </code>
                    </li>
                    <li>
                      Compile the C program using:{" "}
                      <code className="bg-gray-700 px-1 rounded">
                        cc enigma\ code.c
                      </code>
                    </li>
                    <li>
                      Run the program:{" "}
                      <code className="bg-gray-700 px-1 rounded">./a.out</code>
                    </li>
                    <li>
                      The program will prompt for a password. Use the hints
                      below to figure it out and enter it correctly.
                    </li>
                    <li>
                      If the password is correct, the encrypted message will be
                      revealed. Enter that message into the answer box to gain
                      points!
                    </li>
                  </>
                )}
              </ol>
            </div>
          )}

          <div className="bg-gray-800 rounded-lg p-4 mb-6 border border-gray-700">
            <h3 className="text-white font-mono font-bold mb-2">
              Password Hints:
            </h3>
            <ul className="space-y-2">
              {challenge.hints.map((hint, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="bg-blue-900/50 text-blue-400 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">
                    {index + 1}
                  </span>
                  <span className="text-white font-mono">{hint}</span>
                </li>
              ))}
            </ul>
          </div>

          {showHint && (
            <div className="bg-yellow-900/30 border border-yellow-500/30 rounded-lg p-4 mb-6 text-yellow-300 flex items-start gap-2 animate-fade-in">
              <Lightbulb className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <p className="text-sm font-mono">
                Combine all the hints to form the password.
              </p>
            </div>
          )}

          {errorMessage && (
            <div className="bg-red-900/30 border border-red-500/30 rounded-lg p-4 mb-6 text-red-300 flex items-start gap-2 animate-fade-in">
              <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <p className="text-sm font-mono">{errorMessage}</p>
            </div>
          )}

          <form onSubmit={handleSecretSubmit} className="mt-auto">
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={secretMessageInput}
                  onChange={(e) => setSecretMessageInput(e.target.value)}
                  placeholder="Enter the secret message..."
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
                className="w-full px-8 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-medium rounded-lg hover:from-cyan-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-blue-500/25 border border-blue-500/20 relative overflow-hidden group disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <span className="relative z-10 flex items-center justify-center font-mono">
                  <Check className="h-5 w-5 mr-2 group-hover:animate-pulse" />
                  {isSubmitting ? "SUBMITTING..." : "SUBMIT SECRET MESSAGE"}
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-cyan-600/50 to-blue-600/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
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

export default TerminalChallenge;
