import { GoogleGenAI, Type } from "@google/genai"
import { z } from "zod"

const recommendationsSchema = z.object({
  summary: z.string(),
  tips: z.array(z.string()).min(1).max(5),
})

export type AiRecommendations = z.infer<typeof recommendationsSchema>

export type AiRecommendationsResult = AiRecommendations & {
  source: "gemini" | "local"
  model?: string
  notice?: string
}

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    summary: {
      type: Type.STRING,
      description: "One short paragraph about spending habits",
    },
    tips: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "3 to 4 short actionable money-saving tips",
    },
  },
  required: ["summary", "tips"],
  propertyOrdering: ["summary", "tips"],
}

// Try models most likely to work on free-tier keys (override with GEMINI_MODEL in .env)
const MODEL_CANDIDATES = [
  process.env.GEMINI_MODEL,
  "gemini-2.5-flash",
  "gemini-2.0-flash-lite",
  "gemini-2.5-flash-lite",
  "gemini-2.0-flash",
].filter((model): model is string => Boolean(model))

function extractJsonObject(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i)
  if (fenced?.[1]) {
    return fenced[1].trim()
  }

  const start = text.indexOf("{")
  const end = text.lastIndexOf("}")
  if (start !== -1 && end > start) {
    return text.slice(start, end + 1)
  }

  return text.trim()
}

function parseRecommendations(text: string): AiRecommendations {
  const jsonText = extractJsonObject(text)
  const parsed = JSON.parse(jsonText)
  return recommendationsSchema.parse(parsed)
}

export function isGeminiQuotaError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error)
  return (
    message.includes("429") ||
    message.includes("RESOURCE_EXHAUSTED") ||
    message.includes("limit: 0") ||
    message.includes("quota")
  )
}

export function isGeminiParseError(error: unknown): boolean {
  if (error instanceof SyntaxError) return true
  const message = error instanceof Error ? error.message : String(error)
  return (
    message.includes("JSON") ||
    message.includes("parse") ||
    message.includes("ZodError")
  )
}

async function tryGenerateWithModel(
  ai: GoogleGenAI,
  model: string,
  prompt: string
): Promise<AiRecommendations> {
  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      temperature: 0.3,
      maxOutputTokens: 1024,
      responseMimeType: "application/json",
      responseJsonSchema: RESPONSE_SCHEMA,
    },
  })

  const text = response.text?.trim()
  if (!text) {
    throw new Error("Empty response from Gemini")
  }

  return parseRecommendations(text)
}

export async function generateRecommendations(
  expenseSummary: string
): Promise<AiRecommendationsResult> {
  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured")
  }

  const ai = new GoogleGenAI({ apiKey })

  const prompt = `You are a personal finance assistant. Analyze this spending data and give practical saving advice. Use only facts from the data. Keep tips short (one sentence each).

${expenseSummary}`

  const errors: string[] = []

  for (const model of MODEL_CANDIDATES) {
    try {
      const result = await tryGenerateWithModel(ai, model, prompt)
      return { ...result, source: "gemini", model }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error)
      errors.push(`${model}: ${msg.slice(0, 120)}`)

      const retryable = isGeminiQuotaError(error) || isGeminiParseError(error)
      if (!retryable) {
        throw error
      }
    }
  }

  throw new Error(`Gemini failed for all models. ${errors.join(" | ")}`)
}
