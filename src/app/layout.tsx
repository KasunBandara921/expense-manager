import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AntigravityDots } from "@/components/background/antigravity-dots";
import "./globals.css";

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
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AntigravityDots />
        <div className="relative z-10 min-h-screen">{children}</div>
      </body>
    </html>
  );
}
