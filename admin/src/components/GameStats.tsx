import { useEffect, useState, useCallback, useRef } from "react";
import { Users, PlayCircle, Timer, Clock } from "lucide-react";
import { useSocket } from "@/hooks/useSocket";
import { toast } from "sonner";

interface GameState {
  gameStatus: "In Progress" | "Stopped";
  isRegistrationOpen: boolean;
  currentRound: number;
  activeUsers: number;
  endTime?: string;
}

interface Team {
  teamName: string;
  totalScore: number;
  teamMembers: string[];
  collegeName: string;
}

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:8000";

// Helper to save state to localStorage
const saveToLocalStorage = <T,>(key: string, value: T): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem(key, JSON.stringify(value));
  }
};

// Helper to get state from localStorage
const getFromLocalStorage = <T,>(key: string, defaultValue: T): T => {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (error) {
        console.error(`Error parsing stored data for ${key}:`, error);
      }
    }
  }
  return defaultValue;
};

// Run as soon as the module loads to set up initial timer
// This is important for timer persistence during page refreshes
if (typeof window !== "undefined") {
  // Check if we have an end time in localStorage
  const storedEndTime = localStorage.getItem("gameEndTime");

  if (storedEndTime) {
    try {
      const endTime = JSON.parse(storedEndTime);
      const now = new Date().getTime();
      const endTimeDate = new Date(endTime).getTime();
      const difference = endTimeDate - now;

      if (difference > 0) {
        // We have a valid end time in the future
        const minutes = Math.floor(difference / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        const timeRemaining = `${minutes.toString().padStart(2, "0")}:${seconds
          .toString()
          .padStart(2, "0")}`;

        // Store updated time immediately
        localStorage.setItem("timeRemaining", JSON.stringify(timeRemaining));

        // Set up an interval that will keep updating the timer even if the component isn't mounted yet
        const intervalId = setInterval(() => {
          const now = new Date().getTime();
          const difference = endTimeDate - now;

          if (difference <= 0) {
            localStorage.setItem("timeRemaining", JSON.stringify("Ended"));
            clearInterval(intervalId);
            return;
          }

          const minutes = Math.floor(difference / (1000 * 60));
          const seconds = Math.floor((difference % (1000 * 60)) / 1000);
          const timeRemaining = `${minutes
            .toString()
            .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

          localStorage.setItem("timeRemaining", JSON.stringify(timeRemaining));
        }, 1000);

        // Store the interval ID so we can clear it later
        window.__timerIntervalId = intervalId;
      } else {
        // End time is in the past
        localStorage.setItem("timeRemaining", JSON.stringify("Ended"));
      }
    } catch (error) {
      console.error("Error processing stored end time:", error);
    }
  }
}

export default function GameStats() {
  // Get initial state from localStorage
  const [gameState, setGameState] = useState<GameState>(() =>
    getFromLocalStorage("gameState", {
      gameStatus: "Stopped",
      isRegistrationOpen: false,
      currentRound: 0,
      activeUsers: 0,
    })
  );

  const [teams, setTeams] = useState<Team[]>(() =>
    getFromLocalStorage("teams", [])
  );

  const [isLoading, setIsLoading] = useState(true);
  // Initialize timeRemaining either from localStorage or calculate it from endTime
  const [timeRemaining, setTimeRemaining] = useState<string>(() => {
    const stored = getFromLocalStorage<string>("timeRemaining", "N/A");

    // If we have an endTime in gameState, recalculate the time (more accurate than using stored value)
    const initialGameState = getFromLocalStorage<GameState>("gameState", {
      gameStatus: "Stopped",
      isRegistrationOpen: false,
      currentRound: 0,
      activeUsers: 0,
    });

    if (
      initialGameState.endTime &&
      initialGameState.gameStatus === "In Progress"
    ) {
      const endTime = new Date(initialGameState.endTime).getTime();
      const now = new Date().getTime();
      const difference = endTime - now;

      if (difference <= 0) return "Ended";

      // Convert to minutes and seconds
      const minutes = Math.floor(difference / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      return `${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`;
    }

    return stored;
  });

  const { socket } = useSocket();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate time remaining
  const calculateTimeRemaining = useCallback((endTimeStr?: string): string => {
    if (!endTimeStr) return "N/A";

    const endTime = new Date(endTimeStr).getTime();
    const now = new Date().getTime();
    const difference = endTime - now;

    if (difference <= 0) return "Ended";

    // Convert to minutes and seconds
    const minutes = Math.floor(difference / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  }, []);

  // Update game state and save to localStorage
  const updateGameState = useCallback((newState: Partial<GameState>) => {
    setGameState((prev) => {
      const gameStatus: "In Progress" | "Stopped" =
        newState.currentRound && newState.currentRound > 0
          ? "In Progress"
          : "Stopped";

      const updated: GameState = {
        ...prev,
        ...newState,
        gameStatus,
      };
      saveToLocalStorage("gameState", updated);
      return updated;
    });
  }, []);

  // Update teams and save to localStorage
  const updateTeams = useCallback((newTeams: Team[]) => {
    setTeams(newTeams);
    saveToLocalStorage("teams", newTeams);
  }, []);

  // Handle game state updates from socket
  const handleGameStateUpdate = useCallback(
    (newState: Partial<GameState>) => {
      console.log("Game state update received:", newState);
      updateGameState(newState);
    },
    [updateGameState]
  );

  // Handle leaderboard updates from socket
  const handleLeaderboardUpdate = useCallback(
    (leaderboardData: Team[]) => {
      console.log("Leaderboard update received:", leaderboardData);
      updateTeams(leaderboardData);
      updateGameState({
        activeUsers: leaderboardData.length,
      });
    },
    [updateGameState, updateTeams]
  );

  // Fetch initial states
  useEffect(() => {
    const fetchInitialStates = async () => {
      try {
        setIsLoading(true);
        const [regResponse, gameResponse, teamsResponse] = await Promise.all([
          fetch(`${BACKEND_URL}/api/game/registration/status`),
          fetch(`${BACKEND_URL}/api/game/current-state`),
          fetch(`${BACKEND_URL}/api/game/leaderboard`),
        ]);

        if (!regResponse.ok || !gameResponse.ok || !teamsResponse.ok) {
          throw new Error("Failed to fetch game state");
        }

        const [regData, gameData, teamsData] = await Promise.all([
          regResponse.json(),
          gameResponse.json(),
          teamsResponse.json(),
        ]);

        const newTeams = teamsData.data || [];
        updateTeams(newTeams);

        const gameStatus: "In Progress" | "Stopped" =
          gameData.currentRound > 0 ? "In Progress" : "Stopped";

        const newGameState: GameState = {
          gameStatus,
          isRegistrationOpen: regData.isRegistrationOpen,
          currentRound: gameData.currentRound,
          activeUsers: newTeams.length,
          endTime: gameData.endTime,
        };

        updateGameState(newGameState);

        // Save last update timestamp
        saveToLocalStorage("lastStateUpdate", new Date().getTime());
      } catch (error) {
        console.error("Error fetching states:", error);
        toast.error("Failed to fetch game state");
      } finally {
        setIsLoading(false);
      }
    };

    // Check if we have recent data (less than 30 seconds old)
    const lastUpdate = getFromLocalStorage<number>("lastStateUpdate", 0);
    const now = new Date().getTime();
    const thirtySecondsInMs = 30 * 1000;

    // If data is stale or doesn't exist, fetch new data
    if (now - lastUpdate > thirtySecondsInMs) {
      fetchInitialStates();
    } else {
      // If we have recent data, just end loading
      setIsLoading(false);
    }
  }, [updateGameState, updateTeams]);

  // Socket event handlers
  useEffect(() => {
    if (!socket) return;

    // Set up socket event listeners
    socket.on("gameStateUpdate", handleGameStateUpdate);
    socket.on("leaderboardUpdate", handleLeaderboardUpdate);
    socket.on("registrationStatusChange", (status: "open" | "closed") => {
      updateGameState({
        isRegistrationOpen: status === "open",
      });
    });
    socket.on("roundTerminated", () => {
      updateGameState({
        currentRound: 0,
        gameStatus: "Stopped",
        endTime: undefined,
      });
    });

    // Request initial state
    socket.emit("requestInitialState");

    // Cleanup
    return () => {
      socket.off("gameStateUpdate", handleGameStateUpdate);
      socket.off("leaderboardUpdate", handleLeaderboardUpdate);
      socket.off("registrationStatusChange");
      socket.off("roundTerminated");
    };
  }, [socket, handleGameStateUpdate, handleLeaderboardUpdate, updateGameState]);

  // Timer effect to update countdown
  useEffect(() => {
    // Clear existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (!gameState.endTime || gameState.gameStatus !== "In Progress") {
      setTimeRemaining("N/A");
      // Store in localStorage
      saveToLocalStorage("timeRemaining", "N/A");
      return;
    }

    // Function to update the timer that we can call both immediately and in the interval
    const updateTimer = () => {
      const remaining = calculateTimeRemaining(gameState.endTime);
      setTimeRemaining(remaining);

      // Store the endTime in its own localStorage key for refresh resilience
      saveToLocalStorage("gameEndTime", gameState.endTime);

      // Update localStorage with current time
      saveToLocalStorage("timeRemaining", remaining);

      // Clear interval if timer has ended
      if (remaining === "Ended") {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      }
    };

    // Update time initially
    updateTimer();

    // Set up interval to update countdown every second
    timerRef.current = setInterval(updateTimer, 1000);

    // Cleanup interval on component unmount or when endTime changes
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [gameState.endTime, gameState.gameStatus, calculateTimeRemaining]);

  // Clear global timer interval when component mounts
  useEffect(() => {
    if (typeof window !== "undefined" && window.__timerIntervalId) {
      clearInterval(window.__timerIntervalId);
      window.__timerIntervalId = undefined;
    }
  }, []);

  const stats = [
    {
      title: "Current Round",
      value:
        gameState.gameStatus === "Stopped"
          ? "Not Started"
          : `Round ${gameState.currentRound}`,
      description: "Active game round",
      icon: Timer,
      iconColor: "text-orange-500",
      bgColor: "bg-orange-50",
    },
    {
      title: "Registration",
      value: gameState.isRegistrationOpen ? "Open" : "Closed",
      description: "Registration status",
      icon: PlayCircle,
      iconColor: gameState.isRegistrationOpen
        ? "text-green-500"
        : "text-red-500",
      bgColor: gameState.isRegistrationOpen ? "bg-green-50" : "bg-red-50",
    },
    {
      title: "Registered Teams",
      value: teams.length,
      description: "Total teams registered",
      icon: Users,
      iconColor: "text-purple-500",
      bgColor: "bg-purple-50",
    },
    {
      title: "Time Remaining",
      value: timeRemaining,
      description: "Time left in current round",
      icon: Clock,
      iconColor: "text-blue-500",
      bgColor: "bg-blue-50",
    },
  ];

  if (isLoading && teams.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/4 mt-4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-6"
        >
          <div className="flex items-center space-x-4">
            <div
              className={`${stat.bgColor} p-3 rounded-full transition-colors`}
            >
              <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {stat.title}
              </h3>
              <p className="text-sm text-gray-500">{stat.description}</p>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
