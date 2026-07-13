import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { auth } from "@/lib/auth"

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { budget } = await req.json()
    const { id } = await params

    // Verify category belongs to user
    const category = await prisma.category.findUnique({
      where: { id },
    })

    if (!category || category.userId !== session.user.id) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: {
        budget: budget === null || budget === "" ? null : parseFloat(budget),
      },
    })

    return NextResponse.json({ category: updatedCategory })
  } catch (error) {
    console.error("Error updating category budget:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}
