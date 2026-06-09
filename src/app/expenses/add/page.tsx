"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Category } from "@/types/category";

const DEFAULT_CATEGORIES = [
  { name: "Food", color: "#ef4444", icon: "🍔" },
  { name: "Transport", color: "#3b82f6", icon: "🚗" },
  { name: "Shopping", color: "#8b5cf6", icon: "🛍️" },
  { name: "Entertainment", color: "#ec4899", icon: "🎬" },
  { name: "Bills", color: "#f59e0b", icon: "💡" },
  { name: "Other", color: "#6b7280", icon: "📁" },
];

export default function AddExpensePage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const defaultsCreated = useRef(false);
  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    categoryId: "",
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setCategoriesLoading(true);
    setError("");

    try {
      const res = await fetch("/api/categories");
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to load categories. Please log in again.");
        return;
      }

      if (data.categories.length === 0 && !defaultsCreated.current) {
        defaultsCreated.current = true;
        const created = await createDefaultCategories();
        if (!created) {
          setError("Could not create default categories. Please try again.");
          return;
        }
        await loadCategories();
        return;
      }

      setCategories(data.categories);
    } catch {
      setError("Failed to load categories.");
    } finally {
      setCategoriesLoading(false);
    }
  };

  const createDefaultCategories = async (): Promise<boolean> => {
    try {
      for (const cat of DEFAULT_CATEGORIES) {
        const res = await fetch("/api/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(cat),
        });

        if (!res.ok) {
          return false;
        }
      }
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          date: new Date(formData.date).toISOString(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        setLoading(false);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Add New Expense</CardTitle>
            <CardDescription>
              Track your spending by adding a new expense
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount ($)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  type="text"
                  placeholder="What did you spend on?"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  value={formData.categoryId}
                  onChange={(e) =>
                    setFormData({ ...formData, categoryId: e.target.value })
                  }
                  required
                  disabled={categoriesLoading || categories.length === 0}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">
                    {categoriesLoading
                      ? "Loading categories..."
                      : categories.length === 0
                        ? "No categories available"
                        : "Select a category"}
                  </option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.icon} {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => router.push("/dashboard")}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={loading || categoriesLoading || categories.length === 0}
                >
                  {loading ? "Adding..." : "Add Expense"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
