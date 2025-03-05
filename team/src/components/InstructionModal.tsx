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
            <h2 className="text-xl font-semibold mb-4">Round 1: AI Charades</h2>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-4">
                <p className="bg-blue-100 px-3 py-1 rounded-full text-sm flex items-center">
                  <span className="mr-1">🕒</span> Time Limit: 30 minutes
                </p>
                <p className="bg-purple-100 px-3 py-1 rounded-full text-sm flex items-center">
                  <span className="mr-1">❓</span> Questions: 15
                </p>
                <p className="bg-green-100 px-3 py-1 rounded-full text-sm flex items-center">
                  <span className="mr-1">🔢</span> Scoring: 1 mark per question
                </p>
                <p className="bg-yellow-100 px-3 py-1 rounded-full text-sm flex items-center">
                  <span className="mr-1">📊</span> Qualification: Top 50% of
                  teams advance
                </p>
              </div>

              <p className="font-medium mt-2">Instructions:</p>
              <ol className="list-decimal pl-5 space-y-1">
                <li>Teams will receive 15 AI-related riddles.</li>
                <li>Each question has one correct answer worth 1 point.</li>
                <li>
                  Participants can:
                  <ul className="list-disc pl-5 pt-1">
                    <li>
                      <em>Skip a question</em> and come back later.
                    </li>
                    <li>
                      <em>Navigate freely</em> between previous and next
                      questions.
                    </li>
                  </ul>
                </li>
                <li>
                  After <em>30 minutes</em>, the quiz will be automatically
                  submitted.
                </li>
                <li>
                  The <em>top 50% of teams</em> with the highest scores will
                  move on to <em>Round 2</em>.
                </li>
              </ol>
            </div>
          </>
        );
      case "crack-the-password":
        return (
          <>
            <h2 className="text-xl font-semibold mb-4">
              Round 2: Crack the Password (CTP)
            </h2>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-4">
                <p className="bg-blue-100 px-3 py-1 rounded-full text-sm flex items-center">
                  <span className="mr-1">🕒</span> Time Limit: 40 minutes
                </p>
                <p className="bg-purple-100 px-3 py-1 rounded-full text-sm flex items-center">
                  <span className="mr-1">❓</span> Questions: 10
                </p>
                <p className="bg-green-100 px-3 py-1 rounded-full text-sm flex items-center">
                  <span className="mr-1">🔢</span> Scoring: 5 points per
                  question
                </p>
                <p className="bg-yellow-100 px-3 py-1 rounded-full text-sm flex items-center">
                  <span className="mr-1">📊</span> Qualification: Top 25% of
                  teams advance
                </p>
              </div>

              <p className="font-medium mt-2">Instructions:</p>
              <ol className="list-decimal pl-5 space-y-1">
                <li>
                  This round consists of{" "}
                  <em>10 password-cracking challenges</em>, including:
                  <ul className="list-disc pl-5 pt-1">
                    <li>
                      <em>Finding a common word linking three clues</em>
                    </li>
                    <li>
                      <em>Unlocking PDFs using hints</em>
                    </li>
                    <li>
                      <em>Cracking encrypted messages</em>
                    </li>
                    <li>
                      <em>Solving logic-based puzzles</em>
                    </li>
                    <li>
                      <em>Deciphering number patterns</em>
                    </li>
                  </ul>
                </li>
                <li>
                  Each correct answer earns <em>5 points</em>.
                </li>
                <li>
                  Participants can:
                  <ul className="list-disc pl-5 pt-1">
                    <li>
                      <em>Skip questions and return later</em>.
                    </li>
                    <li>
                      <em>Navigate freely between questions</em>.
                    </li>
                  </ul>
                </li>
                <li>
                  After <em>40 minutes</em>, the system will submit responses
                  automatically.
                </li>
                <li>
                  The <em>top 25% of teams</em> with the highest scores will
                  advance to <em>Round 3: Escape the Trap</em>.
                </li>
              </ol>

              {!challenge.isUnlocked && (
                <p className="mt-4 text-orange-600 font-medium">
                  <strong>This challenge is currently locked.</strong>
                  <br />
                  Complete AI_Charades first to unlock this challenge.
                </p>
              )}
            </div>
          </>
        );
      case "escape-the-trap":
        return (
          <>
            <h2 className="text-xl font-semibold mb-4">
              Round 3: Escape the Trap (Finale)
            </h2>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-4">
                <p className="bg-blue-100 px-3 py-1 rounded-full text-sm flex items-center">
                  <span className="mr-1">🕒</span> Time Limit: 50 minutes
                </p>
                <p className="bg-yellow-100 px-3 py-1 rounded-full text-sm flex items-center">
                  <span className="mr-1">🏆</span> Winning Criteria: Highest
                  total score wins
                </p>
              </div>

              <p className="font-medium mt-2">Instructions:</p>
              <ol className="list-decimal pl-5 space-y-1">
                <li>
                  <em>This round consists of 2 challenges.</em>
                </li>
                <li>
                  <em>Challenge 1</em>:
                  <ul className="list-disc pl-5 pt-1">
                    <li>
                      Teams get <em>3 attempts</em> to solve the puzzle.
                    </li>
                    <li>
                      <em>Points Distribution:</em>
                      <ul className="list-none pl-5 pt-1">
                        <li>
                          - <em>1st attempt</em>: 30 points
                        </li>
                        <li>
                          - <em>2nd attempt</em>: 20 points
                        </li>
                        <li>
                          - <em>3rd attempt</em>: 10 points
                        </li>
                        <li>
                          - <em>Failure in 3 attempts</em>: 0 points (proceeds
                          to Challenge 2)
                        </li>
                      </ul>
                    </li>
                  </ul>
                </li>
                <li>
                  <em>Challenge 2</em>:
                  <ul className="list-disc pl-5 pt-1">
                    <li>
                      Same <em>scoring rules</em> as Challenge 1.
                    </li>
                  </ul>
                </li>
                <li>
                  After both challenges, the team with the{" "}
                  <em>highest total score</em> will be declared the{" "}
                  <em>Tech Tornado Champion!</em> 🎉
                </li>
              </ol>

              {!challenge.isUnlocked && (
                <p className="mt-4 text-orange-600 font-medium">
                  <strong>This challenge is currently locked.</strong>
                  <br />
                  Complete previous challenges first to unlock Escape the Trap.
                </p>
              )}
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
