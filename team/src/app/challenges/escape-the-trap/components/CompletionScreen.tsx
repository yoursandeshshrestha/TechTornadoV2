import React from "react";
import { Shield, Home } from "lucide-react";

interface CompletionScreenProps {
  onClick: () => void;
}

const CompletionScreen: React.FC<CompletionScreenProps> = ({ onClick }) => (
  <div className="min-h-screen bg-black flex items-center justify-center p-4">
    <div className="max-w-md w-full bg-gray-900 rounded-lg p-8 text-center space-y-6 border border-green-900 shadow-[0_0_50px_rgba(34,197,94,0.5)]">
      <Shield className="h-20 w-20 text-green-500 mx-auto" />
      <h1 className="text-3xl font-bold text-green-500">
        ALL CHALLENGES COMPLETED
      </h1>
      <p className="text-gray-400">
        You have finished all available challenges. Thank you for playing!
      </p>
      <div className="pt-4">
        <button
          onClick={onClick}
          className="px-6 py-3 bg-green-900/50 hover:bg-green-900 text-white rounded-md transition-colors duration-300 flex items-center justify-center gap-2 mx-auto"
        >
          <Home className="h-5 w-5" />
          Return to Homepage
        </button>
      </div>
    </div>
  </div>
);

export default CompletionScreen;
