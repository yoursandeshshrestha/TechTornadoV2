import type { Metadata } from "next";
import { ReduxProvider } from "@/lib/redux/provider";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Admin Panel",
  description: "The Challenge Game",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.png" type="image/png" />
      </head>
      <body>
        <ReduxProvider>
          {children}
          <Toaster position="top-right" />
        </ReduxProvider>
      </body>
    </html>
  );
}
