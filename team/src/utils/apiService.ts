// utils/apiService.ts
import { getTokenFromCookie } from "./auth";

const API_URL =
  process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:8000";

interface SubmitAnswerRequest {
  roundNumber: number;
  questionNumber: number;
  answer: string;
}

interface SubmitAnswerResponse {
  success: boolean;
  message?: string;
  data?: {
    isCorrect: boolean;
    pointsEarned: number;
    nextQuestion: number;
  };
}

interface GameStateResponse {
  _id: string;
  currentRound: number;
  isRegistrationOpen: boolean;
  isGameActive: boolean;
  isPaused: boolean;
  roundEndTime: string;
  roundStartTime: string;
  remainingTime: number | null;
}

export const submitAnswer = async (
  questionNumber: number,
  answer: string
): Promise<SubmitAnswerResponse> => {
  const token = getTokenFromCookie();

  if (!token) {
    return {
      success: false,
      message: "You are not authenticated. Please log in.",
    };
  }

  try {
    const response = await fetch(`${API_URL}/api/game/submit-answer`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        roundNumber: 2,
        questionNumber,
        answer,
      } as SubmitAnswerRequest),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error submitting answer:", error);
    return {
      success: false,
      message: "Failed to submit answer. Please try again.",
    };
  }
};

export const getGameState = async (): Promise<GameStateResponse | null> => {
  const token = getTokenFromCookie();

  if (!token) {
    return null;
  }

  try {
    const response = await fetch(`${API_URL}/api/game/current-state`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch game state");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching game state:", error);
    return null;
  }
};

export const calculateRemainingTime = (endTimeStr: string): number => {
  const endTime = new Date(endTimeStr).getTime();
  const currentTime = new Date().getTime();
  const remainingTime = Math.max(0, endTime - currentTime);
  return remainingTime;
};
