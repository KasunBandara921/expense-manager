"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { CategoryChartItem, MonthlyChartItem } from "@/types/chart"

type ExpenseChartsProps = {
  categoryData: CategoryChartItem[]
  monthlyData: MonthlyChartItem[]
}

function formatCurrency(value: number) {
  return `$${value.toFixed(2)}`
}

function formatYAxis(value: number) {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1).replace(/\.0$/, "")}M`
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}k`
  }
  return `$${value}`
}

export function ExpenseCharts({ categoryData, monthlyData }: ExpenseChartsProps) {
  const hasCategoryData = categoryData.length > 0
  const hasMonthlyData = monthlyData.some((item) => item.total > 0)

  const router = useRouter()
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null)
  const [newBudget, setNewBudget] = useState<string>("")
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const handleStartEdit = (categoryId: string, currentBudget: number | null) => {
    setEditingCategoryId(categoryId)
    setNewBudget(currentBudget !== null ? currentBudget.toString() : "")
  }

  const handleSaveBudget = async (e: React.FormEvent, categoryId: string) => {
    e.preventDefault()
    setLoadingId(categoryId)
    try {
      const budgetVal = newBudget.trim() === "" ? null : parseFloat(newBudget)
      const res = await fetch(`/api/categories/${categoryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ budget: budgetVal }),
      })

      if (res.ok) {
        setEditingCategoryId(null)
        router.refresh()
      } else {
        alert("Failed to update budget limit.")
      }
    } catch (err) {
      console.error(err)
      alert("Something went wrong while saving budget limit.")
    } finally {
      setLoadingId(null)
    }
  }

  const handleRemoveBudget = async (categoryId: string) => {
    if (!confirm("Are you sure you want to remove the budget limit for this category?")) {
      return
    }
    setLoadingId(categoryId)
    try {
      const res = await fetch(`/api/categories/${categoryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ budget: null }),
      })

      if (res.ok) {
        setEditingCategoryId(null)
        router.refresh()
      } else {
        alert("Failed to remove budget limit.")
      }
    } catch (err) {
      console.error(err)
      alert("Something went wrong while removing budget limit.")
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <Card>
        <CardHeader>
          <CardTitle>Spending by Category</CardTitle>
        </CardHeader>
        <CardContent>
          {hasCategoryData ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                >
                  {categoryData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-16">
              Add expenses to see category breakdown.
            </p>
          )}

          {hasCategoryData && (
            <div className="mt-6 flex flex-col gap-3">
              {categoryData.map((item) => {
                const hasBudget = item.budget !== null
                const pct = hasBudget ? (item.value / (item.budget as number)) : 0
                const isOver = hasBudget && pct >= 1.0
                const isWarning = hasBudget && pct >= 0.7 && pct < 1.0

                return (
                  <div
                    key={item.name}
                    className="flex flex-col gap-2 p-3 rounded-lg border border-gray-100 bg-gray-50/40 hover:bg-gray-50/90 transition-all duration-200"
                  >
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="h-3 w-3 rounded-full shrink-0"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="font-semibold text-gray-800 truncate">{item.name}</span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <div className="flex items-baseline gap-1 text-right">
                          <span className="font-bold text-gray-900">{formatCurrency(item.value)}</span>
                          {hasBudget && (
                            <span className="text-[10px] text-gray-500">
                              / {formatCurrency(item.budget as number)}
                            </span>
                          )}
                        </div>

                        {editingCategoryId !== item.id && (
                          <div className="flex items-center gap-1.5 ml-1">
                            {hasBudget ? (
                              <button
                                onClick={() => handleStartEdit(item.id, item.budget)}
                                disabled={loadingId !== null}
                                className="text-[11px] hover:scale-110 transition-transform cursor-pointer"
                                title="Edit Limit"
                              >
                                ✏️
                              </button>
                            ) : (
                              <button
                                onClick={() => handleStartEdit(item.id, null)}
                                disabled={loadingId !== null}
                                className="text-[10px] font-semibold text-indigo-600 hover:text-indigo-800 hover:underline px-2 py-0.5 rounded bg-indigo-50/50 hover:bg-indigo-50 transition-colors cursor-pointer"
                              >
                                + Limit
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {editingCategoryId === item.id ? (
                      <form
                        onSubmit={(e) => handleSaveBudget(e, item.id)}
                        className="flex items-center gap-2 mt-1 w-full bg-white p-2 rounded border border-gray-200 shadow-sm animate-in fade-in slide-in-from-top-1 duration-150"
                      >
                        <span className="text-xs text-gray-500 font-medium">$</span>
                        <input
                          type="number"
                          placeholder="Limit"
                          value={newBudget}
                          onChange={(e) => setNewBudget(e.target.value)}
                          className="w-24 text-xs p-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-medium"
                          autoFocus
                          required
                          min="1"
                          step="any"
                          disabled={loadingId !== null}
                        />
                        <button
                          type="submit"
                          disabled={loadingId !== null}
                          className="text-[10px] font-bold text-white bg-indigo-600 px-2.5 py-1 rounded hover:bg-indigo-700 transition-colors disabled:opacity-50 cursor-pointer"
                        >
                          {loadingId === item.id ? "Saving..." : "Save"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingCategoryId(null)}
                          disabled={loadingId !== null}
                          className="text-[10px] font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded hover:bg-gray-200 transition-colors disabled:opacity-50 cursor-pointer"
                        >
                          Cancel
                        </button>
                        {hasBudget && (
                          <button
                            type="button"
                            onClick={() => handleRemoveBudget(item.id)}
                            disabled={loadingId !== null}
                            className="text-[10px] font-semibold text-rose-600 ml-auto hover:text-rose-800 transition-colors hover:underline disabled:opacity-50 cursor-pointer"
                          >
                            Remove
                          </button>
                        )}
                      </form>
                    ) : hasBudget ? (
                      <div className="w-full mt-1">
                        <div className="w-full h-2 bg-gray-200/70 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isOver
                                ? 'bg-rose-500 animate-pulse'
                                : isWarning
                                  ? 'bg-amber-500'
                                  : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min(100, pct * 100)}%` }}
                          />
                        </div>
                        <div className="flex justify-between items-center mt-1 text-[10px] font-medium">
                          <span className={isOver ? "text-rose-600" : isWarning ? "text-amber-600" : "text-emerald-600"}>
                            {isOver
                              ? "Over Budget!"
                              : isWarning
                                ? `Warning: ${Math.round(pct * 100)}% spent`
                                : `${Math.round(pct * 100)}% spent`}
                          </span>
                          {isOver && (
                            <span className="text-rose-500 font-bold">
                              +${(item.value - (item.budget as number)).toFixed(2)} over
                            </span>
                          )}
                        </div>
                      </div>
                    ) : null}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Spending (Last 6 Months)</CardTitle>
        </CardHeader>
        <CardContent>
          {hasMonthlyData ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={formatYAxis}
                />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Bar dataKey="total" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-16">
              Add expenses to see your monthly trend.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

