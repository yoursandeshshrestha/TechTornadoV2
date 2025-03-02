"use client";

import React, { useEffect } from "react";
import { useRequireAuth } from "@/hooks/useRequireAuth";

export default function ChallengesPage() {
  useRequireAuth();

  useEffect(() => {
    window.location.replace("/");
  }, []);

  return null; // Prevents rendering any UI since the page will redirect immediately
}
