import { useEffect, useState, useCallback } from "react";
import { Users, PlayCircle, Timer } from "lucide-react";
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

export default function GameStats() {
  const [gameState, setGameState] = useState<GameState>({
    gameStatus: "Stopped",
    isRegistrationOpen: false,
    currentRound: 0,
    activeUsers: 0,
  });
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { socket } = useSocket();

  const handleGameStateUpdate = useCallback((newState: Partial<GameState>) => {
    console.log("Game state update received:", newState);
    setGameState((prev) => ({
      ...prev,
      ...newState,
      gameStatus:
        newState.currentRound && newState.currentRound > 0
          ? "In Progress"
          : "Stopped",
    }));
  }, []);

  const handleLeaderboardUpdate = useCallback((leaderboardData: Team[]) => {
    console.log("Leaderboard update received:", leaderboardData);
    setTeams(leaderboardData);
    setGameState((prev) => ({
      ...prev,
      activeUsers: leaderboardData.length,
    }));
  }, []);

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

        setTeams(teamsData.data || []);
        setGameState({
          gameStatus: gameData.currentRound > 0 ? "In Progress" : "Stopped",
          isRegistrationOpen: regData.isRegistrationOpen,
          currentRound: gameData.currentRound,
          activeUsers: (teamsData.data || []).length,
          endTime: gameData.endTime,
        });
      } catch (error) {
        console.error("Error fetching states:", error);
        toast.error("Failed to fetch game state");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialStates();
  }, []);

  // Socket event handlers
  useEffect(() => {
    if (!socket) return;

    // Set up socket event listeners
    socket.on("gameStateUpdate", handleGameStateUpdate);
    socket.on("leaderboardUpdate", handleLeaderboardUpdate);
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
        gameStatus: "Stopped",
        endTime: undefined,
      }));
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
  }, [socket, handleGameStateUpdate, handleLeaderboardUpdate]);

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
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
