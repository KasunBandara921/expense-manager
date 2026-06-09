import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { auth } from "@/lib/auth"
import { ensureDefaultCategories } from "@/lib/categories/seed-defaults"

export const revalidate = 0

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const categories = await ensureDefaultCategories(session.user.id)

    return NextResponse.json({ categories }, { status: 200 })
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, color, icon } = await req.json()

    const category = await prisma.category.create({
      data: {
        name,
        color: color || "#3b82f6",
        icon: icon || "📁",
        userId: session.user.id,
      },
    })

    return NextResponse.json({ category }, { status: 201 })
  } catch (error) {
    console.error("Error creating category:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}
