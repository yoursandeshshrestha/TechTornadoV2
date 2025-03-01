"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast, Toaster } from "sonner";
import { setTokenCookie, saveTeamInfo } from "@/utils/auth";

interface RegisterFormData {
  teamName: string;
  collegeName: string;
  memberOne: string;
  memberTwo: string;
  password: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<RegisterFormData>({
    teamName: "",
    collegeName: "",
    memberOne: "",
    memberTwo: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

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

      if (!formData.collegeName.trim()) {
        toast.error("College name is required");
        setIsLoading(false);
        return;
      }

      if (!formData.memberOne.trim()) {
        toast.error("At least one team member is required");
        setIsLoading(false);
        return;
      }

      if (!formData.password) {
        toast.error("Password is required");
        setIsLoading(false);
        return;
      }

      if (formData.password.length < 6) {
        toast.error("Password must be at least 6 characters long");
        setIsLoading(false);
        return;
      }

      // Show loading toast
      const loadingToast = toast.loading("Registering your team...");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/teams/register`,
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
        if (res.status === 409) {
          toast.error("Team name already exists. Please choose another name.");
        } else if (res.status === 400) {
          toast.error(data.message || "Invalid information provided");
        } else {
          toast.error(data.message || "Registration failed. Please try again.");
        }
        throw new Error(data.message || "Registration failed");
      }

      // Store the token in cookies
      setTokenCookie(data.token);

      // Store team info in localStorage
      saveTeamInfo({
        teamName: formData.teamName,
        collegeName: formData.collegeName,
        // Add other team data from the response if available
      });

      // Success toast
      toast.success(data.message || "Registration successful!");

      // Redirect to dashboard
      setTimeout(() => {
        router.push("/");
      }, 1500);
    } catch (err: any) {
      console.error("Registration error:", err);
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
            Register your team
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
                  htmlFor="collegeName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  College Name
                </label>
                <input
                  id="collegeName"
                  name="collegeName"
                  type="text"
                  required
                  value={formData.collegeName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label
                  htmlFor="memberOne"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Member 1
                </label>
                <input
                  id="memberOne"
                  name="memberOne"
                  type="text"
                  required
                  value={formData.memberOne}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label
                  htmlFor="memberTwo"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Member 2 (Optional)
                </label>
                <input
                  id="memberTwo"
                  name="memberTwo"
                  type="text"
                  value={formData.memberTwo}
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
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 px-4 rounded-xl font-medium flex items-center justify-center hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 disabled:opacity-70"
              >
                {isLoading ? "Registering..." : "Register"}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have a team?{" "}
              <Link
                href="/login"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
