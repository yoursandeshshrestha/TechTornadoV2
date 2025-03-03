import React from "react";
import { Skull } from "lucide-react";

interface GameOverScreenProps {
  onClick: () => void;
}

const GameOverScreen: React.FC<GameOverScreenProps> = ({ onClick }) => (
  <div className="min-h-screen bg-black flex items-center justify-center p-4">
    <div className="max-w-md w-full bg-gray-900 rounded-lg p-8 text-center space-y-6 border border-red-900 shadow-[0_0_50px_rgba(220,38,38,0.5)]">
      <Skull className="h-20 w-20 text-red-500 mx-auto" />
      <h1 className="text-3xl font-bold text-red-500">
        TIME&apos;S UP - SYSTEM BREACH FAILED
      </h1>
      <p className="text-gray-400">
        Security protocols detected your intrusion. Connection terminated.
      </p>
      <div className="pt-4">
        <button
          onClick={onClick}
          className="px-6 py-3 bg-red-900/50 hover:bg-red-900 text-white rounded-md transition-colors duration-300"
        >
          Return to Homepage
        </button>
      </div>
    </div>
  </div>
);

export default GameOverScreen;
