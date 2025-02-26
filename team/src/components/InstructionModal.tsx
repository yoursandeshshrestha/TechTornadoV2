import { InstructionModalProps } from "@/types/types";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export const InstructionModal = ({
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
