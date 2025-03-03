import React from "react";
import Image from "next/image";
import { AlertTriangle, Shield } from "lucide-react";
import { Challenge } from "../types";
import HintSection from "./HintSection";

interface ChallengeDescriptionProps {
  challenge: Challenge;
  showHint: boolean;
  currentHintIndex: number;
  showNextHint: () => void;
  apiError: string;
  successMessage: string;
}

const ChallengeDescription: React.FC<ChallengeDescriptionProps> = ({
  challenge,
  showHint,
  currentHintIndex,
  showNextHint,
  apiError,
  successMessage,
}) => (
  <div className="bg-black/95 backdrop-blur-md rounded-lg shadow-[0_0_30px_rgba(34,197,94,0.3)] border-2 border-green-500/50 p-6 flex flex-col">
    <h2 className="text-xl font-mono font-bold text-green-400 mb-4">
      {challenge.title}
    </h2>

    <div className="bg-gray-900 border-2 border-gray-700 rounded-lg p-4 mb-6 font-mono text-white shadow-inner">
      <p className="mb-4">{challenge.description}</p>

      {challenge.encryptedMessage && (
        <div className="mt-4 p-3 bg-black rounded-md border-2 border-green-500/30 shadow-[0_0_10px_rgba(34,197,94,0.2)]">
          <p className="text-sm text-gray-400 mb-2">Encrypted Message:</p>
          <p className="text-lg text-green-400 font-bold tracking-wider">
            &quot;{challenge.encryptedMessage}&quot;
          </p>
        </div>
      )}

      {challenge.image && (
        <div className="mt-4 flex justify-center">
          <Image
            src={challenge.image}
            alt="Challenge Reference"
            className="max-w-full rounded-md border border-gray-700 shadow-lg"
          />
        </div>
      )}
    </div>

    {showHint && (
      <HintSection
        hints={challenge.hints}
        currentHintIndex={currentHintIndex}
        showNextHint={showNextHint}
      />
    )}

    {apiError && (
      <div className="mt-auto bg-red-900/30 border-2 border-red-500/30 rounded-lg p-3 text-red-400 flex items-start gap-2 animate-fade-in shadow-[0_0_15px_rgba(220,38,38,0.2)]">
        <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
        <p className="text-sm">{apiError}</p>
      </div>
    )}

    {successMessage && (
      <div className="mt-auto bg-green-900/30 border-2 border-green-500/30 rounded-lg p-3 text-green-400 flex items-start gap-2 animate-fade-in shadow-[0_0_15px_rgba(34,197,94,0.2)]">
        <Shield className="h-4 w-4 mt-0.5 flex-shrink-0" />
        <p className="text-sm">{successMessage}</p>
      </div>
    )}
  </div>
);

export default ChallengeDescription;
