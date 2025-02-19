"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/lib/redux/store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  return (
    <div className="p-8 text-black">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <p>Welcome to the admin dashboard!</p>
    </div>
  );
}
