export type DefaultCategory = {
  name: string
  color: string
  icon: string
}

export const DEFAULT_CATEGORIES: DefaultCategory[] = [
  { name: "Utilities", color: "#f59e0b", icon: "💡" },
  { name: "Food and Dining", color: "#ef4444", icon: "🍽️" },
  { name: "Healthcare", color: "#10b981", icon: "🏥" },
  { name: "Education", color: "#3b82f6", icon: "📚" },
  { name: "Shopping", color: "#8b5cf6", icon: "🛍️" },
  { name: "Entertainment", color: "#ec4899", icon: "🎬" },
  { name: "Travel", color: "#06b6d4", icon: "✈️" },
  { name: "Saving", color: "#22c55e", icon: "🏦" },
  { name: "Personal Care", color: "#f472b6", icon: "💆" },
  { name: "Pets", color: "#a16207", icon: "🐾" },
  { name: "Family Expense", color: "#6366f1", icon: "👨‍👩‍👧" },
]

/** Previous default set — replaced when user has no expenses yet */
export const LEGACY_DEFAULT_CATEGORY_NAMES = [
  "Food",
  "Transport",
  "Shopping",
  "Entertainment",
  "Bills",
  "Other",
]

export const DEFAULT_CATEGORY_NAMES = DEFAULT_CATEGORIES.map((c) => c.name)
