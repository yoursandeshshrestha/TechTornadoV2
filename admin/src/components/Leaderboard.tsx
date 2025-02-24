import React, { useEffect, useState, useCallback } from "react";
import { Trophy, Crown, Medal, Star } from "lucide-react";
import { useSocket } from "@/hooks/useSocket";

interface Team {
  teamName: string;
  totalScore: number;
  teamMembers: string[];
  collegeName?: string;
}

export function Leaderboard() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { socket, subscribeToGameState, unsubscribeFromGameState } =
    useSocket();

  const BACKEND_URL =
    process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:8000";

  // Handle individual score updates
  const handleScoreUpdate = useCallback((data: Team) => {
    console.log("Score update received:", data);
    setTeams((currentTeams) => {
      // Create a new array with the updated team
      const updatedTeams = currentTeams.map((team) =>
        team.teamName === data.teamName ? { ...team, ...data } : team
      );

      // If the team isn't in the list, add it
      if (!updatedTeams.find((t) => t.teamName === data.teamName)) {
        updatedTeams.push(data);
      }

      // Sort by score and take top 10
      return updatedTeams
        .sort((a, b) => b.totalScore - a.totalScore)
        .slice(0, 10);
    });
  }, []);

  // Handle full leaderboard updates
  const handleLeaderboardUpdate = useCallback((data: Team[]) => {
    console.log("Leaderboard update received:", data);
    if (Array.isArray(data)) {
      setTeams(data.sort((a, b) => b.totalScore - a.totalScore).slice(0, 10));
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchInitialLeaderboard = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/game/leaderboard`);
        if (!response.ok) {
          throw new Error("Failed to fetch leaderboard");
        }
        const data = await response.json();

        if (isMounted && data.success && Array.isArray(data.data)) {
          handleLeaderboardUpdate(data.data);
        }
      } catch (err) {
        console.error("Error fetching initial leaderboard:", err);
        setError("Failed to load leaderboard");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    // Set up socket events
    if (socket) {
      socket.on("scoreUpdate", handleScoreUpdate);
      socket.on("leaderboardUpdate", handleLeaderboardUpdate);
      socket.emit("requestInitialState");

      // Request an immediate leaderboard update
      socket.emit("requestLeaderboard");
    }

    fetchInitialLeaderboard();

    return () => {
      isMounted = false;
      if (socket) {
        socket.off("scoreUpdate", handleScoreUpdate);
        socket.off("leaderboardUpdate", handleLeaderboardUpdate);
      }
    };
  }, [socket, handleScoreUpdate, handleLeaderboardUpdate]);

  // Rank icon mapping
  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Crown className="h-6 w-6 text-yellow-500" />;
      case 1:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 2:
        return <Star className="h-6 w-6 text-orange-500" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-md">
        <div className="flex items-center gap-4 mb-8">
          <Trophy className="h-8 w-8 text-yellow-500" />
          <h2 className="text-3xl font-bold text-gray-800">Leaderboard</h2>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-md">
        <div className="flex items-center gap-4 mb-4">
          <Trophy className="h-8 w-8 text-yellow-500" />
          <h2 className="text-3xl font-bold text-gray-800">Leaderboard</h2>
        </div>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <div className="flex items-center gap-4 mb-8">
        <Trophy className="h-8 w-8 text-yellow-500" />
        <h2 className="text-3xl font-bold text-gray-800">Leaderboard</h2>
      </div>

      {teams.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No teams available</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left">
                <th className="py-4 text-gray-500 font-medium">Rank</th>
                <th className="py-4 text-gray-500 font-medium">Team</th>
                <th className="py-4 text-gray-500 font-medium">Member 1</th>
                <th className="py-4 text-gray-500 font-medium">Member 2</th>
                <th className="py-4 text-gray-500 font-medium">College</th>
                <th className="py-4 text-right text-gray-500 font-medium">
                  Score
                </th>
              </tr>
            </thead>
            <tbody>
              {teams.map((team, index) => (
                <tr
                  key={team.teamName}
                  className={`hover:bg-gray-50 transition-colors ${
                    index < 3 ? "bg-gradient-to-r" : ""
                  } ${
                    index === 0
                      ? "from-yellow-50 to-transparent"
                      : index === 1
                      ? "from-gray-50 to-transparent"
                      : index === 2
                      ? "from-orange-50 to-transparent"
                      : ""
                  }`}
                >
                  <td className="py-4">
                    <div className="flex items-center gap-2">
                      {getRankIcon(index)}
                      <span
                        className={`font-bold ${
                          index === 0
                            ? "text-yellow-600"
                            : index === 1
                            ? "text-gray-600"
                            : index === 2
                            ? "text-orange-600"
                            : "text-gray-400"
                        }`}
                      >
                        #{index + 1}
                      </span>
                    </div>
                  </td>
                  <td className="py-4">
                    <span className="font-semibold text-gray-900">
                      {team.teamName}
                    </span>
                  </td>
                  <td className="py-4 text-gray-600">
                    {team.teamMembers[0] || "-"}
                  </td>
                  <td className="py-4 text-gray-600">
                    {team.teamMembers[1] || "-"}
                  </td>
                  <td className="py-4 text-gray-600">
                    {team.collegeName || "-"}
                  </td>
                  <td className="py-4 text-right">
                    <span
                      className={`font-bold text-2xl ${
                        index === 0
                          ? "text-yellow-600"
                          : index === 1
                          ? "text-gray-600"
                          : index === 2
                          ? "text-orange-600"
                          : "text-gray-600"
                      }`}
                    >
                      {team.totalScore}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
