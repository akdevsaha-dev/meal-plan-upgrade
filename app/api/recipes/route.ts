import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest, hasProAccess } from "@/lib/auth";
import { withErrorHandler } from "@/lib/apiWrapper";

export const GET = withErrorHandler(async (req: NextRequest) => {
  const session = getUserFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const recipes = await prisma.recipe.findMany({
    where: {
      userId: session.userId,
    },
    include: {
      ingredients: true,
      user: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ recipes });
});

export const POST = withErrorHandler(async (req: NextRequest) => {
  const session = getUserFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const userId = session.userId;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      subscriptionStatus: true,
      currentPeriodEnd: true,
    },
  });

  const isPro = user ? hasProAccess(user) : false;
  const limit = isPro ? 200 : 10;

  const recipeCount = await prisma.recipe.count({
    where: { userId: userId },
  });

  if (recipeCount >= limit) {
    return NextResponse.json(
      { error: `Recipe limit reached. You can only generate or save up to ${limit} recipes on your current plan. Upgrade to Pro for a higher limit.` },
      { status: 403 }
    );
  }

  const body = await req.json();

  const recipe = await prisma.recipe.create({
    data: {
      title: body.title,
      description: body.description,
      imageUrl: body.imageUrl || "/images/recipes/classic-pancakes.jpg",
      prepTime: body.prepTime || 0,
      cookTime: body.cookTime || 0,
      servings: body.servings || 1,
      calories: body.calories,
      cuisine: body.cuisine,
      dietaryTags: body.dietaryTags,
      userId: session.userId,
      ingredients: {
        create: body.ingredients || [],
      },
    },
    include: { ingredients: true },
  });

  return NextResponse.json({ recipe }, { status: 201 });
});
