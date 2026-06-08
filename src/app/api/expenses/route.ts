import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { auth } from "@/lib/auth"

export async function POST(req: Request) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { amount, description, date, categoryId } = await req.json()

    // Validate required fields
    if (!amount || !description || !date || !categoryId) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      )
    }

    const expense = await prisma.expense.create({
      data: {
        amount: parseFloat(amount),
        description,
        date: new Date(date),
        categoryId,
        userId: session.user.id as string,
      },
      include: {
        category: true,
      },
    })

    return NextResponse.json({ expense }, { status: 201 })
  } catch (error) {
    console.error("Error creating expense:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}