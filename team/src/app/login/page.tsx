"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast, Toaster } from "sonner";
import { setTokenCookie, saveTeamInfo } from "@/utils/auth";

interface LoginFormData {
  teamName: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isRegistered = searchParams.get("registered");

  const [formData, setFormData] = useState<LoginFormData>({
    teamName: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    // Check for successful registration message
    if (isRegistered) {
      toast.success(
        "Registration successful! Please log in with your credentials."
      );
    }
  }, [isRegistered]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Form validation
      if (!formData.teamName.trim()) {
        toast.error("Team name is required");
        setIsLoading(false);
        return;
      }

      if (!formData.password) {
        toast.error("Password is required");
        setIsLoading(false);
        return;
      }

      // Show loading toast
      const loadingToast = toast.loading("Logging in...");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/teams/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await res.json();

      // Dismiss loading toast
      toast.dismiss(loadingToast);

      if (!res.ok || !data.success) {
        // Handle specific error cases
        if (res.status === 401) {
          toast.error("Invalid team name or password");
        } else if (res.status === 404) {
          toast.error("Team not found");
        } else {
          toast.error(data.message || "Login failed. Please try again.");
        }
        throw new Error(data.message || "Login failed");
      }

      // Store the token in cookies
      setTokenCookie(data.token);

      // Store team info in localStorage
      saveTeamInfo({
        teamName: formData.teamName,
        // Add other team data from the response if available
        ...(data.team || {}),
      });

      // Success toast
      toast.success("Login successful!");

      // Redirect to dashboard
      setTimeout(() => {
        router.push("/");
      });
    } catch (err: any) {
      console.error("Login error:", err);
      // Error is already shown via toast above
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Toaster component */}
      <Toaster position="top-right" richColors />

      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="px-8 py-6">
          <h1 className="text-2xl font-bold text-center text-gray-900 mb-6">
            Team Login
          </h1>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="teamName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Team Name
                </label>
                <input
                  id="teamName"
                  name="teamName"
                  type="text"
                  required
                  value={formData.teamName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white py-3 px-4 rounded-xl font-medium flex items-center justify-center hover:shadow-lg hover:shadow-indigo-500/25 transition-all duration-300 disabled:opacity-70"
              >
                {isLoading ? "Logging in..." : "Login"}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have a team yet?{" "}
              <Link
                href="/register"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Register
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
