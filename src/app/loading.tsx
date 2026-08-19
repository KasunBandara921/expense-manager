"use client";

import { useEffect, useState } from "react";
import { Wallet } from "lucide-react";

const MESSAGES = [
  "Securing your budget vault...",
  "Summoning financial wisdom...",
  "Polishing your dashboards...",
  "Mapping expense categories...",
  "Analyzing spend behaviors...",
  "Whispering to the AI advisors...",
];

export default function Loading() {
  const [messageIndex, setMessageIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setMessageIndex((prev) => (prev + 1) % MESSAGES.length);
        setFade(true);
      }, 300); // Wait for fade-out duration before swapping text
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh] w-full px-4 select-none transition-all duration-300">
      {/* Inject custom CSS keyframes for smooth, premium custom motions */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes loading-bar {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(0%); }
          100% { transform: translateX(100%); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-loading-bar {
          animation: loading-bar 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
      `}</style>

      {/* Main Glassmorphic Card Container */}
      <div className="bg-white/40 dark:bg-zinc-950/40 backdrop-blur-md border border-gray-200/50 dark:border-zinc-800/50 rounded-2xl p-8 max-w-sm w-full shadow-xl flex flex-col items-center justify-center relative overflow-hidden transition-all duration-300">
        
        {/* Glow Effects */}
        <div className="absolute -top-12 -left-12 w-28 h-28 bg-indigo-500/10 dark:bg-indigo-400/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-28 h-28 bg-violet-500/10 dark:bg-violet-400/5 rounded-full blur-2xl pointer-events-none" />

        {/* Animated Icon Ring System */}
        <div className="relative flex items-center justify-center w-24 h-24 mb-6">
          {/* Pulsing Outer Glow */}
          <div className="absolute inset-0 rounded-full bg-indigo-500/10 dark:bg-indigo-400/10 animate-ping [animation-duration:2.5s]" />
          
          {/* Spinning Dash Circle */}
          <div className="absolute w-20 h-20 rounded-full border border-dashed border-indigo-400/40 dark:border-indigo-500/30 animate-spin [animation-duration:12s]" />
          
          {/* Glowing Outer Sphere */}
          <div className="absolute w-16 h-16 rounded-full bg-indigo-100/50 dark:bg-zinc-900/50 border border-indigo-200/30 dark:border-zinc-800/30 flex items-center justify-center animate-pulse" />
          
          {/* Inner Floating Emblem */}
          <div className="relative w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 dark:shadow-indigo-500/5 animate-float">
            <Wallet className="h-6 w-6 text-white" />
          </div>
        </div>

        {/* Logo Text */}
        <div className="text-center mb-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-1.5 justify-center">
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400 bg-clip-text text-transparent">SmartSpend</span>
          </h2>
          <span className="text-[10px] font-bold text-indigo-500/80 dark:text-indigo-400/80 tracking-widest uppercase">
            Loading System
          </span>
        </div>

        {/* Sliding Progress Indicator */}
        <div className="w-44 h-1 bg-gray-100 dark:bg-zinc-800/60 rounded-full overflow-hidden mb-4 border border-gray-200/10 dark:border-zinc-800/10">
          <div className="h-full w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-500 rounded-full animate-loading-bar" style={{ transformOrigin: "left" }} />
        </div>

        {/* Dynamic Status Message */}
        <div className="h-6 flex items-center justify-center">
          <p className={`text-xs font-medium text-gray-500 dark:text-zinc-400 text-center transition-opacity duration-300 ${
            fade ? "opacity-100" : "opacity-0"
          }`}>
            {MESSAGES[messageIndex]}
          </p>
        </div>
      </div>
    </div>
  );
}
