"use client"

import {
  Line,
  LineChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { DailyChartItem } from "@/types/chart"

type DailyExpensesChartProps = {
  data: DailyChartItem[]
}

function formatCurrency(value: number) {
  return `Rs. ${value.toFixed(2)}`
}

function formatYAxis(value: number) {
  if (value >= 1000000) {
    return `Rs. ${(value / 1000000).toFixed(1).replace(/\.0$/, "")}M`
  }
  if (value >= 1000) {
    return `Rs. ${(value / 1000).toFixed(0)}k`
  }
  return `Rs. ${value}`
}

export function DailyExpensesChart({ data }: DailyExpensesChartProps) {
  const hasData = data.some((item) => item.total > 0)
  const currentMonthName = new Date().toLocaleString("default", { month: "long" })

  return (
    <Card className="mb-8 border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900">
              Daily Spending ({currentMonthName})
            </CardTitle>
            <p className="text-xs text-gray-500 mt-1">
              Track your day-to-day spending pattern for the current month
            </p>
          </div>
          {hasData && (
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                Active Month
              </span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <div className="h-[280px] w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 8, right: 12, left: -4, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis 
                  dataKey="day" 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{ fill: '#6b7280', fontSize: 11 }}
                  dy={10}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={formatYAxis}
                  tick={{ fill: '#6b7280', fontSize: 11 }}
                  dx={-4}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.96)', 
                    border: '1px solid #e5e7eb', 
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    fontSize: '12px'
                  }}
                  labelFormatter={(label) => `${currentMonthName} ${label}`}
                  formatter={(value) => [formatCurrency(Number(value)), "Spending"]} 
                />
                <Line 
                  type="monotone" 
                  dataKey="total" 
                  stroke="#6366f1" 
                  strokeWidth={2.5}
                  dot={{ r: 2, fill: '#6366f1', strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: '#4f46e5', stroke: '#ffffff', strokeWidth: 1.5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500 mb-2 text-lg">
              📅
            </div>
            <p className="text-gray-500 text-sm font-medium">
              No expenses recorded in {currentMonthName} yet.
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              Add expenses dated in this month to populate the timeline.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
