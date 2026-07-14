import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AntigravityDots } from "@/components/background/antigravity-dots";
import "./globals.css";

import { ThemeInitializer } from "@/components/dashboard/theme-initializer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SmartSpend",
  description: "Track and manage your personal expenses",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground transition-colors duration-300`}
      >
        <ThemeInitializer />
        <AntigravityDots />
        <div className="relative z-10 min-h-screen">{children}</div>
      </body>
    </html>
  );
}
