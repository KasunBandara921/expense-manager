"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus, Edit2, Check, X, RefreshCw, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

type CategoryWithStats = {
  id: string;
  name: string;
  color: string | null;
  icon: string | null;
  budget: number | null;
  spent: number;
};

interface CategoriesClientProps {
  initialCategories: CategoryWithStats[];
}

const PRESET_COLORS = [
  "#3b82f6", // Blue
  "#10b981", // Emerald
  "#8b5cf6", // Violet
  "#f59e0b", // Amber
  "#ef4444", // Rose
  "#6366f1", // Indigo
  "#ec4899", // Pink
  "#14b8a6", // Teal
];

export function CategoriesClient({ initialCategories }: CategoriesClientProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<CategoryWithStats[]>(initialCategories);

  // Budget editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBudgetVal, setEditBudgetVal] = useState("");
  const [updatingBudget, setUpdatingBudget] = useState(false);

  // New category form state
  const [name, setName] = useState("");
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [icon, setIcon] = useState("📁");
  const [budget, setBudget] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Sync categories prop update
  useEffect(() => {
    setCategories(initialCategories);
  }, [initialCategories]);

  // Handle setting a new budget
  const handleUpdateBudget = async (id: string) => {
    setUpdatingBudget(true);
    try {
      const parsedBudget = editBudgetVal === "" ? null : parseFloat(editBudgetVal);
      if (parsedBudget !== null && isNaN(parsedBudget)) {
        alert("Please enter a valid budget amount");
        return;
      }

      const res = await fetch(`/api/categories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ budget: parsedBudget }),
      });

      if (res.ok) {
        const data = await res.json();
        setCategories((prev) =>
          prev.map((cat) =>
            cat.id === id
              ? { ...cat, budget: data.category.budget ? Number(data.category.budget) : null }
              : cat
          )
        );
        setEditingId(null);
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update budget");
      }
    } catch (err) {
      console.error("Error updating budget:", err);
      alert("Something went wrong");
    } finally {
      setUpdatingBudget(false);
    }
  };

  // Handle creating a new category
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    if (!name.trim()) {
      setError("Category name is required");
      setSubmitting(false);
      return;
    }

    try {
      // Step 1: Create the category
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, color, icon }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create category");
        setSubmitting(false);
        return;
      }

      const newCatId = data.category.id;

      // Step 2: If a budget was specified, set it via PATCH
      if (budget.trim()) {
        const parsedBudget = parseFloat(budget);
        if (!isNaN(parsedBudget)) {
          await fetch(`/api/categories/${newCatId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ budget: parsedBudget }),
          });
        }
      }

      // Reset form
      setName("");
      setColor(PRESET_COLORS[0]);
      setIcon("📁");
      setBudget("");
      router.refresh();
    } catch (err) {
      console.error("Error creating category:", err);
      setError("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  // Helper to trigger inline budget editing
  const startEditing = (cat: CategoryWithStats) => {
    setEditingId(cat.id);
    setEditBudgetVal(cat.budget !== null ? cat.budget.toString() : "");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Category Grid */}
      <div className="lg:col-span-2 space-y-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-zinc-50">Your Categories</h2>

        {categories.length === 0 ? (
          <Card className="bg-white/40 dark:bg-zinc-900/40 border-gray-200/50 dark:border-zinc-800/50">
            <CardContent className="py-12 text-center text-gray-500 dark:text-zinc-400">
              No categories found. Create your first category on the right!
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map((cat) => {
              const hasBudget = cat.budget !== null && cat.budget > 0;
              const percent = hasBudget ? (cat.spent / (cat.budget as number)) * 100 : 0;
              const isOverBudget = hasBudget && cat.spent > (cat.budget as number);
              const isNearBudget = hasBudget && !isOverBudget && percent >= 80;

              // Color configuration
              let progressColorClass = "bg-indigo-600 dark:bg-indigo-500";
              if (isOverBudget) progressColorClass = "bg-red-500";
              else if (isNearBudget) progressColorClass = "bg-amber-500";
              else if (cat.color) progressColorClass = ""; // Inline styled below

              return (
                <Card
                  key={cat.id}
                  className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm border-gray-200/60 dark:border-zinc-800/60 relative overflow-hidden transition-all duration-200 hover:shadow-md"
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="h-9 w-9 flex items-center justify-center rounded-lg text-lg border"
                          style={{
                            backgroundColor: `${cat.color}15`,
                            borderColor: `${cat.color}40`,
                            color: cat.color || undefined,
                          }}
                        >
                          {cat.icon || "📁"}
                        </span>
                        <div>
                          <CardTitle className="text-base font-bold text-gray-900 dark:text-zinc-50">
                            {cat.name}
                          </CardTitle>
                        </div>
                      </div>

                      {/* Budget Display / Inline Edit */}
                      <div className="text-right">
                        {editingId === cat.id ? (
                          <div className="flex items-center gap-1">
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="Limit"
                              value={editBudgetVal}
                              onChange={(e) => setEditBudgetVal(e.target.value)}
                              className="w-20 h-7 text-xs px-1.5 py-0.5 bg-white dark:bg-zinc-950 border-gray-300"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleUpdateBudget(cat.id);
                                if (e.key === "Escape") setEditingId(null);
                              }}
                            />
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleUpdateBudget(cat.id)}
                              disabled={updatingBudget}
                              className="h-6 w-6 text-green-600 hover:bg-green-50"
                            >
                              {updatingBudget ? (
                                <RefreshCw className="h-3 w-3 animate-spin" />
                              ) : (
                                <Check className="h-3.5 w-3.5" />
                              )}
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => setEditingId(null)}
                              className="h-6 w-6 text-red-500 hover:bg-red-50"
                            >
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        ) : (
                          <div className="group flex items-center gap-1 justify-end">
                            <span className="text-xs text-gray-500 dark:text-zinc-400">
                              {hasBudget ? `Budget: Rs. ${(cat.budget as number).toFixed(2)}` : "No budget"}
                            </span>
                            <button
                              onClick={() => startEditing(cat)}
                              className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-gray-400 hover:text-indigo-600 transition-opacity dark:hover:text-indigo-400"
                            >
                              <Edit2 className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                        <p className="text-sm font-bold text-gray-900 dark:text-zinc-50 mt-0.5">
                          Spent: Rs. ${cat.spent.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-2">
                    {/* Budget Warning Banner */}
                    {isOverBudget && (
                      <div className="mb-3 flex items-center gap-1.5 text-xs text-red-600 bg-red-50 border border-red-100 rounded px-2 py-1 dark:bg-red-950/20 dark:border-red-900/30 dark:text-red-400">
                        <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                        <span>Over budget by Rs. ${(cat.spent - (cat.budget as number)).toFixed(2)}!</span>
                      </div>
                    )}
                    {isNearBudget && (
                      <div className="mb-3 flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded px-2 py-1 dark:bg-amber-950/20 dark:border-amber-900/30 dark:text-amber-400">
                        <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                        <span>Approaching budget ({percent.toFixed(0)}% used)</span>
                      </div>
                    )}

                    {/* Progress Bar */}
                    {hasBudget && (
                      <div className="space-y-1">
                        <div className="w-full bg-gray-100 dark:bg-zinc-800 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${progressColorClass}`}
                            style={{
                              width: `${Math.min(percent, 100)}%`,
                              backgroundColor: !progressColorClass && cat.color ? cat.color : undefined,
                            }}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] text-gray-500 dark:text-zinc-400">
                          <span>{percent.toFixed(0)}% used</span>
                          <span>Rs. ${Math.max(0, (cat.budget as number) - cat.spent).toFixed(2)} left</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Creation form */}
      <div>
        <Card className="bg-white/60 dark:bg-zinc-900/60 backdrop-blur-sm border-gray-200/50 dark:border-zinc-800/50 sticky top-24">
          <CardHeader>
            <CardTitle className="text-lg">Create Category</CardTitle>
            <CardDescription>Add a custom category to track specific expenses.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Category Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="e.g. Subscriptions, Gym"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={submitting}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="budget">Monthly Budget Limit (Rs.) (Optional)</Label>
                <Input
                  id="budget"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="e.g. 150.00"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  disabled={submitting}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="icon">Icon (Emoji)</Label>
                  <Input
                    id="icon"
                    type="text"
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    className="text-center font-bold text-lg"
                    placeholder="📁"
                    maxLength={2}
                    disabled={submitting}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>Color Preset</Label>
                  <div className="grid grid-cols-4 gap-2 pt-1">
                    {PRESET_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setColor(c)}
                        className={`h-6 w-6 rounded-full border transition-all ${
                          color === c
                            ? "border-black dark:border-white ring-2 ring-indigo-500 scale-110"
                            : "border-transparent hover:scale-105"
                        }`}
                        style={{ backgroundColor: c }}
                        disabled={submitting}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {error && <p className="text-xs text-red-600 mt-2">{error}</p>}

              <Button
                type="submit"
                className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Category
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

