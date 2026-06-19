import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withErrorHandler } from "@/lib/apiWrapper";
import { ResetPasswordSchema } from "@/validation/auth";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export const POST = withErrorHandler(async (req: NextRequest) => {
  const body = await req.json();
  const { token, password, confirmPassword } = body;

  if (!token || typeof token !== "string") {
    return NextResponse.json({ error: "Reset token is required" }, { status: 400 });
  }

  const parsed = ResetPasswordSchema.safeParse({ password, confirmPassword });
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  const tokenRecord = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
  });

  if (!tokenRecord) {
    return NextResponse.json({ error: "Invalid or expired reset token" }, { status: 400 });
  }

  if (tokenRecord.expiresAt < new Date()) {
    await prisma.passwordResetToken.delete({
      where: { id: tokenRecord.id },
    });
    return NextResponse.json({ error: "Reset token has expired" }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: tokenRecord.userId },
      data: { password: hashedPassword },
    }),
    prisma.passwordResetToken.deleteMany({
      where: { userId: tokenRecord.userId },
    }),
  ]);

  return NextResponse.json({
    success: true,
    message: "Your password has been reset successfully.",
  });
});
