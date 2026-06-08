import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
  try {
    console.log("Prisma object:", prisma); // Debug: check if prisma is defined
    console.log("Prisma.user:", prisma?.user); // Debug: check if user model exists
    
    const { email, password, name } = await req.json()

    console.log("Attempting to register:", { email, name }); // Added logging

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      console.log("User already exists"); // Added logging
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    })

    console.log("User created successfully:", user.id); // Added logging

    return NextResponse.json(
      { message: "User created successfully", userId: user.id },
      { status: 201 }
    )
  } catch (error) {
    console.error("Registration error:", error); // Added detailed error logging
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}