import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";
import { withErrorHandler } from "@/lib/apiWrapper";
import Stripe from "stripe";

export const runtime = "nodejs";

export const POST = withErrorHandler(async (req: NextRequest) => {
  const session = getUserFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { stripeSubscriptionId: true, plan: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (!user.stripeSubscriptionId) {
    if (user.plan === "pro") {
      const updatedUser = await prisma.user.update({
        where: { id: session.userId },
        data: {
          cancelAtPeriodEnd: true,
        },
      });
      return NextResponse.json({
        success: true,
        message: "Mock subscription set to cancel (mock mode)",
        user: updatedUser,
      });
    }

    return NextResponse.json(
      { error: "No active subscription found for this user" },
      { status: 400 }
    );
  }

  const subscription = await stripe.subscriptions.update(user.stripeSubscriptionId, {
    cancel_at_period_end: true,
  }) as Stripe.Subscription;

  const firstItem = subscription.items.data[0];
  const currentPeriodEnd = firstItem
    ? new Date(firstItem.current_period_end * 1000)
    : new Date();

  await prisma.user.update({
    where: { id: session.userId },
    data: {
      subscriptionStatus: subscription.status,
      currentPeriodEnd,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
  });

  return NextResponse.json({
    success: true,
    message: "Subscription set to cancel at period end",
    subscription,
  });
});
