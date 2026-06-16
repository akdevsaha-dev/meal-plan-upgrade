import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";
import { withErrorHandler } from "@/lib/apiWrapper";

export const POST = withErrorHandler(async (req: NextRequest) => {
  const session = getUserFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const userId = session.userId;

  await prisma.$transaction(async (tx) => {
    const recipes = await tx.recipe.findMany({
      where: { userId },
      select: { id: true },
    });
    const recipeIds = recipes.map((r) => r.id);

    const mealPlans = await tx.mealPlan.findMany({
      where: { userId },
      select: { id: true },
    });
    const mealPlanIds = mealPlans.map((m) => m.id);

    if (recipeIds.length > 0) {
      await tx.ingredient.deleteMany({
        where: { recipeId: { in: recipeIds } },
      });
    }

    await tx.mealPlanRecipe.deleteMany({
      where: {
        OR: [
          { recipeId: { in: recipeIds } },
          { mealPlanId: { in: mealPlanIds } },
        ],
      },
    });

    await tx.mealPlan.deleteMany({
      where: { userId },
    });

    await tx.recipe.deleteMany({
      where: { userId },
    });

    await tx.chatMessage.deleteMany({
      where: { userId },
    });

    await tx.user.delete({
      where: { id: userId },
    });
  });

  return NextResponse.json({ success: true });
});
