"use client"

import { useState } from "react"
import { Sparkles, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
type RecommendationsResponse = {
  summary: string
  tips: string[]
  source?: "gemini" | "local"
  model?: string
  notice?: string
}

type AiRecommendationsProps = {
  hasExpenses: boolean
}

export function AiRecommendations({ hasExpenses }: AiRecommendationsProps) {
  const [data, setData] = useState<RecommendationsResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const generate = async () => {
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/recommendations", { method: "POST" })
      const body = await res.json()

      if (!res.ok) {
        setError(body.error || "Could not generate recommendations")
        return
      }

      setData(body)
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="mb-8 border-violet-200 bg-gradient-to-br from-violet-50/70 to-white/80 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-violet-600" />
              AI Spending Insights
            </CardTitle>
            <CardDescription className="mt-1">
              Free personalized tips powered by Google Gemini based on your expenses
            </CardDescription>
          </div>
          <Button
            onClick={generate}
            disabled={loading || !hasExpenses}
            variant="outline"
            className="shrink-0 border-violet-200 hover:bg-violet-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              "Get recommendations"
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!hasExpenses && (
          <p className="text-gray-500 text-sm">
            Add some expenses first, then come back for AI-powered saving tips.
          </p>
        )}

        {hasExpenses && !data && !error && !loading && (
          <p className="text-gray-600 text-sm">
            Click the button above to analyze your spending and get simple saving
            recommendations. Uses Gemini&apos;s free API tier.
          </p>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}

        {data && (
          <div className="space-y-4">
            {data.notice && (
              <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3">
                {data.notice}
              </p>
            )}
            {data.source === "gemini" && data.model && (
              <p className="text-xs text-gray-500">Powered by {data.model}</p>
            )}
            <p className="text-gray-700 leading-relaxed">{data.summary}</p>
            <div>
              <p className="text-sm font-medium text-gray-900 mb-2">Recommendations</p>
              <ul className="space-y-2">
                {data.tips.map((tip) => (
                  <li
                    key={tip}
                    className="flex gap-2 text-sm text-gray-700 bg-white/80 rounded-lg p-3 border border-violet-100"
                  >
                    <span className="text-violet-600 shrink-0">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
