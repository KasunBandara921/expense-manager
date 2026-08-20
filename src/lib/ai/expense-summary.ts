import { format } from "date-fns"
import { buildCategoryChartData, buildMonthlyChartData } from "@/lib/dashboard/chart-data"

type ExpenseWithCategory = {
  amount: number
  description: string
  date: Date
  category: {
    id: string
    name: string
    color: string | null
    budget: number | null
  }
}

export function buildExpenseSummary(expenses: ExpenseWithCategory[]): string {
  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const count = expenses.length
  const average = count > 0 ? total / count : 0

  const categoryData = buildCategoryChartData(expenses)
  const monthlyData = buildMonthlyChartData(expenses)

  const topCategories = categoryData
    .slice(0, 5)
    .map((item) => `- ${item.name}: Rs. ${item.value.toFixed(2)}`)
    .join("\n")

  const monthlyTrend = monthlyData
    .map((item) => `- ${item.month}: Rs. ${item.total.toFixed(2)}`)
    .join("\n")

  const recent = expenses
    .slice(0, 8)
    .map(
      (expense) =>
        `- ${format(expense.date, "yyyy-MM-dd")}: Rs. ${expense.amount.toFixed(2)} (${expense.category.name}) — ${expense.description}`
    )
    .join("\n")

  return [
    `Total spent: Rs. ${total.toFixed(2)}`,
    `Number of expenses: ${count}`,
    `Average expense: Rs. ${average.toFixed(2)}`,
    "",
    "Spending by category:",
    topCategories || "- No category data",
    "",
    "Monthly trend (last 6 months):",
    monthlyTrend,
    "",
    "Recent expenses:",
    recent || "- No recent expenses",
  ].join("\n")
}
