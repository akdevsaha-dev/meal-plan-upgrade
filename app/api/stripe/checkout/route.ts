import { NextRequest, NextResponse } from "next/server";
import { resolveProSubscriptionPriceId, stripe } from "@/lib/stripe";
import { getUserFromRequest } from "@/lib/auth";
import { withErrorHandler } from "@/lib/apiWrapper";
import { prisma } from "@/lib/prisma";

function appOrigin(req: NextRequest): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  const host = req.headers.get("host");
  const proto = req.headers.get("x-forwarded-proto") ?? "http";
  if (host) return `${proto}://${host}`;
  return "http://localhost:3000";
}

export const POST = withErrorHandler(async (req: NextRequest) => {
  const session = getUserFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const priceId = await resolveProSubscriptionPriceId();
  if (!priceId) {
    return NextResponse.json(
      { error: "Stripe priceId is not configured" },
      { status: 500 }
    );
  }
  const origin = appOrigin(req);

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { stripeCustomerId: true },
  });

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/checkout/cancel`,
    customer: user?.stripeCustomerId || undefined,
    metadata: {
      userId: session.userId,
    },
    subscription_data: {
      metadata: {
        userId: session.userId,
      },
    },
  },
    { idempotencyKey: `checkout_${session.userId}_${Date.now()}` },
  );
  if (!checkoutSession.url) {
    return NextResponse.json(
      { error: "Failed to create Stripe checkout session" },
      { status: 500 }
    );
  }
  return NextResponse.json({ url: checkoutSession.url });
});
