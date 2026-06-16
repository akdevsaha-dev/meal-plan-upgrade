import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/auth";
import bcrypt from "bcryptjs";
export async function POST(req: NextRequest) {
  const body = await req.json();

  const { email, password, name } = body;

  const trimmedEmail = email.toLowerCase().trim();

  const existingUser = await prisma.user.findUnique({
    where: { email: trimmedEmail },
  });

  if (existingUser) {
    return NextResponse.json(
      { error: "User with this email already exists" },
      { status: 409 }
    );
  }
  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email: trimmedEmail,
      password: hashedPassword,
      name: name.trim(),
    },
    select: {
      id: true,
      email: true,
      name: true,
      plan: true,
    },
  });

  const token = signToken({ userId: user.id, email: user.email });

  return NextResponse.json({ user: { id: user.id, email: user.email, name: user.name }, token });
}
