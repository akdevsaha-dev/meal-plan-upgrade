import { prisma } from "./prisma";
import { hasProAccess } from "./auth";

export interface PlanLimits {
  recipesPerDay: number;
  recipesPerMonth: number;
  chatsPerMonth: number;
  plannersPerWeek: number;
}

export const PLAN_LIMITS: Record<"free" | "pro", PlanLimits> = {
  free: {
    recipesPerDay: 5,
    recipesPerMonth: 70,
    chatsPerMonth: 20,
    plannersPerWeek: 3,
  },
  pro: {
    recipesPerDay: 20,
    recipesPerMonth: 500,
    chatsPerMonth: Infinity,
    plannersPerWeek: Infinity,
  },
};

export async function getUserUsage(userId: string) {
  const now = new Date();

  // Start of today (midnight in server/local time)
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Start of this calendar month (1st of the month at 00:00)
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Rolling 7 days for weekly meal planner limit
  const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [recipesToday, recipesMonth, chatsMonth, plannersWeek] = await Promise.all([
    // Daily recipes count
    prisma.recipe.count({
      where: {
        userId,
        createdAt: { gte: startOfDay },
      },
    }),
    // Monthly recipes count
    prisma.recipe.count({
      where: {
        userId,
        createdAt: { gte: startOfMonth },
      },
    }),
    // Monthly Chef Ferraro chats (only count role: "user")
    prisma.chatMessage.count({
      where: {
        userId,
        role: "user",
        createdAt: { gte: startOfMonth },
      },
    }),
    // Weekly meal planners count
    prisma.mealPlan.count({
      where: {
        userId,
        createdAt: { gte: startOfWeek },
      },
    }),
  ]);

  return {
    recipesToday,
    recipesMonth,
    chatsMonth,
    plannersWeek,
  };
}

export async function checkQuota(
  userId: string,
  action: "create_recipe" | "send_chat" | "create_planner"
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      subscriptionStatus: true,
      currentPeriodEnd: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const isPro = hasProAccess(user);
  const planName = isPro ? "pro" : "free";
  const limits = PLAN_LIMITS[planName];
  const usage = await getUserUsage(userId);

  let allowed = true;
  let error: string | undefined;

  const upgradeMessage = " Upgrade to the Pro Plan to unlock higher limits and unlimited features.";

  if (action === "create_recipe") {
    if (usage.recipesToday >= limits.recipesPerDay) {
      allowed = false;
      error = `Daily recipe limit reached (${usage.recipesToday}/${limits.recipesPerDay}).${planName === "free" ? upgradeMessage : ""}`;
    } else if (usage.recipesMonth >= limits.recipesPerMonth) {
      allowed = false;
      error = `Monthly recipe limit reached (${usage.recipesMonth}/${limits.recipesPerMonth}).${planName === "free" ? upgradeMessage : ""}`;
    }
  } else if (action === "send_chat") {
    if (usage.chatsMonth >= limits.chatsPerMonth) {
      allowed = false;
      error = `Monthly Chef Ferraro chat limit reached (${usage.chatsMonth}/${limits.chatsPerMonth}).${planName === "free" ? upgradeMessage : ""}`;
    }
  } else if (action === "create_planner") {
    if (usage.plannersWeek >= limits.plannersPerWeek) {
      allowed = false;
      error = `Weekly meal planner limit reached (${usage.plannersWeek}/${limits.plannersPerWeek}).${planName === "free" ? upgradeMessage : ""}`;
    }
  }

  return {
    allowed,
    error,
    usage,
    limits,
    plan: planName,
  };
}
