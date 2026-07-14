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
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground transition-colors duration-300 flex flex-col min-h-screen`}
      >
        <ThemeInitializer />
        <AntigravityDots />
        <div className="relative z-10 flex-grow">{children}</div>
        <footer className="relative z-10 w-full border-t border-gray-200/50 dark:border-zinc-800/50 bg-white/40 dark:bg-zinc-950/40 py-6 text-center text-sm text-gray-500 dark:text-zinc-400">
          Developed by OOP
        </footer>
      </body>
    </html>
  );
}
