"use client";

import React from "react";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import ChallengeHub from "@/components/CrackThePassword/ChallengeHub";

export default function CrackThePasswordPage() {
  useRequireAuth();

  return <ChallengeHub />;
}
