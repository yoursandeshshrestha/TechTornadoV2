import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tech Tornado",
  description: "The Challenge Game",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.png" type="image/png" />
      </head>
      <body>{children}</body>
    </html>
  );
}
