// components/round2/BackgroundEffects.tsx
import React from "react";

interface BackgroundEffectsProps {
  backgroundImage?: string;
  overlayColor?: string;
  children: React.ReactNode;
}

const BackgroundEffects: React.FC<BackgroundEffectsProps> = ({
  backgroundImage = "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?q=80",
  overlayColor = "from-gray-900/90 via-blue-900/80 to-gray-900/90",
  children,
}) => {
  return (
    <div
      className="min-h-screen bg-cover bg-center p-4 overflow-hidden relative"
      style={{ backgroundImage: `url('${backgroundImage}')` }}
    >
      {/* Dark overlay */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${overlayColor} backdrop-blur-sm z-0`}
      ></div>

      {/* Digital grid lines */}
      <div className="absolute inset-0 z-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzVmOWVhMCIgb3BhY2l0eT0iMC4yIiBzdHJva2Utd2lkdGg9IjEiLz48cGF0aCBkPSJNIDQwIDAgTCAwIDQwIE0gMCAwIEwgNDAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzVmOWVhMCIgb3BhY2l0eT0iMC4yIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')]"></div>

      {/* Content */}
      <div className="relative z-10">{children}</div>

      {/* Floating elements */}
      <div className="fixed top-1/4 left-1/4 w-2 h-2 rounded-full bg-blue-500 opacity-70 animate-pulse"></div>
      <div className="fixed top-3/4 left-1/2 w-3 h-3 rounded-full bg-indigo-500 opacity-50 animate-ping"></div>
      <div className="fixed top-1/2 right-1/4 w-2 h-2 rounded-full bg-cyan-300 opacity-60 animate-bounce"></div>
    </div>
  );
};

export default BackgroundEffects;
