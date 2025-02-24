"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/lib/redux/store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import GameStats from "@/components/GameStats";
import { GameControls } from "@/components/GameControls";
import { Leaderboard } from "@/components/Leaderboard";

export default function DashboardPage() {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  return (
    <>
      <GameStats />
      <GameControls />
      <Leaderboard />
    </>
  );
}
