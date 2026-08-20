"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, Calendar, Filter, ArrowUpDown, Trash2, SlidersHorizontal, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import type { Category } from "@/types/category";

type ExpenseWithCategory = {
  id: string;
  amount: number;
  description: string;
  date: string | Date;
  categoryId: string;
  category: Category;
};

interface ExpensesClientProps {
  initialExpenses: ExpenseWithCategory[];
  categories: Category[];
}

export function ExpensesClient({ initialExpenses, categories }: ExpensesClientProps) {
  const router = useRouter();
  const [expenses, setExpenses] = useState<ExpenseWithCategory[]>(initialExpenses);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [dateRange, setDateRange] = useState("all"); // all, today, week, month, year
  const [sortBy, setSortBy] = useState("date-desc"); // date-desc, date-asc, amount-desc, amount-asc
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Sync state if props change (e.g., after router.refresh())
  useEffect(() => {
    setExpenses(initialExpenses);
  }, [initialExpenses]);

  // Handle Deletion
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this expense?")) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await fetch(`/api/expenses/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        // Optimistically update UI
        setExpenses((prev) => prev.filter((exp) => exp.id !== id));
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete expense");
      }
    } catch (error) {
      console.error("Error deleting expense:", error);
      alert("Something went wrong");
    } finally {
      setDeletingId(null);
    }
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSearch("");
    setSelectedCategory("all");
    setDateRange("all");
    setSortBy("date-desc");
  };

  // Filter Expenses
  const filteredExpenses = useMemo(() => {
    return expenses
      .filter((expense) => {
        // Search Description
        const matchesSearch = expense.description
          .toLowerCase()
          .includes(search.toLowerCase());

        // Category Filter
        const matchesCategory =
          selectedCategory === "all" || expense.categoryId === selectedCategory;

        // Date Filter
        const expenseDate = new Date(expense.date);
        const now = new Date();
        let matchesDate = true;

        if (dateRange === "today") {
          matchesDate =
            expenseDate.getDate() === now.getDate() &&
            expenseDate.getMonth() === now.getMonth() &&
            expenseDate.getFullYear() === now.getFullYear();
        } else if (dateRange === "week") {
          const oneWeekAgo = new Date();
          oneWeekAgo.setDate(now.getDate() - 7);
          matchesDate = expenseDate >= oneWeekAgo;
        } else if (dateRange === "month") {
          matchesDate =
            expenseDate.getMonth() === now.getMonth() &&
            expenseDate.getFullYear() === now.getFullYear();
        } else if (dateRange === "year") {
          matchesDate = expenseDate.getFullYear() === now.getFullYear();
        }

        return matchesSearch && matchesCategory && matchesDate;
      })
      .sort((a, b) => {
        // Sorting Logic
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();

        if (sortBy === "date-desc") return dateB - dateA;
        if (sortBy === "date-asc") return a.date === b.date ? 0 : dateA - dateB;
        if (sortBy === "amount-desc") return b.amount - a.amount;
        if (sortBy === "amount-asc") return a.amount - b.amount;
        return 0;
      });
  }, [expenses, search, selectedCategory, dateRange, sortBy]);

  // Statistics calculations
  const stats = useMemo(() => {
    const total = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const count = filteredExpenses.length;
    const average = count > 0 ? total / count : 0;
    return { total, count, average };
  }, [filteredExpenses]);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-white/40 dark:bg-zinc-900/40 backdrop-blur-sm border-gray-200/50 dark:border-zinc-800/50">
          <CardHeader className="pb-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-zinc-400">Total Spent (Filtered)</span>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-900 dark:text-zinc-50">Rs. {stats.total.toFixed(2)}</p>
          </CardContent>
        </Card>

        <Card className="bg-white/40 dark:bg-zinc-900/40 backdrop-blur-sm border-gray-200/50 dark:border-zinc-800/50">
          <CardHeader className="pb-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-zinc-400">Transactions</span>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-900 dark:text-zinc-50">{stats.count}</p>
          </CardContent>
        </Card>

        <Card className="bg-white/40 dark:bg-zinc-900/40 backdrop-blur-sm border-gray-200/50 dark:border-zinc-800/50">
          <CardHeader className="pb-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-zinc-400">Average Expense</span>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-900 dark:text-zinc-50">Rs. {stats.average.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Toolbar */}
      <Card className="bg-white/60 dark:bg-zinc-900/60 border-gray-200/50 dark:border-zinc-800/50">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-white dark:bg-zinc-950 border-gray-200 dark:border-zinc-800"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 pl-9 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:border-zinc-800 dark:bg-zinc-950 text-foreground"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range Selector */}
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 pl-9 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:border-zinc-800 dark:bg-zinc-950 text-foreground"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Past 7 Days</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
            </div>

            {/* Sort Selector */}
            <div className="relative">
              <ArrowUpDown className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 pl-9 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:border-zinc-800 dark:bg-zinc-950 text-foreground"
              >
                <option value="date-desc">Date (Newest First)</option>
                <option value="date-asc">Date (Oldest First)</option>
                <option value="amount-desc">Amount (Highest First)</option>
                <option value="amount-asc">Amount (Lowest First)</option>
              </select>
            </div>
          </div>

          {(search || selectedCategory !== "all" || dateRange !== "all" || sortBy !== "date-desc") && (
            <div className="mt-4 flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetFilters}
                className="text-xs text-gray-500 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400"
              >
                <SlidersHorizontal className="mr-2 h-3.5 w-3.5" />
                Clear Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Expenses Table/List Card */}
      <Card className="bg-white/40 dark:bg-zinc-900/40 backdrop-blur-sm border-gray-200/50 dark:border-zinc-800/50">
        <CardContent className="p-0 sm:p-6">
          {filteredExpenses.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-zinc-400">
              <p className="text-base font-semibold">No expenses found</p>
              <p className="text-sm mt-1">Try adjusting your filters or add a new expense.</p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200/50 dark:border-zinc-800/50 text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                      <th className="py-4 px-4">Date</th>
                      <th className="py-4 px-4">Description</th>
                      <th className="py-4 px-4">Category</th>
                      <th className="py-4 px-4 text-right">Amount</th>
                      <th className="py-4 px-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100/50 dark:divide-zinc-800/30 text-sm">
                    {filteredExpenses.map((expense) => (
                      <tr
                        key={expense.id}
                        className="hover:bg-gray-50/40 dark:hover:bg-zinc-800/20 transition-colors"
                      >
                        <td className="py-4 px-4 text-gray-600 dark:text-zinc-300">
                          {new Date(expense.date).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-4 font-medium text-gray-900 dark:text-zinc-50">
                          {expense.description}
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border"
                            style={{
                              backgroundColor: `${expense.category.color}15`,
                              borderColor: `${expense.category.color}40`,
                              color: expense.category.color || undefined,
                            }}
                          >
                            <span>{expense.category.icon}</span>
                            <span>{expense.category.name}</span>
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right font-bold text-gray-900 dark:text-zinc-50">
                          Rs. {expense.amount.toFixed(2)}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={deletingId === expense.id}
                            onClick={() => handleDelete(expense.id)}
                            className="text-gray-400 hover:text-red-600 dark:text-zinc-500 dark:hover:text-red-400 transition-colors"
                          >
                            {deletingId === expense.id ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                            <span className="sr-only">Delete</span>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile List View */}
              <div className="sm:hidden divide-y divide-gray-100/60 dark:divide-zinc-800/30">
                {filteredExpenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="p-4 flex justify-between items-center hover:bg-gray-50/40 dark:hover:bg-zinc-800/10 transition-colors"
                  >
                    <div className="space-y-1">
                      <p className="font-semibold text-gray-900 dark:text-zinc-50">
                        {expense.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium border"
                          style={{
                            backgroundColor: `${expense.category.color}15`,
                            borderColor: `${expense.category.color}40`,
                            color: expense.category.color || undefined,
                          }}
                        >
                          <span>{expense.category.icon}</span>
                          <span>{expense.category.name}</span>
                        </span>
                        <span className="text-xs text-gray-500 dark:text-zinc-400">
                          {new Date(expense.date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-gray-900 dark:text-zinc-50">
                        Rs. {expense.amount.toFixed(2)}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={deletingId === expense.id}
                        onClick={() => handleDelete(expense.id)}
                        className="text-gray-400 hover:text-red-600 dark:text-zinc-500 dark:hover:text-red-400"
                      >
                        {deletingId === expense.id ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
