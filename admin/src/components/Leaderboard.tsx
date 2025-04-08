import React, { useEffect, useState, useCallback } from "react";
import { Trophy, Crown, Medal, Star } from "lucide-react";
import { useSocket } from "@/hooks/useSocket";

interface Team {
  teamName: string;
  totalScore: number;
  teamMembers: string[];
  collegeName?: string;
  scoreUpdatedAt?: string; // General timestamp tracking
  scoreHistory?: { [score: number]: string }; // Tracks timestamp when each score level was reached
  scores?: {
    round1: number;
    round2: number;
    round3: {
      challenge1: number;
      challenge2: number;
      total: number;
    };
  };
}

export function Leaderboard() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { socket } = useSocket();

  const BACKEND_URL =
    process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:8000";

  // Sort teams with tiebreaking by timestamp at each score level
  const sortTeams = useCallback((teamsToSort: Team[]) => {
    return [...teamsToSort].sort((a, b) => {
      // First sort by score (highest first)
      if (b.totalScore !== a.totalScore) {
        return b.totalScore - a.totalScore;
      }

      // Current score that we're comparing
      const currentScore = a.totalScore;

      // If scores are equal, check when each team reached THIS specific score
      if (a.scoreHistory?.[currentScore] && b.scoreHistory?.[currentScore]) {
        return (
          new Date(a.scoreHistory[currentScore]).getTime() -
          new Date(b.scoreHistory[currentScore]).getTime()
        );
      }

      // If score history not available, fall back to general timestamp
      if (a.scoreUpdatedAt && b.scoreUpdatedAt) {
        return (
          new Date(a.scoreUpdatedAt).getTime() -
          new Date(b.scoreUpdatedAt).getTime()
        );
      }

      // Fallback to alphabetical sorting if timestamps aren't available
      return a.teamName.localeCompare(b.teamName);
    });
  }, []);

  // Handle individual score updates
  const handleScoreUpdate = useCallback(
    (data: Team) => {
      console.log("Score update received:", data);
      setTeams((currentTeams) => {
        // Find the existing team if any
        const existingTeam = currentTeams.find(
          (t) => t.teamName === data.teamName
        );

        const updatedTeam = { ...data };
        const currentTimestamp = new Date().toISOString();

        // Initialize or copy scoreHistory
        updatedTeam.scoreHistory =
          existingTeam?.scoreHistory || ({} as { [score: number]: string });

        // New team or score increased scenario
        if (!existingTeam) {
          // New team, set current timestamp
          updatedTeam.scoreUpdatedAt = currentTimestamp;

          // Record timestamp for the current score
          updatedTeam.scoreHistory[data.totalScore] = currentTimestamp;
        } else if (data.totalScore > existingTeam.totalScore) {
          // Score increased, update general timestamp
          updatedTeam.scoreUpdatedAt = currentTimestamp;

          // Record timestamp for each score level from previous max to current
          // This ensures we have timestamps for all score levels the team achieved
          for (
            let score = existingTeam.totalScore + 1;
            score <= data.totalScore;
            score++
          ) {
            updatedTeam.scoreHistory[score] = currentTimestamp;
          }
        } else {
          // Score didn't increase, keep the existing timestamps
          updatedTeam.scoreUpdatedAt = existingTeam.scoreUpdatedAt;
        }

        console.log(
          `Team ${data.teamName} score history:`,
          updatedTeam.scoreHistory
        );

        // Create a new array with the updated team
        const updatedTeams = currentTeams.map((team) =>
          team.teamName === data.teamName ? { ...team, ...updatedTeam } : team
        );

        // If the team isn't in the list, add it
        if (!updatedTeams.find((t) => t.teamName === data.teamName)) {
          updatedTeams.push(updatedTeam);
        }

        // Sort with tiebreaking and take top 10
        return sortTeams(updatedTeams).slice(0, 10);
      });
    },
    [sortTeams]
  );

  // Handle full leaderboard updates
  const handleLeaderboardUpdate = useCallback(
    (data: Team[]) => {
      console.log("Leaderboard update received:", data);
      if (Array.isArray(data)) {
        // Get current teams for reference to preserve score history
        setTeams((currentTeams) => {
          const currentTimestamp = new Date().toISOString();

          // Merge incoming data with existing team data to preserve score history
          const updatedData = data.map((newTeam) => {
            const existingTeam = currentTeams.find(
              (t) => t.teamName === newTeam.teamName
            );

            // If we already have this team, preserve its score history
            if (existingTeam) {
              const scoreHistory =
                existingTeam.scoreHistory ||
                ({} as { [score: number]: string });

              // If the score has changed, record a timestamp for the new score
              if (newTeam.totalScore > existingTeam.totalScore) {
                // Record timestamps for any new score levels
                for (
                  let score = existingTeam.totalScore + 1;
                  score <= newTeam.totalScore;
                  score++
                ) {
                  scoreHistory[score] = currentTimestamp;
                }
              }

              return {
                ...newTeam,
                scoreUpdatedAt:
                  newTeam.scoreUpdatedAt ||
                  existingTeam.scoreUpdatedAt ||
                  currentTimestamp,
                scoreHistory,
              };
            }

            // For new teams, initialize score history
            const scoreHistory: { [score: number]: string } = {};
            scoreHistory[newTeam.totalScore] = currentTimestamp;

            return {
              ...newTeam,
              scoreUpdatedAt: newTeam.scoreUpdatedAt || currentTimestamp,
              scoreHistory,
            };
          });

          // Sort with tiebreaking and take top 10
          return sortTeams(updatedData).slice(0, 10);
        });
      }
    },
    [sortTeams]
  );

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
  }, [socket, handleScoreUpdate, handleLeaderboardUpdate, BACKEND_URL]);

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
                <th className="py-4 text-right text-gray-500 font-medium">
                  Last Updated
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
                    <div className="flex flex-col items-end">
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
                      {team.scores && (
                        <span className="text-xs text-gray-500 mt-1">
                          R1: {team.scores.round1} | R2: {team.scores.round2} |
                          R3:{" "}
                          {team.scores.round3.challenge1 +
                            team.scores.round3.challenge2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 text-right text-gray-500 text-sm">
                    {team.scoreHistory && team.scoreHistory[team.totalScore]
                      ? new Date(
                          team.scoreHistory[team.totalScore]
                        ).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                          hour12: true,
                        })
                      : team.scoreUpdatedAt
                      ? new Date(team.scoreUpdatedAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                          hour12: true,
                        })
                      : "-"}
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
