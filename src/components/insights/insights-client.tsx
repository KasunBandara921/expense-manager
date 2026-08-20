"use client";

import { useState, useMemo } from "react";
import { Sparkles, Loader2, AlertCircle, AlertTriangle, Lightbulb, Wallet, ArrowUpRight, TrendingDown } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type ExpenseWithCategory = {
  id: string;
  amount: number;
  description: string;
  date: string;
  categoryId: string;
  category: {
    id: string;
    name: string;
    color: string | null;
    icon: string | null;
    budget: number | null;
  };
};

type RecommendationsResponse = {
  summary: string;
  tips: string[];
  source?: "gemini" | "local";
  model?: string;
  notice?: string;
};

interface InsightsClientProps {
  expenses: ExpenseWithCategory[];
  hasExpenses: boolean;
}

export function InsightsClient({ expenses, hasExpenses }: InsightsClientProps) {
  const [data, setData] = useState<RecommendationsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generate = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/recommendations", { method: "POST" });
      const body = await res.json();

      if (!res.ok) {
        setError(body.error || "Could not generate recommendations");
        return;
      }

      setData(body);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Local rule-based insights
  const localStats = useMemo(() => {
    if (expenses.length === 0) return null;

    // Group by category
    const catMap: Record<string, { name: string; spent: number; budget: number | null; icon: string | null; color: string | null }> = {};
    let highestExpense = expenses[0];
    const weekdaySpent = Array(7).fill(0); // 0 = Sunday, etc.

    expenses.forEach((exp) => {
      // 1. Group by category
      if (!catMap[exp.categoryId]) {
        catMap[exp.categoryId] = {
          name: exp.category.name,
          spent: 0,
          budget: exp.category.budget ? Number(exp.category.budget) : null,
          icon: exp.category.icon,
          color: exp.category.color,
        };
      }
      catMap[exp.categoryId].spent += exp.amount;

      // 2. Highest Single Expense
      if (exp.amount > highestExpense.amount) {
        highestExpense = exp;
      }

      // 3. Group by weekday
      const day = new Date(exp.date).getDay();
      weekdaySpent[day] += exp.amount;
    });

    // Find highest spending category
    const catList = Object.values(catMap);
    const topCategory = catList.reduce((max, curr) => (curr.spent > max.spent ? curr : max), catList[0]);

    // Find day of week with highest spending
    const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const maxDayVal = Math.max(...weekdaySpent);
    const topDayIdx = weekdaySpent.indexOf(maxDayVal);
    const topDay = maxDayVal > 0 ? weekdays[topDayIdx] : null;

    // Over budget counts
    const overBudgetCats = catList.filter((c) => c.budget !== null && c.spent > c.budget);

    return {
      topCategory,
      highestExpense,
      topDay,
      overBudgetCatsCount: overBudgetCats.length,
      overBudgetCats,
    };
  }, [expenses]);

  return (
    <div className="space-y-8">
      {/* Local Statistics Insights */}
      {localStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white/40 dark:bg-zinc-900/40 border-gray-200/50 dark:border-zinc-800/50">
            <CardHeader className="pb-2">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-zinc-400">Top Spending Category</span>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <span className="text-xl">{localStats.topCategory?.icon}</span>
                <p className="text-lg font-bold text-gray-900 dark:text-zinc-50">{localStats.topCategory?.name}</p>
              </div>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">Total: Rs. {localStats.topCategory?.spent.toFixed(2)}</p>
            </CardContent>
          </Card>

          <Card className="bg-white/40 dark:bg-zinc-900/40 border-gray-200/50 dark:border-zinc-800/50">
            <CardHeader className="pb-2">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-zinc-400">Peak Spending Day</span>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-bold text-gray-900 dark:text-zinc-50">{localStats.topDay || "N/A"}</p>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">Most transaction volume on this day</p>
            </CardContent>
          </Card>

          <Card className="bg-white/40 dark:bg-zinc-900/40 border-gray-200/50 dark:border-zinc-800/50">
            <CardHeader className="pb-2">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-zinc-400">Highest Purchase</span>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-bold text-gray-900 dark:text-zinc-50">Rs. {localStats.highestExpense?.amount.toFixed(2)}</p>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1 truncate" title={localStats.highestExpense?.description}>
                {localStats.highestExpense?.description}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/40 dark:bg-zinc-900/40 border-gray-200/50 dark:border-zinc-800/50">
            <CardHeader className="pb-2">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-zinc-400">Budget Status</span>
            </CardHeader>
            <CardContent>
              {localStats.overBudgetCatsCount > 0 ? (
                <div className="flex items-center gap-1.5 text-red-600 dark:text-red-400">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <p className="text-lg font-bold">{localStats.overBudgetCatsCount} Over Limit</p>
                </div>
              ) : (
                <p className="text-lg font-bold text-green-600 dark:text-green-400">All Budgets Safe</p>
              )}
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">Check Categories for details</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main AI Recommendations generator card */}
      <Card className="border-violet-200/80 dark:border-violet-800/50 bg-gradient-to-br from-violet-50/70 to-indigo-50/30 dark:from-zinc-900/40 dark:to-zinc-950/60 backdrop-blur-sm shadow-sm">
        <CardHeader>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl font-bold">
                <Sparkles className="h-5 w-5 text-violet-600 dark:text-violet-400 animate-pulse" />
                AI Spending Plan & Saving Tips
              </CardTitle>
              <CardDescription className="text-gray-500 dark:text-zinc-400">
                Receive custom savings plan, flags on impulsive spending, and actionable recommendations based on your logs.
              </CardDescription>
            </div>
            <Button
              onClick={generate}
              disabled={loading || !hasExpenses}
              className="shrink-0 bg-violet-600 hover:bg-violet-700 dark:bg-violet-600 dark:hover:bg-violet-700 text-white font-medium shadow-sm transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing logs...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate AI Insights
                </>
              )}
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {!hasExpenses && (
            <div className="flex flex-col items-center py-6 text-center text-gray-500 dark:text-zinc-400">
              <AlertCircle className="h-10 w-10 text-gray-300 mb-2" />
              <p className="font-semibold text-sm">No Expense Data</p>
              <p className="text-xs">Add some expenses first, then come back for AI-powered saving tips.</p>
            </div>
          )}

          {hasExpenses && !data && !error && !loading && (
            <div className="border border-dashed border-violet-100 dark:border-violet-950/30 rounded-xl p-8 text-center text-gray-500 dark:text-zinc-400">
              <Lightbulb className="h-10 w-10 text-violet-400 dark:text-violet-500 mx-auto mb-2" />
              <p className="font-bold text-sm text-gray-700 dark:text-zinc-300">Unlock Premium Spending Advice</p>
              <p className="text-xs max-w-md mx-auto mt-1">
                We'll pass your recent category transactions to Gemini AI to spot trends and draft customized recommendations.
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30 rounded-xl p-4 text-sm flex items-start gap-2.5">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <div className="space-y-1">
                <p className="font-bold">Generation Failed</p>
                <p>{error}</p>
              </div>
            </div>
          )}

          {/* AI Result View */}
          {data && (
            <div className="space-y-6 pt-2">
              {data.notice && (
                <div className="text-xs text-amber-800 bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30 rounded-lg p-3">
                  {data.notice}
                </div>
              )}

              {/* Summary Card */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-400">AI Spending Analysis</h3>
                <div className="bg-white/80 dark:bg-zinc-950/50 border border-gray-100/60 dark:border-zinc-800/40 rounded-xl p-5 leading-relaxed text-gray-700 dark:text-zinc-300 text-sm">
                  {data.summary}
                </div>
              </div>

              {/* Actionable Tips */}
              <div className="space-y-3">
                <div className="flex items-center gap-1">
                  <TrendingDown className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-400">Custom Recommendations</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {data.tips.map((tip, idx) => (
                    <div
                      key={idx}
                      className="flex gap-3 text-sm text-gray-700 dark:text-zinc-300 bg-white/70 dark:bg-zinc-950/40 border border-violet-100/50 dark:border-violet-950/30 rounded-xl p-4 transition-all hover:shadow-sm"
                    >
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-700 dark:bg-violet-950 dark:text-violet-300 shrink-0">
                        {idx + 1}
                      </span>
                      <p className="leading-relaxed">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>

              {data.source === "gemini" && data.model && (
                <div className="flex justify-between items-center text-[10px] text-gray-400 dark:text-zinc-500 pt-2 border-t border-gray-100 dark:border-zinc-800/40">
                  <span>SmartSpend AI Insights Engine</span>
                  <span>Model: {data.model}</span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Warnings & Suggestions Sidebar details */}
      {localStats && localStats.overBudgetCatsCount > 0 && (
        <Card className="bg-red-50/40 dark:bg-red-950/10 border-red-200/50 dark:border-red-900/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-red-800 dark:text-red-400 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Immediate Spending Flags
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-gray-600 dark:text-zinc-400">
              The following categories have exceeded their monthly budgets. Consider slowing down expenses in these categories.
            </p>
            <div className="space-y-2">
              {localStats.overBudgetCats.map((cat) => (
                <div
                  key={cat.name}
                  className="flex justify-between items-center text-xs p-2 bg-white/80 dark:bg-zinc-950/40 border border-red-100 dark:border-red-950/40 rounded-lg"
                >
                  <span className="font-semibold text-gray-700 dark:text-zinc-300">
                    {cat.icon} {cat.name}
                  </span>
                  <span className="text-red-600 dark:text-red-400 font-bold">
                    Rs. {cat.spent.toFixed(2)} / Rs. {(cat.budget as number).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
