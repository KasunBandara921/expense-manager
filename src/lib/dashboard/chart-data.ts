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
]

export function buildCategoryChartData(
  expenses: ExpenseWithCategory[]
): CategoryChartItem[] {
  const totals = new Map<string, { name: string; value: number; color: string }>()

  for (const expense of expenses) {
    const key = expense.category.name
    const existing = totals.get(key)

    if (existing) {
      existing.value += expense.amount
      continue
    }

    totals.set(key, {
      name: expense.category.name,
      value: expense.amount,
      color: expense.category.color ?? FALLBACK_COLORS[totals.size % FALLBACK_COLORS.length],
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
