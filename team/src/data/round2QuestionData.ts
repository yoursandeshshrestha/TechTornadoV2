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

// PDF-based challenges (1-3)
export const pdfChallenges: PDFChallenge[] = [
  {
    id: 1,
    title: "Crack The Password",
    description:
      "A famous search engine holds the key to unlocking this document. Can you figure out its name?",
    hint: "I help people find answers on the internet. My name starts with 'G'. I am owned by Alphabet Inc.",
    pdfUrl: "AI_Lockdown_Easy.pdf",
    password: "Google",
    secretMessage: "AIisTheFuture",
  },
  {
    id: 2,
    title: "AI Breakthrough",
    description:
      "This PDF holds an important AI breakthrough, but it's locked! Can you recall the social media platform owned by Meta?",
    hint: "I was created in 2004. I connect people worldwide. My logo is blue.",
    pdfUrl: "Cyber_Secret_Case.pdf",
    password: "Facebook",
    secretMessage: "MetaAIUnlocked",
  },
  {
    id: 3,
    title: "Video Call App",
    description:
      "The key to unlocking this document is a popular app used for video calls.",
    hint: "I became famous during the pandemic. My name sounds like 'zooming in.' People use me for meetings and webinars.",
    pdfUrl: "Codebreaker_Mystery.pdf",
    password: "Zoom",
    secretMessage: "VirtualSuccess",
  },
];

// Simple challenges (4-5)
export const simpleChallenges: SimpleChallenge[] = [
  {
    id: 4,
    title: "Step-Jump Pattern",
    description:
      "A hacker has scrambled a word using a step-jump pattern in the alphabet. Find the missing letter. B,F,K,?,V",
    hint: "The difference between letters follows a unique step pattern. Observe the gaps: B→+4→F→+5→K→+6→?→+7→V.",
    answer: "Q",
  },
  {
    id: 5,
    title: "Common Connection",
    description:
      "You are given three words that seem unrelated, but they all have something in common. Find the one-word answer that connects them: Machine, Translate, Intelligence",
    hint: "Think about technology! It is a field that helps computers 'think' like humans.",
    answer: "AI",
  },
];

// Terminal-based challenges (6-8)
export const terminalChallenges: TerminalChallenge[] = [
  {
    id: 6,
    title: "AI Research Message",
    description:
      "A hacker has locked an important AI research message inside a program. The only way to reveal the secret is to enter the correct password into the terminal.",
    hints: [
      "Even number one less than 10.",
      "Google's AI assistant.",
      "The Roman numeral for 10.",
    ],
    password: "8GoogleX",
    secretMessage: "ArtificialIntelligenceWillRule",
    fileName: "ai_research.c",
  },
  {
    id: 7,
    title: "Encrypted Message",
    description:
      "A cybersecurity researcher has encrypted a message that contains a secret phrase. To access it, you must crack the password and enter it into the program.",
    hints: [
      "Turn an infinity symbol upright.",
      "The voice assistant that starts with 'A'.",
      "The first letter in the Greek alphabet.",
    ],
    password: "8AlexaAlpha",
    secretMessage: "CyberSecurityIsTheFuture",
    fileName: "encrypted_message.c",
  },
  {
    id: 8,
    title: "Enigma Machine",
    description:
      "The Enigma machine has encrypted a classified message. The only way to decrypt it is by running the given C program and entering the correct password.",
    hints: [
      "The number of planets in the solar system.",
      "Apple's digital assistant.",
      "The first letter in 'Coding'.",
    ],
    password: "8SiriC",
    secretMessage: "EnigmaDecodedSuccess",
    fileName: "enigma_decoder.c",
  },
];

// Pattern challenge (9)
export const patternChallenge: PatternChallenge = {
  id: 9,
  title: "Digital Maze",
  description:
    "You find yourself in a digital maze with four paths. The exit door requires a 2-digit code to open.",
  hint: "The numbers follow a pattern. Find the next number in the sequence.",
  paths: [3, 6, 12, 24],
  answer: "48",
};

// Word scramble challenge (10)
export const wordScrambleChallenge: WordScrambleChallenge = {
  id: 10,
  title: "Final Gate",
  description:
    "At the final gate, a screen displays a scrambled word. You must enter the correct 8-letter word to unlock the door.",
  hint: "Think about technology and work.",
  scrambledLetters: ["R", "O", "T", "O", "C", "U", "P", "M", "E"],
  answer: "COMPUTER",
};

// All challenges in order
export const allChallenges: Challenge[] = [
  ...pdfChallenges,
  ...simpleChallenges,
  ...terminalChallenges,
  patternChallenge,
  wordScrambleChallenge,
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
