"use client";

import { useEffect } from "react";
import EscapeTheTrap from "@/components/EscapeTheTrap";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import "./game-animations.css";

export default function EscapeThetrapPage() {
  const { isLoading, isAuthenticated } = useAuth(true); // Require authentication
  const router = useRouter();

  // Also use the more strict auth hook for double protection
  useRequireAuth();

  // CSS animations are now imported from the game-animations.css file

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-green-500 text-lg font-mono">
          Loading secure terminal...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // The useAuth hook will redirect
  }

  return (
    <div className="min-h-screen bg-black">
      <EscapeTheTrap />
    </div>
  );
}
