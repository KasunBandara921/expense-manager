import { format, startOfMonth, subMonths } from "date-fns"
import type { CategoryChartItem, MonthlyChartItem } from "@/types/chart"

type ExpenseWithCategory = {
  amount: number
  date: Date
  category: {
    name: string
    color: string | null
  }
}

const FALLBACK_COLORS = [
  "#3b82f6",
  "#ef4444",
  "#8b5cf6",
  "#f59e0b",
  "#10b981",
  "#ec4899",
  "#06b6d4",
  "#22c55e",
  "#f472b6",
  "#a16207",
  "#6366f1",
]

export function buildCategoryChartData(
  expenses: ExpenseWithCategory[]
): CategoryChartItem[] {
  const totals = new Map<string, { name: string; value: number; color: string }>()
  const categoryOrder: string[] = [] // Track insertion order

  for (const expense of expenses) {
    const key = expense.category.name
    const existing = totals.get(key)

    if (existing) {
      existing.value += expense.amount
      continue
    }

    // Track this category in insertion order
    categoryOrder.push(key)
    
    // Use category color if available, otherwise assign from fallback colors based on order
    const color = expense.category.color && expense.category.color.trim() 
      ? expense.category.color 
      : FALLBACK_COLORS[(categoryOrder.length - 1) % FALLBACK_COLORS.length]
    
    totals.set(key, {
      name: expense.category.name,
      value: expense.amount,
      color,
    })
  }

  return Array.from(totals.values()).sort((a, b) => b.value - a.value)
}

export function buildMonthlyChartData(
  expenses: Pick<ExpenseWithCategory, "amount" | "date">[]
): MonthlyChartItem[] {
  const now = new Date()
  const months = Array.from({ length: 6 }, (_, index) => {
    const date = startOfMonth(subMonths(now, 5 - index))
    return {
      key: format(date, "yyyy-MM"),
      label: format(date, "MMM"),
    }
  })

  const totals = new Map(months.map((month) => [month.key, 0]))

  for (const expense of expenses) {
    const key = format(expense.date, "yyyy-MM")
    if (totals.has(key)) {
      totals.set(key, (totals.get(key) ?? 0) + expense.amount)
    }
  }

  return months.map((month) => ({
    month: month.label,
    total: Number((totals.get(month.key) ?? 0).toFixed(2)),
  }))
}
