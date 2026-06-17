import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/auth";
import { withErrorHandler } from "@/lib/apiWrapper";
import { LoginSchema } from "@/validation/auth";

export const POST = withErrorHandler(async (req: NextRequest) => {
  const body = await req.json();

  const parsed = LoginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  // const isValidPassword = await bcrypt.compare(password, user.password);
  // if (!isValidPassword) {
  //   return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  // }

  const token = signToken({ userId: user.id, email: user.email });

  return NextResponse.json({
    user: { id: user.id, email: user.email, name: user.name, plan: user.plan },
    token,
  });
});
