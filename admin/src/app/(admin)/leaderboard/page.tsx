"use client";

import { useEffect, useState, useCallback } from "react";
import { Trophy, Crown, Medal, Star } from "lucide-react";
import { useSocket } from "@/hooks/useSocket";

interface Team {
  teamName: string;
  totalScore: number;
  teamMembers: string[];
  collegeName?: string;
}

interface LeaderboardData {
  data?: Team[];
  success?: boolean;
  teamName?: string;
  totalScore?: number;
  teamMembers?: string[];
  collegeName?: string;
}

export default function LeaderboardPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const { subscribe, unsubscribe } = useSocket();

  const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;

  const updateTeams = useCallback((newTeams: Team[]) => {
    const validTeams = newTeams.map((team) => ({
      teamName: team.teamName || "",
      totalScore: typeof team.totalScore === "number" ? team.totalScore : 0,
      teamMembers: Array.isArray(team.teamMembers) ? team.teamMembers : [],
      collegeName: team.collegeName || "",
    }));

    const sortedTeams = validTeams.sort((a, b) => b.totalScore - a.totalScore);
    setTeams(sortedTeams.slice(0, 10));
  }, []);

  const handleLeaderboardUpdate = useCallback(
    (leaderboardData: LeaderboardData | Team[]) => {
      console.log("Received leaderboard update:", leaderboardData);

      let teamsData: Team[] = [];

      if (Array.isArray(leaderboardData)) {
        teamsData = leaderboardData;
      } else if (leaderboardData.data && Array.isArray(leaderboardData.data)) {
        teamsData = leaderboardData.data;
      } else if (typeof leaderboardData === "object") {
        setTeams((currentTeams) => {
          const existingTeams = [...currentTeams];
          const teamIndex = existingTeams.findIndex(
            (t) => t.teamName === leaderboardData.teamName
          );

          if (teamIndex >= 0) {
            existingTeams[teamIndex] = {
              ...existingTeams[teamIndex],
              ...(leaderboardData as Team),
            };
          } else if (leaderboardData.teamName) {
            existingTeams.push(leaderboardData as Team);
          }

          return existingTeams
            .sort((a, b) => b.totalScore - a.totalScore)
            .slice(0, 10);
        });
        return;
      }

      updateTeams(teamsData);
    },
    [updateTeams]
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
    <div className=" bg-white p-8  ">
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
