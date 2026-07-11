export type CategoryChartItem = {
  id: string
  name: string
  value: number
  color: string
  budget: number | null
}


export type MonthlyChartItem = {
  month: string
  total: number
}

export type DailyChartItem = {
  day: string
  total: number
}

