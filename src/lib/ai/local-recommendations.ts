import { buildCategoryChartData, buildMonthlyChartData } from "@/lib/dashboard/chart-data"
import type { AiRecommendations } from "@/lib/ai/recommendations"

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

export function generateLocalRecommendations(
  expenses: ExpenseWithCategory[]
): AiRecommendations {
  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const count = expenses.length
  const average = count > 0 ? total / count : 0
  const categories = buildCategoryChartData(expenses)
  const monthly = buildMonthlyChartData(expenses)
  const tips: string[] = []

  const top = categories[0]
  if (top && total > 0) {
    const share = (top.value / total) * 100
    if (share >= 35) {
      tips.push(
        `${top.name} is your biggest category at Rs. ${top.value.toFixed(2)} (${share.toFixed(0)}% of spending). Set a monthly cap for this category to control costs.`
      )
    }
  }

  const monthsWithSpending = monthly.filter((item) => item.total > 0)
  if (monthsWithSpending.length >= 2) {
    const current = monthsWithSpending[monthsWithSpending.length - 1]
    const previous = monthsWithSpending[monthsWithSpending.length - 2]
    if (current.total > previous.total * 1.15) {
      tips.push(
        `Spending increased from Rs. ${previous.total.toFixed(2)} in ${previous.month} to Rs. ${current.total.toFixed(2)} in ${current.month}. Review recent purchases to separate needs from wants.`
      )
    } else if (current.total < previous.total * 0.85) {
      tips.push(
        `Nice progress — spending dropped from Rs. ${previous.total.toFixed(2)} to Rs. ${current.total.toFixed(2)}. Keep tracking to maintain this habit.`
      )
    }
  }

  if (average > 50) {
    tips.push(
      `Your average expense is Rs. ${average.toFixed(2)}. Try waiting 24 hours before purchases above that amount to reduce impulse spending.`
    )
  }

  const largeExpenses = expenses.filter((expense) => expense.amount > average * 2)
  if (largeExpenses.length > 0 && average > 0) {
    tips.push(
      `You have ${largeExpenses.length} expense(s) well above your average. Plan for large purchases in advance instead of adding them unexpectedly.`
    )
  }

  if (tips.length < 3) {
    tips.push(
      "Log expenses daily so you always know where your money goes — small purchases add up quickly."
    )
  }
  if (tips.length < 3) {
    tips.push(
      "Pick one category to cut by 10% next month and move that amount into savings."
    )
  }

  const topLabel = top ? top.name : "several categories"

  return {
    summary: `You've tracked Rs. ${total.toFixed(2)} across ${count} expenses, averaging Rs. ${average.toFixed(2)} each. Most spending is in ${topLabel}.`,
    tips: tips.slice(0, 4),
  }
}
