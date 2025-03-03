"use client";

import { useEffect } from "react";
import { useRequireAuth } from "@/hooks/useRequireAuth";

export default function ChallengesPage() {
  useRequireAuth();

  useEffect(() => {
    window.location.replace("/");
  }, []);

  return null;
}
