import React from "react";

const VisualEffects: React.FC = () => (
  <>
    {/* Matrix-like code rain effect */}
    <div className="absolute inset-0 z-0 overflow-hidden opacity-30">
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="absolute text-green-500 text-xs font-mono animate-matrix-fall"
          style={{
            left: `${Math.random() * 100}%`,
            top: `-${Math.random() * 100}px`,
            animationDuration: `${5 + Math.random() * 10}s`,
            animationDelay: `${Math.random() * 5}s`,
          }}
        >
          {Array.from({ length: 20 }).map((_, j) => (
            <div key={j}>{Math.random() > 0.5 ? "1" : "0"}</div>
          ))}
        </div>
      ))}
    </div>

    {/* Floating elements */}
    <div className="fixed top-1/4 left-1/4 w-2 h-2 rounded-full bg-green-500 opacity-70 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.7)]"></div>
    <div className="fixed top-3/4 left-1/2 w-3 h-3 rounded-full bg-cyan-500 opacity-50 animate-ping shadow-[0_0_10px_rgba(6,182,212,0.7)]"></div>
    <div className="fixed top-1/2 right-1/4 w-2 h-2 rounded-full bg-yellow-300 opacity-60 animate-bounce shadow-[0_0_10px_rgba(253,224,71,0.7)]"></div>
    <div className="fixed top-1/3 right-1/3 w-4 h-4 rounded-full bg-red-500 opacity-40 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.7)]"></div>
    <div className="fixed top-2/3 left-1/3 w-3 h-3 rounded-full bg-purple-500 opacity-30 animate-ping shadow-[0_0_10px_rgba(168,85,247,0.7)]"></div>

    {/* Scan lines effect */}
    <div className="pointer-events-none fixed inset-0 z-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgogIDxkZWZzPgogICAgPHBhdHRlcm4KICAgICAgaWQ9InNjYW5saW5lcyIKICAgICAgd2lkdGg9IjEiCiAgICAgIGhlaWdodD0iOCIKICAgICAgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIKICAgICAgcGF0dGVyblRyYW5zZm9ybT0ic2NhbGUoMSwyKSIKICAgID4KICAgICAgPHJlY3Qgd2lkdGg9IjEiIGhlaWdodD0iMSIgZmlsbD0iIzAwMCIgZmlsbC1vcGFjaXR5PSIwLjA1Ii8+CiAgICA8L3BhdHRlcm4+CiAgPC9kZWZzPgogIDxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjc2NhbmxpbmVzKSIvPgo8L3N2Zz4=')] opacity-20"></div>

    {/* Glitch effect overlay */}
    <div className="pointer-events-none fixed inset-0 z-10 bg-gradient-to-b from-transparent via-green-500/5 to-transparent opacity-30"></div>
  </>
);

export default VisualEffects;
