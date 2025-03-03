import { StaticImageData } from "next/image";

export interface Challenge {
  id: number;
  title: string;
  description: string;
  encryptedMessage?: string;
  hints: string[];
  answer: string;
  image?: string | StaticImageData;
}

export interface GameState {
  _id: string;
  currentRound: number;
  isRegistrationOpen: boolean;
  isGameActive: boolean;
  isPaused: boolean;
  roundEndTime: string | null;
  roundStartTime: string | null;
  remainingTime: number | null;
}
