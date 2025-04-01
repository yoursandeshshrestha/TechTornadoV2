"use client";

import { useEffect, useState, useCallback } from "react";
import { Trophy, Crown, Medal, Star } from "lucide-react";
import { useSocket } from "@/hooks/useSocket";

interface Team {
  teamName: string;
  totalScore: number;
  teamMembers: string[];
  collegeName?: string;
  scoreUpdatedAt?: string; // General timestamp tracking
  scoreHistory?: { [score: number]: string }; // Tracks timestamp when each score level was reached
}

interface LeaderboardData {
  data?: Team[];
  success?: boolean;
  teamName?: string;
  totalScore?: number;
  teamMembers?: string[];
  collegeName?: string;
  scoreUpdatedAt?: string;
}

export default function LeaderboardPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const { subscribe, unsubscribe } = useSocket();

  const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;

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

  // const updateTeams = useCallback(
  //   (newTeams: Team[]) => {
  //     const validTeams = newTeams.map((team) => ({
  //       teamName: team.teamName || "",
  //       totalScore: typeof team.totalScore === "number" ? team.totalScore : 0,
  //       teamMembers: Array.isArray(team.teamMembers) ? team.teamMembers : [],
  //       collegeName: team.collegeName || "",
  //       scoreUpdatedAt: team.scoreUpdatedAt || new Date().toISOString(),
  //       scoreHistory:
  //         team.scoreHistory ||
  //         ({
  //           [team.totalScore]: team.scoreUpdatedAt || new Date().toISOString(),
  //         } as { [score: number]: string }),
  //     }));

  //     // Apply our custom sorting in the frontend
  //     const sortedTeams = sortTeams(validTeams);
  //     setTeams(sortedTeams.slice(0, 10));
  //   },
  //   [sortTeams]
  // );

  const handleLeaderboardUpdate = useCallback(
    (leaderboardData: LeaderboardData | Team[]) => {
      console.log("Received leaderboard update:", leaderboardData);

      let teamsData: Team[] = [];

      if (Array.isArray(leaderboardData)) {
        teamsData = leaderboardData;
      } else if (leaderboardData.data && Array.isArray(leaderboardData.data)) {
        teamsData = leaderboardData.data;
      } else if (
        typeof leaderboardData === "object" &&
        leaderboardData.teamName
      ) {
        // For single team updates, we'll handle score history
        setTeams((currentTeams) => {
          const existingTeams = [...currentTeams];
          const teamIndex = existingTeams.findIndex(
            (t) => t.teamName === leaderboardData.teamName
          );

          const updatedTeam = {
            ...(leaderboardData as Team),
          };

          const currentTimestamp = new Date().toISOString();

          // Handle score history for existing team
          if (teamIndex >= 0) {
            const existingTeam = existingTeams[teamIndex];
            const currentScore = existingTeam.totalScore;
            const newScore = updatedTeam.totalScore;

            // Initialize or copy scoreHistory
            updatedTeam.scoreHistory =
              existingTeam.scoreHistory || ({} as { [score: number]: string });

            // If the score has increased, update timestamps for new score levels
            if (newScore > currentScore) {
              updatedTeam.scoreUpdatedAt = currentTimestamp;

              // Record timestamp for each new score level
              for (let score = currentScore + 1; score <= newScore; score++) {
                updatedTeam.scoreHistory[score] = currentTimestamp;
              }
            } else {
              // Keep the existing timestamp if score hasn't increased
              updatedTeam.scoreUpdatedAt = existingTeam.scoreUpdatedAt;
            }

            existingTeams[teamIndex] = {
              ...existingTeam,
              ...updatedTeam,
            };
          } else if (leaderboardData.teamName) {
            // For new teams, initialize score history
            const scoreHistory: { [score: number]: string } = {};
            scoreHistory[updatedTeam.totalScore] = currentTimestamp;

            updatedTeam.scoreUpdatedAt = currentTimestamp;
            updatedTeam.scoreHistory = scoreHistory;
            existingTeams.push(updatedTeam);
          }

          console.log(
            `Team ${updatedTeam.teamName} score history:`,
            updatedTeam.scoreHistory
          );

          // Apply our custom sorting and return the result
          return sortTeams(existingTeams);
        });
        return;
      }

      // Get current teams for reference to preserve score history
      setTeams((currentTeams) => {
        const currentTimestamp = new Date().toISOString();

        // Merge incoming data with existing team data to preserve score history
        const updatedData = teamsData.map((newTeam) => {
          const existingTeam = currentTeams.find(
            (t) => t.teamName === newTeam.teamName
          );

          // If we already have this team, preserve its score history
          if (existingTeam) {
            const scoreHistory =
              existingTeam.scoreHistory || ({} as { [score: number]: string });

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
    },
    [sortTeams]
  );

  useEffect(() => {
    const fetchInitialLeaderboard = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/game/leaderboard`);
        if (!response.ok) {
          throw new Error("Failed to fetch leaderboard");
        }
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          handleLeaderboardUpdate(data.data);
        }
      } catch (error) {
        console.error("Error fetching initial leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialLeaderboard();

    // Subscribe to socket events
    subscribe("leaderboardUpdate", handleLeaderboardUpdate);
    subscribe("teamRegistered", handleLeaderboardUpdate);

    // Cleanup subscriptions
    return () => {
      unsubscribe("leaderboardUpdate", handleLeaderboardUpdate);
      unsubscribe("teamRegistered", handleLeaderboardUpdate);
    };
  }, [subscribe, unsubscribe, apiUrl, handleLeaderboardUpdate]);

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Crown className="h-6 w-6 text-yellow-500 animate-bounce" />;
      case 1:
        return <Medal className="h-6 w-6 text-gray-400 animate-pulse" />;
      case 2:
        return <Star className="h-6 w-6 text-orange-500 animate-pulse" />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white p-8">
      <div className="flex items-center gap-4 mb-8">
        <Trophy className="h-8 w-8 text-yellow-500" />
        <h1 className="text-3xl font-bold text-gray-800">Leaderboard</h1>
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="h-12 bg-gray-100 rounded animate-pulse" />
          <div className="h-12 bg-gray-100 rounded animate-pulse" />
          <div className="h-12 bg-gray-100 rounded animate-pulse" />
        </div>
      ) : teams.length === 0 ? (
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
