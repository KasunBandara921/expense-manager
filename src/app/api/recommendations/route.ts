import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db/prisma"
import { buildExpenseSummary } from "@/lib/ai/expense-summary"
import { generateLocalRecommendations } from "@/lib/ai/local-recommendations"
import {
  generateRecommendations,
  isGeminiParseError,
  isGeminiQuotaError,
} from "@/lib/ai/recommendations"

function localFallback(
  expenses: Parameters<typeof generateLocalRecommendations>[0],
  notice: string
) {
  const local = generateLocalRecommendations(expenses)
  return NextResponse.json({
    ...local,
    source: "local" as const,
    notice,
  })
}

export async function POST() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const expenses = await prisma.expense.findMany({
      where: { userId: session.user.id },
      include: { category: true },
      orderBy: { date: "desc" },
    })

    if (expenses.length === 0) {
      return NextResponse.json(
        { error: "Add at least one expense to get recommendations" },
        { status: 400 }
      )
    }

    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey) {
      return localFallback(
        expenses,
        "Add a free GEMINI_API_KEY from https://aistudio.google.com/apikey for AI-powered tips. Showing smart tips based on your data for now."
      )
    }

    try {
      const summary = buildExpenseSummary(expenses)
      const recommendations = await generateRecommendations(summary)
      return NextResponse.json(recommendations)
    } catch (error) {
      if (isGeminiQuotaError(error)) {
        return localFallback(
          expenses,
          "Gemini free quota is not available for this API key. Showing rule-based tips from your spending data. Create a new key at https://aistudio.google.com/apikey if you want AI tips."
        )
      }

      if (isGeminiParseError(error)) {
        return localFallback(
          expenses,
          "Gemini returned an invalid response. Showing rule-based tips from your spending data instead."
        )
      }

      throw error
    }
  } catch (error) {
    console.error("AI recommendations error:", error)

    const message =
      error instanceof Error ? error.message : "Failed to generate recommendations"

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
