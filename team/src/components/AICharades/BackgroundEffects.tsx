"use client";

import React from "react";

const BackgroundEffects: React.FC = () => {
  return (
    <>
      {/* Digital rain effect */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={i}
            className="absolute text-cyan-500/30 text-xs font-mono animate-matrix-fall"
            style={{
              left: `${Math.random() * 100}%`,
              top: `-${Math.random() * 100}px`,
              animationDuration: `${3 + Math.random() * 5}s`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          >
            {Array.from({ length: 20 }).map((_, j) => (
              <div key={j}>{Math.random() > 0.5 ? "1" : "0"}</div>
            ))}
          </div>
        ))}
      </div>

      {/* Energy particles */}
      <div className="fixed top-1/4 left-1/4 w-3 h-3 rounded-full bg-cyan-500 opacity-70 animate-pulse shadow-[0_0_15px_rgba(6,182,212,0.7)]"></div>
      <div className="fixed top-3/4 left-1/2 w-4 h-4 rounded-full bg-purple-500 opacity-60 animate-ping shadow-[0_0_15px_rgba(168,85,247,0.7)]"></div>
      <div className="fixed top-1/2 right-1/4 w-3 h-3 rounded-full bg-blue-400 opacity-70 animate-bounce shadow-[0_0_15px_rgba(96,165,250,0.7)]"></div>
      <div className="fixed top-1/3 right-1/3 w-5 h-5 rounded-full bg-indigo-500 opacity-50 animate-pulse shadow-[0_0_15px_rgba(99,102,241,0.7)]"></div>

      {/* Digital circuit pattern */}
      <div className="absolute inset-0 z-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iY2lyY3VpdCIgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxwYXRoIGQ9Ik0xMCwxMCBMMzAsMTAgTDMwLDMwIEw3MCwzMCBMNzAsNzAgTDkwLDcwIE05MCw5MCBMMTAsOTAgTDEwLDEwIiBmaWxsPSJub25lIiBzdHJva2U9IiM0MzY4ZmUiIG9wYWNpdHk9IjAuNCIgc3Ryb2tlLXdpZHRoPSIxIi8+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMyIgZmlsbD0iIzQzNjhmZSIgb3BhY2l0eT0iMC40Ii8+PGNpcmNsZSBjeD0iNzAiIGN5PSI3MCIgcj0iMyIgZmlsbD0iIzQzNjhmZSIgb3BhY2l0eT0iMC40Ii8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2NpcmN1aXQpIi8+PC9zdmc+')]"></div>

      {/* Scan lines effect */}
      <div className="pointer-events-none fixed inset-0 z-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgogIDxkZWZzPgogICAgPHBhdHRlcm4KICAgICAgaWQ9InNjYW5saW5lcyIKICAgICAgd2lkdGg9IjEiCiAgICAgIGhlaWdodD0iOCIKICAgICAgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIKICAgICAgcGF0dGVyblRyYW5zZm9ybT0ic2NhbGUoMSwyKSIKICAgID4KICAgICAgPHJlY3Qgd2lkdGg9IjEiIGhlaWdodD0iMSIgZmlsbD0iIzAwMCIgZmlsbC1vcGFjaXR5PSIwLjA1Ii8+CiAgICA8L3BhdHRlcm4+CiAgPC9kZWZzPgogIDxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjc2NhbmxpbmVzKSIvPgo8L3N2Zz4=')] opacity-20"></div>

      {/* Pulsing overlay */}
      <div className="pointer-events-none fixed inset-0 z-10 bg-gradient-to-b from-transparent via-cyan-900/10 to-transparent opacity-30 animate-pulse"></div>
    </>
  );
};

export default BackgroundEffects;
