import React from "react";
import { motion } from "framer-motion";
import { challenges } from "../utils/challengeData";

export const PartialCompletionScreen = ({ onClick, challengeState }) => {
  const completedChallenges = [];
  const failedChallenges = [];

  // Process the challengeState to determine which challenges were completed and which weren't
  challenges.forEach((challenge, index) => {
    if (challengeState.completed[index]) {
      completedChallenges.push({ index: index + 1, title: challenge.title });
    } else if (challengeState.maxedOut[index]) {
      failedChallenges.push({ index: index + 1, title: challenge.title });
    }
  });

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Matrix-like background effect */}
      <div className="absolute inset-0 bg-black opacity-90 z-0"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 bg-gray-900 border border-green-500 rounded-lg shadow-lg p-8 max-w-xl w-full text-center"
      >
        <h2 className="text-3xl font-bold text-green-400 mb-4">
          System Access Partially Restored
        </h2>

        <div className="mb-6 space-y-4">
          {completedChallenges.length > 0 && (
            <div>
              <h3 className="text-xl text-green-300 mb-2">
                Successfully Completed:
              </h3>
              <ul className="text-green-300 mb-4">
                {completedChallenges.map((challenge) => (
                  <li
                    key={`completed-${challenge.index}`}
                    className="flex items-center justify-center"
                  >
                    <span className="mr-2">✓</span> Challenge {challenge.index}:{" "}
                    {challenge.title}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {failedChallenges.length > 0 && (
            <div>
              <h3 className="text-xl text-red-400 mb-2">
                Challenges Not Completed:
              </h3>
              <ul className="text-red-400 mb-4">
                {failedChallenges.map((challenge) => (
                  <li
                    key={`failed-${challenge.index}`}
                    className="flex items-center justify-center"
                  >
                    <span className="mr-2">✗</span> Challenge {challenge.index}:{" "}
                    {challenge.title}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <p className="text-white mb-6">
          {completedChallenges.length > 0
            ? `You successfully solved ${completedChallenges.length} ${
                completedChallenges.length === 1 ? "challenge" : "challenges"
              }. Points have been awarded for your team.`
            : "Unfortunately, you weren't able to solve any challenges."}
        </p>

        <motion.button
          onClick={onClick}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded transition duration-300"
        >
          Return to Dashboard
        </motion.button>
      </motion.div>
    </div>
  );
};
