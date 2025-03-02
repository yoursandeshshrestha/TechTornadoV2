"use client";

import React from "react";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import ChallengeHub from "@/components/round2/ChallengeHub";

export default function CrackThePasswordPage() {
  // Ensure user is authenticated
  useRequireAuth();

  return <ChallengeHub />;
}
