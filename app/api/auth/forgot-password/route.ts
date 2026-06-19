import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withErrorHandler } from "@/lib/apiWrapper";
import { ForgotPasswordSchema } from "@/validation/auth";
import { checkAuthRateLimit } from "@/lib/rate-limit";
import { sendPasswordResetEmail } from "@/lib/email";
import crypto from "crypto";

export const POST = withErrorHandler(async (req: NextRequest) => {
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded
    ? forwarded.split(",")[0].trim()
    : req.headers.get("x-real-ip") || "127.0.0.1";

  const rateLimitResult = await checkAuthRateLimit(ip);
  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      {
        error: "Too many password reset requests. Please try again later.",
        retryAfter: rateLimitResult.retryAfter,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateLimitResult.retryAfter || 60),
        },
      }
    );
  }

  const body = await req.json();
  const parsed = ForgotPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const { email } = parsed.data;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  const successResponse = NextResponse.json({
    message: "If that email address exists, a password reset link has been sent.",
  });

  if (!user) {
    return successResponse;
  }

  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  await prisma.passwordResetToken.deleteMany({
    where: { userId: user.id },
  });

  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt,
    },
  });

  try {
    await sendPasswordResetEmail(user.email, rawToken);
  } catch (err) {
    console.error("Resend delivery failed:", err);
  }

  return successResponse;
});
