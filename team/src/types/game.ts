// types/game.ts

export interface Question {
  id: number;
  content?: string;
  imageUrl?: string | null;
  answer?: string;
  hints: string[];
  isAnswered: boolean;
  points: number;
}

export interface TeamData {
  teamName: string;
  teamId: string;
  isLoggedIn: boolean;
  [key: string]: any;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  isUnlocked: boolean;
}

export interface GameState {
  currentRound: number;
  isRegistrationOpen: boolean;
  isGameActive: boolean;
  isPaused: boolean;
  roundEndTime: string;
  roundStartTime: string;
  remainingTime: number | null;
}

export interface AnswerResponse {
  success: boolean;
  data?: {
    isCorrect: boolean;
    pointsEarned: number;
    nextQuestion: number;
  };
  message?: string;
}

export interface Media {
  image?: {
    url: string;
    fileName: string;
  };
  pdf?: {
    url: string;
    fileName: string;
  };
}

export interface ApiQuestion {
  _id: string;
  round: number;
  questionNumber: number;
  content: string;
  points: number;
  hints: string[];
  createdAt: string;
  updatedAt: string;
  __v: number;
  isAnswered: boolean;
  isSkipped: boolean;
  media?: Media;
}

export interface QuestionsResponse {
  success: boolean;
  data: ApiQuestion[];
  message?: string;
}
