"use server"

import { prisma } from "@/lib/db/prisma"
import { DEFAULT_CATEGORIES } from "@/lib/categories/defaults"

export async function updateCategoryColors() {
  try {
    const colorMap = new Map(DEFAULT_CATEGORIES.map((c) => [c.name, c.color]))

    for (const [name, color] of colorMap) {
      await prisma.category.updateMany({
        where: { name },
        data: { color },
      })
    }

    return { success: true, message: "All category colors have been updated" }
  } catch (error) {
    console.error("Error updating category colors:", error)
    return { success: false, error: "Failed to update category colors" }
  }
}
