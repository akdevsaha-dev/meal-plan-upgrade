import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest, hasProAccess } from "@/lib/auth";
import { withErrorHandler } from "@/lib/apiWrapper";
import { getUserUsage, PLAN_LIMITS } from "@/lib/quota";

export const GET = withErrorHandler(async (req: NextRequest) => {
  const session = getUserFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      subscriptionStatus: true,
      currentPeriodEnd: true,
      cancelAtPeriodEnd: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const isPro = hasProAccess(user);
  const planName = isPro ? "pro" : "free";
  const limits = PLAN_LIMITS[planName];
  const usage = await getUserUsage(session.userId);

  return NextResponse.json({
    plan: planName,
    subscriptionStatus: user.subscriptionStatus,
    currentPeriodEnd: user.currentPeriodEnd,
    cancelAtPeriodEnd: user.cancelAtPeriodEnd,
    usage,
    limits,
  });
});
