import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { withErrorHandler } from "@/lib/apiWrapper";

export const POST = withErrorHandler(async (req: NextRequest) => {
  const { email, password } = await req.json();

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = signToken({ userId: user.id, email: user.email });

  return NextResponse.json({
    user: { id: user.id, email: user.email, name: user.name, plan: user.plan },
    token,
  });
});
