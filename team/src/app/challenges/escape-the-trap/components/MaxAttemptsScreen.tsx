import React, { useEffect } from "react";
import { XCircle } from "lucide-react";
import { useRouter } from "next/navigation";

interface MaxAttemptsScreenProps {
  onClick: () => void;
  redirectTime?: number; // Time in seconds before auto-redirect
}

const MaxAttemptsScreen: React.FC<MaxAttemptsScreenProps> = ({
  onClick,
  redirectTime = 5, // Default to 5 seconds
}) => {
  const router = useRouter();

  // Auto-redirect after specified seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/");
    }, redirectTime * 1000);

    // Cleanup timer on unmount
    return () => clearTimeout(timer);
  }, [router, redirectTime]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-indigo-950 to-black flex items-center justify-center p-4 overflow-hidden">
      {/* Animated background effects */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated glowing particles */}
        <div className="absolute top-1/4 left-1/4 w-24 h-24 rounded-full bg-red-500/10 blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-1/4 right-1/3 w-32 h-32 rounded-full bg-purple-500/10 blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/3 right-1/4 w-40 h-40 rounded-full bg-red-500/10 blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>

        {/* Grid overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSg3OSwgNzAsIDE1MywgMC4xKSIgc3Ryb2tlLXdpZHRoPSIxIj48L3BhdGg+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIj48L3JlY3Q+PC9zdmc+')] opacity-40"></div>
      </div>

      {/* Card with glow effect */}
      <div className="relative max-w-lg w-full rounded-xl overflow-hidden shadow-[0_0_60px_rgba(220,38,38,0.3)] transition-all duration-500">
        {/* Inner content */}
        <div className="relative bg-gray-900 rounded-xl p-8 md:p-12 backdrop-blur-md border border-red-500/10">
          <div className="flex flex-col items-center text-center space-y-8">
            {/* Alert icon with pulsing animation */}
            <div className="relative">
              <div className="absolute inset-0 bg-red-500/20 rounded-full blur-md animate-ping"></div>
              <XCircle className="h-20 w-20 text-red-500 relative z-10" />
            </div>

            {/* Title with text gradient */}
            <h1 className="text-4xl font-bold bg-gradient-to-r from-red-400 to-rose-500 bg-clip-text text-transparent">
              MAXIMUM ATTEMPTS REACHED
            </h1>

            {/* Description */}
            <div className="space-y-4 text-gray-300">
              <p className="text-xl">Your team has exhausted all attempts.</p>
              <p className="text-lg">
                Redirecting to dashboard in{" "}
                <span className="text-red-400 font-bold">{redirectTime}</span>{" "}
                seconds...
              </p>
            </div>

            {/* Button with hover effect */}
            <button
              onClick={onClick}
              className="mt-8 px-8 py-4 bg-gradient-to-r from-red-600 to-rose-500 rounded-lg text-white font-medium text-lg 
              transform hover:scale-105 transition-all duration-300 hover:shadow-[0_0_20px_rgba(220,38,38,0.5)] relative overflow-hidden group"
            >
              <span className="relative z-10">Return to Dashboard</span>
              <span className="absolute inset-0 bg-gradient-to-r from-red-500 to-rose-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            </button>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="fixed bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500/30 to-transparent"></div>
      <div className="fixed top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500/30 to-transparent"></div>
    </div>
  );
};

export default MaxAttemptsScreen;
