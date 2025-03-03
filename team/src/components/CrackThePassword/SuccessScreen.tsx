// components/round2/SuccessScreen.tsx
import React from "react";
import { useRouter } from "next/navigation";
import { Check, ArrowLeft, ArrowRight } from "lucide-react";

interface SuccessScreenProps {
  title: string;
  message: string;
  currentQuestion: number;
  totalQuestions: number;
  pointsEarned: number;
  secretMessage?: string;
}

const SuccessScreen: React.FC<SuccessScreenProps> = ({
  title,
  message,
  currentQuestion,
  totalQuestions,
  pointsEarned,
  secretMessage,
}) => {
  const router = useRouter();

  const handlePrevious = () => {
    const prevQuestion = Math.max(1, currentQuestion - 1);
    router.push(`/challenges/crack-the-password/${prevQuestion}`);
  };

  const handleNext = () => {
    if (currentQuestion < totalQuestions) {
      router.push(`/challenges/crack-the-password/${currentQuestion + 1}`);
    } else {
      router.push("/challenges");
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-900 rounded-lg p-8 text-center space-y-6 border border-green-900 shadow-[0_0_50px_rgba(34,197,94,0.5)]">
        <Check className="h-20 w-20 text-green-500 mx-auto" />
        <h1 className="text-3xl font-bold text-green-500">{title}</h1>
        <p className="text-gray-400">{message}</p>

        {secretMessage && (
          <div className="mt-4 bg-green-900/30 border border-green-500/30 rounded-lg p-4">
            <p className="text-gray-200">Secret Message:</p>
            <p className="text-green-400 font-bold font-mono text-xl mt-2">
              {secretMessage}
            </p>
          </div>
        )}

        <div className="mt-4 bg-gray-800 rounded-lg p-4">
          <p className="text-green-400 font-bold">
            +{pointsEarned} points earned!
          </p>
        </div>

        <div className="pt-4 flex justify-center gap-4">
          <button
            onClick={handlePrevious}
            className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-md transition-colors duration-300 flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </button>
          <button
            onClick={handleNext}
            className="px-6 py-3 bg-green-900/50 hover:bg-green-900 text-white rounded-md transition-colors duration-300 flex items-center gap-2"
          >
            {currentQuestion < totalQuestions ? "Next Challenge" : "Finish"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessScreen;
