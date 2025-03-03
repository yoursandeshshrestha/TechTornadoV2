import React from "react";
import { Terminal } from "lucide-react";

const LoadingScreen: React.FC = () => (
  <div className="min-h-screen bg-black flex items-center justify-center p-4">
    <div className="max-w-md w-full bg-gray-900 rounded-lg p-8 text-center space-y-6 border border-green-900 shadow-[0_0_50px_rgba(34,197,94,0.5)]">
      <Terminal className="h-20 w-20 text-green-500 mx-auto animate-pulse" />
      <h1 className="text-2xl font-bold text-green-500 font-mono">
        INITIALIZING SECURE TERMINAL
      </h1>
      <div className="flex justify-center items-center gap-1">
        <div
          className="h-3 w-3 bg-green-500 rounded-full animate-pulse"
          style={{ animationDelay: "0ms" }}
        ></div>
        <div
          className="h-3 w-3 bg-green-500 rounded-full animate-pulse"
          style={{ animationDelay: "200ms" }}
        ></div>
        <div
          className="h-3 w-3 bg-green-500 rounded-full animate-pulse"
          style={{ animationDelay: "400ms" }}
        ></div>
      </div>
      <div className="w-full bg-black rounded font-mono text-xs text-green-500 p-4 text-left">
        <p>$ initiating_connection...</p>
        <p>$ establishing_secure_channel...</p>
        <p>$ bypassing_firewall...</p>
        <p>$ accessing_challenge_matrix...</p>
        <p>$ syncing_with_server_timer...</p>
      </div>
    </div>
  </div>
);

export default LoadingScreen;
