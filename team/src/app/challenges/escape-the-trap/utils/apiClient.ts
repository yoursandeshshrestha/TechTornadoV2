import { getTokenFromCookie } from "@/utils/auth";

const BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:8000";

interface SubmitAnswerParams {
  roundNumber: number;
  questionNumber: number;
  answer: string;
}

interface GameStateResponse {
  _id: string;
  currentRound: number;
  isRegistrationOpen: boolean;
  isGameActive: boolean;
  isPaused: boolean;
  roundEndTime: string | null;
  roundStartTime: string | null;
  remainingTime: number | null;
}

interface SubmitAnswerResponse {
  success: boolean;
  message?: string;
  data?: {
    isCorrect: boolean;
    pointsEarned?: number;
  };
}

export const fetchGameState = async (): Promise<GameStateResponse> => {
  const token = getTokenFromCookie();

  if (!token) {
    throw new Error("No team token found. Please login again.");
  }

  const response = await fetch(`${BASE_URL}/api/game/current-state`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch game state");
  }

  return await response.json();
};

export const submitAnswer = async (
  params: SubmitAnswerParams
): Promise<SubmitAnswerResponse> => {
  const token = getTokenFromCookie();

  if (!token) {
    throw new Error("No team token found. Please login again.");
  }

  const response = await fetch(`${BASE_URL}/api/game/submit-answer`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(params),
  });

  return await response.json();
};
