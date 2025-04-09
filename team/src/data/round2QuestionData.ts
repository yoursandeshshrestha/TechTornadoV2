// data/round2QuestionData.ts

export interface PDFChallenge {
  id: number;
  title: string;
  description: string;
  hint: string;
  pdfUrl: string;
  password: string;
  secretMessage: string;
}

export interface SimpleChallenge {
  id: number;
  title: string;
  description: string;
  hint: string;
  answer: string;
}

export interface TerminalChallenge {
  id: number;
  title: string;
  description: string;
  hints: string[];
  password: string;
  secretMessage: string;
  fileName: string;
}

export interface PatternChallenge {
  id: number;
  title: string;
  description: string;
  hint: string;
  paths: number[];
  answer: string;
}

export interface WordScrambleChallenge {
  id: number;
  title: string;
  description: string;
  hint: string;
  scrambledLetters: string[];
  answer: string;
}

export type Challenge =
  | PDFChallenge
  | SimpleChallenge
  | TerminalChallenge
  | PatternChallenge
  | WordScrambleChallenge;

// PDF-based challenges (1-6)
export const pdfChallenges: PDFChallenge[] = [
  {
    id: 1,
    title: "Video Platform Puzzle",
    description:
      "Find the name of the popular video platform to unlock this document.",
    hint: "Full of tutorials and music videos. Red and white logo. Owned by Google.",
    pdfUrl: "AI_VisualWorld.pdf",
    password: "YouTube",
    secretMessage: "KnowledgeInMotion",
  },
  {
    id: 2,
    title: "Developer Favorite",
    description:
      "This file is locked with a word that means writing instructions for computers.",
    hint: "It starts with “C”, Developers do it every day, It's how software is made.",
    pdfUrl: "EasyCode.pdf",
    password: "Code",
    secretMessage: "StartWithSimple",
  },
  {
    id: 3,
    title: "Scrambled Tech Term",
    description: "Unscramble the word: IOTMNOR",
    hint: "Relates to machines and automation. Found in factories and smart homes.",
    pdfUrl: "ControlCenter.pdf",
    password: "Monitor",
    secretMessage: "SystemsUnderWatch",
  },
  {
    id: 4,
    title: "AI Logic Riddle",
    description:
      "I am a number. When multiplied by 2, then added to 8, the result is 30.",
    hint: "No hints available",
    pdfUrl: "AI_LogicLock.pdf",
    password: "11",
    secretMessage: "BrainsOverBots",
  },
  {
    id: 5,
    title: "Pattern Sequence Puzzle",
    description: "Sequence: C, E, H, L, Q, ?",
    hint: "Pattern of increasing letter gaps: +2, +3, +4, +5, +6",
    pdfUrl: "SecretPattern.pdf",
    password: "W",
    secretMessage: "ThinkLikeCode",
  },
  {
    id: 6,
    title: "Music App Mystery",
    description: "Identify the music streaming app with a green logo.",
    hint: "Known for music streaming and year-end stats. Green logo.",
    pdfUrl: "WrappedBeats.pdf",
    password: "Spotify",
    secretMessage: "RhythmUnlocked",
  },
];

