// hooks/useAuth.ts
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  getTokenFromCookie,
  getTeamInfo,
  removeTokenCookie,
} from "@/utils/auth";

export const useAuth = (redirectIfNotAuthenticated = true) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [teamData, setTeamData] = useState<any>(null);

  useEffect(() => {
    const checkAuth = () => {
      const token = getTokenFromCookie();
      const team = getTeamInfo();

      if (!token) {
        if (redirectIfNotAuthenticated) {
          router.push("/login");
        }
        setIsAuthenticated(false);
        setTeamData(null);
      } else {
        setIsAuthenticated(true);
        setTeamData(team);
      }

      setIsLoading(false);
    };

    checkAuth();
  }, [router, redirectIfNotAuthenticated]);

  const logout = () => {
    removeTokenCookie();
    setIsAuthenticated(false);
    setTeamData(null);
    router.push("/login");
  };

  return {
    isLoading,
    isAuthenticated,
    teamData,
    logout,
  };
};
