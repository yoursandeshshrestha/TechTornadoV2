"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/redux/store";
import { useSocket } from "@/hooks/useSocket";
import { toast } from "sonner";
import { XCircle, AlertTriangle } from "lucide-react";

interface GameState {
  currentRound: number;
  isRegistrationOpen: boolean;
  isGameActive: boolean;
  gameStatus: "In Progress" | "Stopped";
}

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:8000";

export function GameControls() {
  const { socket, subscribeToGameState, unsubscribeFromGameState } =
    useSocket();
  const auth = useSelector((state: RootState) => state.auth);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTerminateConfirm, setShowTerminateConfirm] = useState(false);
  const [gameState, setGameState] = useState<GameState>({
    currentRound: 0,
    isRegistrationOpen: false,
    isGameActive: false,
    gameStatus: "Stopped",
  });

  const getAuthToken = () => {
    if (auth.token) return auth.token;
    const cookies = document.cookie.split(";");
    const tokenCookie = cookies.find((cookie) =>
      cookie.trim().startsWith("token=")
    );
    return tokenCookie ? tokenCookie.split("=")[1].trim() : null;
  };

  // Socket event handlers
  useEffect(() => {
    const handleGameStateUpdate = (state: Partial<GameState>) => {
      setGameState((prev) => ({
        ...prev,
        ...state,
        // Preserve game activity state if not explicitly changed
        isGameActive:
          typeof state.isGameActive !== "undefined"
            ? state.isGameActive
            : prev.isGameActive,
        currentRound:
          typeof state.currentRound !== "undefined"
            ? state.currentRound
            : prev.currentRound,
        gameStatus: state.gameStatus || prev.gameStatus,
      }));
    };

    if (socket) {
      subscribeToGameState(handleGameStateUpdate);
      socket.on("registrationStatusChange", (status: "open" | "closed") => {
        setGameState((prev) => ({
          ...prev,
          isRegistrationOpen: status === "open",
        }));
      });
      socket.on("roundTerminated", () => {
        setGameState((prev) => ({
          ...prev,
          currentRound: 0,
          isGameActive: false,
          gameStatus: "Stopped",
        }));
      });
    }

    return () => {
      if (socket) {
        unsubscribeFromGameState(handleGameStateUpdate);
        socket.off("registrationStatusChange");
        socket.off("roundTerminated");
      }
    };
  }, [socket, subscribeToGameState, unsubscribeFromGameState]);

  // Fetch initial state
  useEffect(() => {
    const fetchInitialState = async () => {
      try {
        const token = getAuthToken();
        if (!token) {
          throw new Error("No authentication token found");
        }

        const [regResponse, roundResponse] = await Promise.all([
          fetch(`${BACKEND_URL}/api/game/registration/status`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${BACKEND_URL}/api/game/current-state`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!regResponse.ok || !roundResponse.ok) {
          throw new Error("Failed to fetch game state");
        }

        const [regData, roundData] = await Promise.all([
          regResponse.json(),
          roundResponse.json(),
        ]);

        const isActive = roundData.currentRound > 0;
        setGameState({
          currentRound: roundData.currentRound,
          isRegistrationOpen: regData.isRegistrationOpen,
          isGameActive: isActive,
          gameStatus: isActive ? "In Progress" : "Stopped",
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to fetch game state";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsInitializing(false);
      }
    };

    fetchInitialState();
  }, []);

  const handleRoundStart = async (roundNumber: number) => {
    try {
      if (roundNumber === gameState.currentRound) return;

      setIsLoading(true);
      setError(null);
      const token = getAuthToken();

      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(`${BACKEND_URL}/api/admin/round/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ round: roundNumber }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to start round");
      }

      const data = await response.json();

      setGameState((prev) => ({
        ...prev,
        currentRound: roundNumber,
        isGameActive: true,
        gameStatus: "In Progress",
      }));

      toast.success(
        data.message || `Round ${roundNumber} started successfully`
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to start round";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegistrationToggle = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const token = getAuthToken();

      if (!token) {
        throw new Error("No authentication token found");
      }

      const newStatus = gameState.isRegistrationOpen ? "close" : "open";

      const response = await fetch(
        `${BACKEND_URL}/api/admin/registration/${newStatus}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to toggle registration");
      }

      const data = await response.json();
      socket?.emit("registrationStatusChange", newStatus);

      // Only update registration status locally, preserve other state
      setGameState((prev) => ({
        ...prev,
        isRegistrationOpen: newStatus === "open",
      }));

      toast.success(data.message || `Registration ${newStatus}ed successfully`);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to toggle registration";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTerminateRound = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const token = getAuthToken();

      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(`${BACKEND_URL}/api/admin/round/terminate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to terminate round");
      }

      socket?.emit("roundTerminated");
      setShowTerminateConfirm(false);
      toast.success("Round terminated successfully");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to terminate round";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isInitializing) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-6">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const isRoundActive = gameState.isGameActive && gameState.currentRound > 0;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 my-[20px]">
      <h2 className="text-xl font-bold mb-6">Game Controls</h2>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center text-red-700">
            <AlertTriangle className="h-5 w-5 mr-2" />
            <span>{error}</span>
          </div>
        </div>
      )}

      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Round Selection
          </h3>
          <div className="flex items-center gap-3">
            <div className="flex gap-3">
              {[1, 2, 3].map((round) => (
                <button
                  key={round}
                  className={`px-6 py-3 rounded-lg transition-all duration-200 ${
                    gameState.currentRound === round
                      ? "bg-blue-500 text-white shadow-md"
                      : "bg-white border border-gray-200 hover:bg-gray-50"
                  } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                  onClick={() => handleRoundStart(round)}
                  disabled={isLoading}
                >
                  Round {round}
                </button>
              ))}
            </div>
            {isRoundActive && (
              <div className="ml-4">
                {!showTerminateConfirm ? (
                  <button
                    onClick={() => setShowTerminateConfirm(true)}
                    className="px-4 py-3 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                  >
                    End Round
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowTerminateConfirm(false)}
                      className="px-3 py-1.5 bg-white text-gray-600 rounded border border-gray-300 hover:bg-gray-50 text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleTerminateRound}
                      disabled={isLoading}
                      className="px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm flex items-center"
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Confirm End
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700">
              Registration Status
            </span>
            <button
              onClick={handleRegistrationToggle}
              className="relative inline-flex h-6 w-11 items-center rounded-full"
              disabled={isLoading}
            >
              <div
                className={`
                  absolute w-11 h-6 rounded-full transition-colors duration-200
                  ${
                    gameState.isRegistrationOpen
                      ? "bg-green-500"
                      : "bg-gray-200"
                  }
                `}
              />
              <div
                className={`
                  absolute left-0 inline-block h-5 w-5 transform rounded-full 
                  bg-white transition-transform duration-200 shadow-lg
                  ${
                    gameState.isRegistrationOpen
                      ? "translate-x-6"
                      : "translate-x-1"
                  }
                `}
              />
            </button>
            <span
              className={`text-sm ${
                gameState.isRegistrationOpen
                  ? "text-green-500"
                  : "text-gray-500"
              }`}
            >
              {gameState.isRegistrationOpen ? "Open" : "Closed"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
