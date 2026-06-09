import { prisma } from "@/lib/db/prisma"
import {
  DEFAULT_CATEGORIES,
  LEGACY_DEFAULT_CATEGORY_NAMES,
} from "@/lib/categories/defaults"

function isLegacyOnlyCategorySet(categoryNames: string[]): boolean {
  if (categoryNames.length === 0) return false
  const legacySet = new Set(LEGACY_DEFAULT_CATEGORY_NAMES)
  return categoryNames.every((name) => legacySet.has(name))
}

export async function ensureDefaultCategories(userId: string) {
  const categories = await prisma.category.findMany({
    where: { userId },
    orderBy: { name: "asc" },
  })

  const categoryNames = categories.map((c) => c.name)
  const isLegacy = isLegacyOnlyCategorySet(categoryNames)

  // If user has no categories or only legacy categories, seed with new defaults
  if (categories.length === 0 || isLegacy) {
    if (categories.length > 0) {
      // Delete expenses that reference these categories first
      await prisma.expense.deleteMany({
        where: { userId },
      })
      // Then delete the old categories
      await prisma.category.deleteMany({ where: { userId } })
    }

    await prisma.category.createMany({
      data: DEFAULT_CATEGORIES.map((category) => ({
        name: category.name,
        color: category.color,
        icon: category.icon,
        userId,
      })),
    })

    return prisma.category.findMany({
      where: { userId },
      orderBy: { name: "asc" },
    })
  }

  return categories
}
