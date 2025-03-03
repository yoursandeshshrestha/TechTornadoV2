import React from "react";
import { KeyRound, Eye, EyeOff, Zap } from "lucide-react";

interface AnswerFormProps {
  userAnswer: string;
  setUserAnswer: (answer: string) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  attempts: number;
  maxAttempts: number;
  isCorrect: boolean;
  isSubmitting: boolean;
  isPaused: boolean;
  showHint: boolean;
  setShowHint: (show: boolean) => void;
}

const AnswerForm: React.FC<AnswerFormProps> = ({
  userAnswer,
  setUserAnswer,
  handleSubmit,
  attempts,
  maxAttempts,
  isCorrect,
  isSubmitting,
  isPaused,
  showHint,
  setShowHint,
}) => (
  <div className="bg-black/95 backdrop-blur-md rounded-lg shadow-[0_0_30px_rgba(34,197,94,0.3)] border-2 border-green-500/50 p-6 flex flex-col">
    <h2 className="text-xl font-mono font-bold text-green-400 mb-4 flex items-center gap-2">
      <KeyRound className="h-5 w-5" />
      Enter Solution
    </h2>

    <div className="flex-grow flex flex-col justify-center">
      <div className="bg-gray-900 border-2 border-gray-700 rounded-lg p-4 mb-6 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400 font-mono">
            root@hacked-system:~#
          </span>
          <span className="text-xs text-gray-500 font-mono">
            Attempts: {attempts}/{maxAttempts}
          </span>
        </div>
        <div className="h-40 bg-black rounded p-3 font-mono text-green-400 text-sm overflow-auto flex flex-col shadow-[inset_0_0_10px_rgba(34,197,94,0.2)] border border-green-500/20">
          <div className="flex-grow space-y-1">
            <p>&gt; Initializing security bypass...</p>
            <p>&gt; Firewall detected. Attempting to circumvent...</p>
            <p>&gt; Security layer 1 breached.</p>
            <p>&gt; Security layer 2 active. Requires decryption key.</p>
            <p className="text-yellow-400">
              &gt; SYSTEM: Enter decryption key to proceed.
            </p>
            {attempts > 0 && (
              <div className="text-red-400">
                {Array.from({ length: attempts }).map((_, i) => (
                  <p key={i}>
                    &gt; SYSTEM: Invalid key attempt. Access denied.
                  </p>
                ))}
              </div>
            )}
            {isCorrect && (
              <p className="text-green-400">
                &gt; SYSTEM: Key accepted. Access granted.
              </p>
            )}
          </div>
          <div className="flex items-center">
            <span className="text-green-400 mr-2">$</span>
            <span className="animate-pulse">_</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Enter your answer..."
              className="w-full px-4 py-3 bg-black border-2 border-green-500/30 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-lg text-green-400 placeholder-gray-500 font-mono shadow-[inset_0_0_10px_rgba(34,197,94,0.1)]"
              disabled={isCorrect || isSubmitting || isPaused}
            />
          </div>
          <button
            type="button"
            onClick={() => setShowHint(!showHint)}
            className="px-3 text-yellow-500 hover:bg-gray-800 rounded-lg transition-colors"
          >
            {showHint ? (
              <EyeOff className="h-6 w-6" />
            ) : (
              <Eye className="h-6 w-6" />
            )}
          </button>
        </div>

        <div className="flex items-center justify-center pt-2">
          <button
            type="submit"
            disabled={
              isCorrect ||
              attempts >= maxAttempts ||
              isSubmitting ||
              !userAnswer.trim() ||
              isPaused
            }
            className={`px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-[0_0_20px_rgba(34,197,94,0.4)] border-2 border-green-500/40 relative overflow-hidden group ${
              isCorrect ||
              attempts >= maxAttempts ||
              isSubmitting ||
              !userAnswer.trim() ||
              isPaused
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
          >
            <span className="relative z-10 flex items-center justify-center font-mono">
              {isSubmitting ? (
                <>
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  PROCESSING
                </>
              ) : (
                <>
                  <Zap className="h-5 w-5 mr-2 group-hover:animate-pulse" />
                  EXECUTE
                </>
              )}
            </span>
            <span className="absolute inset-0 bg-gradient-to-r from-green-600/50 to-emerald-600/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
          </button>
        </div>
      </form>
    </div>

    <div className="mt-6">
      <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
        <span>SYSTEM SECURITY</span>
        <span>{attempts >= maxAttempts ? "LOCKED" : "VULNERABLE"}</span>
      </div>
      <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500"
          style={{ width: `${100 - (attempts / maxAttempts) * 100}%` }}
        />
      </div>
    </div>
  </div>
);

export default AnswerForm;
