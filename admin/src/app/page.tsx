import React from "react";
import { Wind, ArrowRight } from "lucide-react";
import Link from "next/link";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-slate-200 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.5))] -z-10" />

      {/* Gradient Orbs */}
      <div className="absolute top-0 -left-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob" />
      <div className="absolute top-0 -right-40 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-40 left-20 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000" />

      {/* Content */}
      <div className="relative h-screen flex flex-col">
        {/* Navbar */}
        <nav className="px-8 py-6 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Wind className="h-8 w-8 text-blue-600" />
            <span className="font-bold text-2xl bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
              Tech Tornado
            </span>
          </div>
        </nav>

        {/* Main Content - Centered both horizontally and vertically */}
        <main className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-md px-4">
            {/* Admin Card - Improved with better shadows and hover effects */}
            <div className="group relative bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 ring-1 ring-black/[0.08]">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative p-8 flex flex-col h-[350px]">
                <div className="bg-blue-100/80 w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                  <Wind className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                  Admin Portal
                </h3>
                <p className="text-gray-600 flex-grow text-lg">
                  Manage competitions, create questions, and track participant
                  performance through comprehensive admin dashboard.
                </p>
                <Link href="/login">
                  <button className="mt-6 w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-xl font-medium flex items-center justify-center group-hover:shadow-lg group-hover:shadow-blue-500/25 transition-all duration-500">
                    Admin Login
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </button>
                </Link>
              </div>
            </div>

            {/* Optional decorative element below card */}
            <div className="mt-6 text-center text-gray-500 text-sm">
              <p>Welcome to Tech Tornado Admin</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default LandingPage;
