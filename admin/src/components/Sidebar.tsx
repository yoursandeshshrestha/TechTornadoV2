"use client";

import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  LayoutDashboard,
  HelpCircle,
  PlayCircle,
  LogOut,
  Trophy,
} from "lucide-react";
import { useDispatch } from "react-redux";
import { logout } from "@/lib/redux/features/authSlice";
import { AppDispatch } from "@/lib/redux/store";
import { LogoutDialog } from "./LogoutDialog";

interface SidebarProps {
  className?: string;
}

const navigationItems = [
  {
    title: "Dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
    path: "/dashboard",
  },
  {
    title: "Questions",
    icon: <HelpCircle className="h-5 w-5" />,
    path: "/questions",
  },
  {
    title: "Leaderboard",
    icon: <Trophy className="h-5 w-5" />,
    path: "/leaderboard",
  },
];

export default function Sidebar({ className = "" }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch<AppDispatch>();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  // Function to check if a nav item is active
  const isActive = (path: string) => {
    // Check if the current pathname starts with the nav item's path
    return pathname.startsWith(path);
  };

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  const handleLogoutClick = () => {
    setShowLogoutDialog(true);
  };

  const handleLogoutConfirm = () => {
    dispatch(logout());
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
    router.push("/login");
    setShowLogoutDialog(false);
  };

  const handleLogoutCancel = () => {
    setShowLogoutDialog(false);
  };

  return (
    <>
      <div
        className={`flex h-full w-16 flex-col justify-between border-r bg-white p-3 ${className}`}
      >
        <div className="flex flex-col space-y-4">
          <nav className="flex flex-col space-y-2">
            {navigationItems.map((item) => (
              <div key={item.path} className="relative">
                <button
                  className={`h-12 w-12 flex items-center justify-center rounded-lg transition-colors
                    ${
                      isActive(item.path)
                        ? "bg-blue-500 text-white"
                        : "text-gray-500 hover:bg-gray-100"
                    }`}
                  onClick={() => handleNavigate(item.path)}
                  onMouseEnter={() => setHoveredItem(item.path)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  {item.icon}
                </button>

                {hoveredItem === item.path && (
                  <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-gray-800 text-white px-2 py-1 rounded text-sm whitespace-nowrap z-50">
                    {item.title}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>

        <div className="relative">
          <button
            className="h-12 w-12 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
            onClick={handleLogoutClick}
            onMouseEnter={() => setHoveredItem("logout")}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <LogOut className="h-5 w-5" />
          </button>

          {hoveredItem === "logout" && (
            <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-gray-800 text-white px-2 py-1 rounded text-sm whitespace-nowrap z-50">
              Logout
            </div>
          )}
        </div>
      </div>

      <LogoutDialog
        isOpen={showLogoutDialog}
        onConfirm={handleLogoutConfirm}
        onCancel={handleLogoutCancel}
      />
    </>
  );
}
