import React from "react";
import "./game-animations.css";

export default function CrackThePasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen">{children}</div>;
}