// Terminal-based challenges (7-12)
export const terminalChallenges: TerminalChallenge[] = [
  {
    id: 7,
    title: "Drone AI Command",
    description: "Crack the password to activate the drone AI command.",
    hints: [
      "Square root of 49",
      "Apple’s voice assistant",
      "Roman numeral for 5",
    ],
    password: "7SiriV",
    secretMessage: "SkySurveillanceActive",
    fileName: "drone_AI_command.c",
  },
  {
    id: 8,
    title: "Meta Lab Protocol",
    description: "Unlock the meta lab protocol by solving the hints.",
    hints: [
      "Number of continents",
      "Microsoft’s AI assistant",
      "Roman numeral for 1000",
    ],
    password: "7CopilotM",
    secretMessage: "InnovationNeverStops",
    fileName: "meta_lab_protocol.c",
  },
  {
    id: 9,
    title: "Autopilot Activation",
    description: "Activate autopilot mode by entering the correct password.",
    hints: [
      "Cube number less than 30 more then 20",
      "Tesla’s AI system",
      "Roman numeral for 1",
    ],
    password: "8AutopilotI",
    secretMessage: "AutonomousModeEngaged",
    fileName: "autopilot_activation.c",
  },
  {
    id: 10,
    title: "VR Access Gateway",
    description: "Unlock the VR access gateway.",
    hints: ["Half of 10", "Meta’s VR platform", "Roman numeral for 50"],
    password: "5HorizonL",
    secretMessage: "EnteringVirtualWorld",
    fileName: "VR_Access_Gateway.c",
  },
  {
    id: 11,
    title: "Deepfake Detector",
    description: "Enable the deepfake detector by cracking the password.",
    hints: [
      "First single-digit even number",
      "AI that creates images from text (starts with D)",
      "Roman numeral for 100",
    ],
    password: "2DALLEC",
    secretMessage: "DeepfakeDefenseOnline",
    fileName: "deepfake_detector.c",
  },
  {
    id: 12,
    title: "Language Model Init",
    description: "Initialize the language model with the correct password.",
    hints: [
      "Number of fingers on one hand",
      "AI chatbot from OpenAI",
      "Roman numeral for 10",
    ],
    password: "5ChatGPTX",
    secretMessage: "TalkTechActivated",
    fileName: "language_model_init.c",
  },
];

// Simple challenges (13-20)
export const simpleChallenges: SimpleChallenge[] = [
  {
    id: 13,
    title: "Sequence Puzzle",
    description:
      "Can you crack the secret growth formula?: 2 → 6 → 18 → 54 → ?",
    hint: "Multiply each by 3.",
    answer: "162",
  },
  {
    id: 14,
    title: "Unscramble Puzzle",
    description:
      "Which AI assistant is hiding in this jumbled mess? Scrambled: XEALA",
    hint: "Amazon's assistant.",
    answer: "Alexa",
  },
  {
    id: 15,
    title: "Pattern Puzzle",
    description:
      "Can you find the next letter in this growing pattern? Sequence: G → J → N → S → ?",
    hint: "Pattern: +3, +4, +5, +6",
    answer: "Y",
  },
  {
    id: 16,
    title: "Word Connect",
    description: "What’s the one word that connects Echo, Alexa, and Siri?",
    hint: "Think of their common role.",
    answer: "Assistant",
  },
  {
    id: 17,
    title: "Common Link",
    description: "What’s the power source that links Tesla, EV, and Charger?",
    hint: "All powered by?",
    answer: "Electric",
  },
  {
    id: 18,
    title: "Missing Letter Puzzle",
    description:
      "A tricky alphabetical puzzle! Can you fill in the blank?, Sequence: A, C, F, J, O, ?",
    hint: "Gaps increase: +2, +3, +4, +5",
    answer: "U",
  },
  {
    id: 19,
    title: "T9 Pattern Puzzle",
    description:
      "Which letter completes the T9 mobile keypad pattern?, Sequence: J, L, O, S, ?",
    hint: "Letters by mobile keypad numbers.",
    answer: "Z",
  },
  {
    id: 20,
    title: "One-Word Answer",
    description: "GPT but not from OpenAI. Writes emails, stories, blogs...",
    hint: "Starts with W, ends with e.",
    answer: "Write",
  },
];

// Pattern challenge (already covered in simple sequence now, skipping to avoid duplication)

// Word scramble challenge (if needed you can add extra)

// All challenges in order
export const allChallenges: Challenge[] = [
  ...pdfChallenges,
  ...terminalChallenges,
  ...simpleChallenges,
];

// Get challenge by ID
export const getChallengeById = (id: number): Challenge | undefined => {
  return allChallenges.find((challenge) => challenge.id === id);
};

// Get challenge type
export const getChallengeType = (challenge: Challenge): string => {
  if ("pdfUrl" in challenge) {
    return "pdf";
  } else if ("paths" in challenge) {
    return "pattern";
  } else if ("scrambledLetters" in challenge) {
    return "wordScramble";
  } else if ("fileName" in challenge) {
    return "terminal";
  } else {
    return "simple";
  }
};
