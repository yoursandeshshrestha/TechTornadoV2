"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getTokenFromCookie } from "@/utils/auth";

export const useRequireAuth = () => {
  const router = useRouter();

  useEffect(() => {
    const token = getTokenFromCookie();

    if (!token) {
      router.push("/login");
    }
  }, [router]);
};
