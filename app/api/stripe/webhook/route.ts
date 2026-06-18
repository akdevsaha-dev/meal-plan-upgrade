import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { withErrorHandler } from "@/lib/apiWrapper";
import Stripe from "stripe";

export const runtime = "nodejs";

async function syncSubscription(
  subscriptionId: string,
  status: string,
  customerId: string | null,
  userIdFromMetadata: string | null | undefined,
  currentPeriodEnd: Date,
  cancelAtPeriodEnd: boolean
) {
  let user = null;

  if (customerId) {
    user = await prisma.user.findFirst({ where: { stripeCustomerId: customerId } });
  }
  if (!user && subscriptionId) {
    user = await prisma.user.findUnique({ where: { stripeSubscriptionId: subscriptionId } });
  }
  if (!user && userIdFromMetadata) {
    user = await prisma.user.findUnique({ where: { id: userIdFromMetadata } });
  }

  if (!user) {
    console.error(
      `[Webhook Sync] User not found for subscription ${subscriptionId} (customer: ${customerId}, metadata userId: ${userIdFromMetadata})`
    );
    return false;
  }

  const isPro = ["active", "trialing"].includes(status) && currentPeriodEnd.getTime() > Date.now();

  await prisma.user.update({
    where: { id: user.id },
    data: {
      stripeSubscriptionId: subscriptionId,
      stripeCustomerId: customerId || user.stripeCustomerId,
      subscriptionStatus: status,
      currentPeriodEnd,
      cancelAtPeriodEnd,
      plan: isPro ? "pro" : "free",
    },
  });

  console.log(`[Webhook Sync] Updated user ${user.id} subscriptionStatus to ${status} (plan: ${isPro ? "pro" : "free"})`);
  return true;
}

export const POST = withErrorHandler(async (req: NextRequest) => {
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing Stripe signature" },
      { status: 400 }
    );
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }
  const body = await req.text();
  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    return NextResponse.json(
      { error: "Invalid webhook signature" },
      { status: 400 }
    );
  }

  console.log(`[Webhook] Received Stripe event type: ${event.type}`);

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const userId = session.metadata?.userId;
    const subscriptionId = session.subscription ? String(session.subscription) : null;
    const customerId = session.customer ? String(session.customer) : null;

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId in metadata" },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscriptionId,
      },
    });

    if (subscriptionId) {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId) as Stripe.Subscription;
      const subAny = subscription as any;
      const firstItem = subscription.items?.data?.[0];
      const periodEndSecs = subAny.current_period_end ?? (firstItem ? (firstItem as any).current_period_end : undefined);
      const currentPeriodEnd = periodEndSecs ? new Date(periodEndSecs * 1000) : new Date();
      await syncSubscription(
        subscription.id,
        subscription.status,
        customerId,
        userId,
        currentPeriodEnd,
        subscription.cancel_at_period_end
      );
    }
  } else if (
    event.type === "customer.subscription.created" ||
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.deleted"
  ) {
    const subscription = event.data.object as Stripe.Subscription;
    const subscriptionId = subscription.id;
    const customerId = subscription.customer ? String(subscription.customer) : null;
    const status = subscription.status;
    const userId = subscription.metadata?.userId;
    const subAny = subscription as any;
    const firstItem = subscription.items?.data?.[0];
    const periodEndSecs = subAny.current_period_end ?? (firstItem ? (firstItem as any).current_period_end : undefined);
    const currentPeriodEnd = periodEndSecs ? new Date(periodEndSecs * 1000) : new Date();
    const cancelAtPeriodEnd = subscription.cancel_at_period_end;

    await syncSubscription(
      subscriptionId,
      status,
      customerId,
      userId,
      currentPeriodEnd,
      cancelAtPeriodEnd
    );
  }

  return NextResponse.json({ received: true });
});
