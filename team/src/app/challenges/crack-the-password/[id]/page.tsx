"use client";

import React, { useEffect, useState } from "react";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import ChallengeFactory from "@/components/round2/ChallengeFactory";
import { useParams } from "next/navigation";

export default function ChallengePage() {
  // Ensure user is authenticated
  useRequireAuth();

  const params = useParams();
  const [challengeId, setChallengeId] = useState<number | null>(null);

  useEffect(() => {
    if (params && params.id) {
      setChallengeId(parseInt(params.id as string, 10));
    }
  }, [params]);

  if (challengeId === null) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="text-white">Loading challenge...</div>
      </div>
    );
  }

  return <ChallengeFactory challengeId={challengeId} />;
}
