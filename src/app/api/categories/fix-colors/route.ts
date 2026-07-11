import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { DEFAULT_CATEGORIES } from "@/lib/categories/defaults"

export async function POST() {
  try {
    // Build color map from default categories
    const colorMap = new Map(DEFAULT_CATEGORIES.map((c) => [c.name, c.color]))

    // Get all categories across all users
    const allCategories = await prisma.category.findMany()

    // Update each category with its proper color
    let updated = 0
    for (const category of allCategories) {
      const defaultColor = colorMap.get(category.name)
      if (defaultColor && (!category.color || category.color.trim() === "")) {
        await prisma.category.update({
          where: { id: category.id },
          data: { color: defaultColor },
        })
        updated++
      }
    }

    return NextResponse.json({
      message: "Category colors updated successfully",
      updated,
    })
  } catch (error) {
    console.error("Error updating category colors:", error)
    return NextResponse.json(
      { error: "Failed to update category colors" },
      { status: 500 }
    )
  }
}
