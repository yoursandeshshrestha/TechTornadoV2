import React from "react";
import { Eye } from "lucide-react";

interface HintSectionProps {
  hints: string[];
  currentHintIndex: number;
  showNextHint: () => void;
}

const HintSection: React.FC<HintSectionProps> = ({
  hints,
  currentHintIndex,
  showNextHint,
}) => (
  <div className="bg-yellow-900/30 border-2 border-yellow-500/30 rounded-lg p-4 mb-4 text-yellow-300 space-y-2 shadow-[0_0_15px_rgba(234,179,8,0.2)]">
    <div className="flex items-center gap-2">
      <Eye className="h-4 w-4" />
      <h3 className="font-mono font-bold">HINTS:</h3>
    </div>
    <ul className="list-disc pl-5 space-y-1">
      {hints.slice(0, currentHintIndex + 1).map((hint, index) => (
        <li key={index} className="text-sm">
          {hint}
        </li>
      ))}
    </ul>
    {currentHintIndex < hints.length - 1 && (
      <button
        onClick={showNextHint}
        className="text-xs text-yellow-400 hover:text-yellow-300 underline mt-2"
      >
        Show more hints
      </button>
    )}
  </div>
);

export default HintSection;
