"use client";

import dynamic from "next/dynamic";

// Dynamically import the AICharades component to ensure it loads only on the client
const AICharades = dynamic(() => import("@/components/AICharades/AICharades"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-[url('https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80')] bg-cover bg-center p-4 flex items-center justify-center">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 via-purple-900/70 to-black/90 backdrop-blur-sm z-0"></div>
      <div className="relative z-10 flex flex-col items-center gap-3">
        <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
        <div className="text-white text-xl font-medium">
          Loading Challenge...
        </div>
      </div>
    </div>
  ),
});

export default function AICharadesPage() {
  return <AICharades />;
}
