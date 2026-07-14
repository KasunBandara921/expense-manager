"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wallet, Plus, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/dashboard/theme-toggle";
import { LogoutButton } from "@/components/dashboard/logout-button";
import { useState } from "react";

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Expenses", href: "/expenses" },
    { name: "Categories", href: "/categories" },
    { name: "AI Insights", href: "/insights" },
  ];

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200/60 bg-white/80 backdrop-blur-md dark:border-gray-800/60 dark:bg-zinc-950/80 transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl text-indigo-600 dark:text-indigo-400">
              <Wallet className="h-6 w-6" />
              <span>SmartSpend</span>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`text-sm font-medium transition-colors hover:text-indigo-600 dark:hover:text-indigo-400 ${
                  isActive(item.href)
                    ? "text-indigo-600 dark:text-indigo-400 font-semibold"
                    : "text-gray-600 dark:text-gray-300"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Right Side Controls */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            <Link href="/expenses/add">
              <Button size="sm" className="gap-1 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-medium shadow-sm transition-all duration-200">
                <Plus className="h-4 w-4" />
                <span>Add Expense</span>
              </Button>
            </Link>
            <LogoutButton />
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-zinc-900 transition-colors focus:outline-none"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-zinc-950 p-4 space-y-3 transition-colors duration-300">
          <nav className="flex flex-col gap-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-gray-50 dark:hover:bg-zinc-900/60 ${
                  isActive(item.href)
                    ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-semibold"
                    : "text-gray-600 dark:text-gray-300"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>
          <div className="border-t border-gray-100 dark:border-gray-800 pt-3 flex flex-col gap-2">
            <Link href="/expenses/add" onClick={() => setMobileMenuOpen(false)} className="w-full">
              <Button className="w-full gap-1 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-medium">
                <Plus className="h-4 w-4" />
                Add Expense
              </Button>
            </Link>
            <div className="flex justify-end pt-1">
              <LogoutButton />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
