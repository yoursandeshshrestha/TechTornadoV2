// components/round2/ChallengeFactory.tsx
import React from "react";
import {
  getChallengeById,
  getChallengeType,
  allChallenges,
  PDFChallenge as PDFChallengeType,
  SimpleChallenge as SimpleChallengeType,
  TerminalChallenge as TerminalChallengeType,
  PatternChallenge as PatternChallengeType,
  WordScrambleChallenge as WordScrambleChallengeType,
} from "@/data/round2QuestionData";
import PDFChallenge from "./PDFChallenge";
import SimpleChallenge from "./SimpleChallenge";
import TerminalChallenge from "./TerminalChallenge";
import PatternChallenge from "./PatternChallenge";
import WordScrambleChallenge from "./WordScrambleChallenge";
import BackgroundEffects from "./BackgroundEffects";

interface ChallengeFactoryProps {
  challengeId: number;
}

const ChallengeFactory: React.FC<ChallengeFactoryProps> = ({ challengeId }) => {
  const challenge = getChallengeById(challengeId);

  if (!challenge) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
        <h1 className="text-3xl font-bold mb-4">Challenge Not Found</h1>
        <p className="mb-6">
          Sorry, we couldn't find a challenge with ID: {challengeId}
        </p>
        <a
          href="/challenges/crack-the-password/1"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
        >
          Go to First Challenge
        </a>
      </div>
    );
  }

  const totalQuestions = allChallenges.length;
  const challengeType = getChallengeType(challenge);

  let backgroundImage =
    "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?q=80";
  let overlayColor = "from-gray-900/90 via-blue-900/80 to-gray-900/90";

  if (challengeType === "pattern") {
    backgroundImage =
      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80";
  } else if (challengeType === "wordScramble") {
    backgroundImage =
      "https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80";
    overlayColor = "from-gray-900/90 via-purple-900/80 to-gray-900/90";
  } else if (challengeType === "terminal") {
    backgroundImage =
      "https://images.unsplash.com/photo-1629654297299-c8506221ca97?q=80";
    overlayColor = "from-gray-900/90 via-green-900/80 to-gray-900/90";
  }

  return (
    <BackgroundEffects
      backgroundImage={backgroundImage}
      overlayColor={overlayColor}
    >
      {challengeType === "pdf" && (
        <PDFChallenge
          challenge={challenge as PDFChallengeType}
          totalQuestions={totalQuestions}
        />
      )}

      {challengeType === "simple" && (
        <SimpleChallenge
          challenge={challenge as SimpleChallengeType}
          totalQuestions={totalQuestions}
        />
      )}

      {challengeType === "terminal" && (
        <TerminalChallenge
          challenge={challenge as TerminalChallengeType}
          totalQuestions={totalQuestions}
        />
      )}

      {challengeType === "pattern" && (
        <PatternChallenge
          challenge={challenge as PatternChallengeType}
          totalQuestions={totalQuestions}
        />
      )}

      {challengeType === "wordScramble" && (
        <WordScrambleChallenge
          challenge={challenge as WordScrambleChallengeType}
          totalQuestions={totalQuestions}
        />
      )}
    </BackgroundEffects>
  );
};

export default ChallengeFactory;
