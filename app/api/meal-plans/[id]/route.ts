import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";
import { withErrorHandler } from "@/lib/apiWrapper";

export const GET = withErrorHandler(async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const session = getUserFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const mealPlan = await prisma.mealPlan.findUnique({
    where: { id },
    include: {
      recipes: {
        include: { recipe: { include: { ingredients: true } } },
      },
    },
  });

  if (!mealPlan) {
    return NextResponse.json({ error: "Meal plan not found" }, { status: 404 });
  }

  if (mealPlan.userId !== session.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({ mealPlan });
});

export const POST = withErrorHandler(async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const session = getUserFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const mealPlan = await prisma.mealPlan.findUnique({
    where: { id },
  });

  if (!mealPlan) {
    return NextResponse.json({ error: "Meal plan not found" }, { status: 404 });
  }

  if (mealPlan.userId !== session.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  let recipeId = body.recipeId;

  if (!recipeId) {
    const firstRecipe = await prisma.recipe.findFirst({ orderBy: { createdAt: "asc" } });
    if (!firstRecipe) {
      return NextResponse.json({ error: "No recipes found in system" }, { status: 400 });
    }
    recipeId = firstRecipe.id;
  }

  const mealPlanRecipe = await prisma.mealPlanRecipe.create({
    data: {
      day: body.day,
      mealType: body.mealType,
      recipeId: recipeId,
      mealPlanId: id,
    },
    include: { recipe: true },
  });

  return NextResponse.json({ mealPlanRecipe }, { status: 201 });
});

export const DELETE = withErrorHandler(async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const session = getUserFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const mealPlan = await prisma.mealPlan.findUnique({
    where: { id },
  });

  if (!mealPlan) {
    return NextResponse.json({ error: "Meal plan not found" }, { status: 404 });
  }

  if (mealPlan.userId !== session.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const mealPlanRecipeId = searchParams.get("mealPlanRecipeId");

  if (!mealPlanRecipeId) {
    return NextResponse.json({ error: "mealPlanRecipeId is required" }, { status: 400 });
  }

  const record = await prisma.mealPlanRecipe.findFirst({
    where: { id: mealPlanRecipeId, mealPlanId: id },
  });

  if (!record) {
    return NextResponse.json({ error: "Meal record not found in plan" }, { status: 404 });
  }

  await prisma.mealPlanRecipe.delete({
    where: { id: mealPlanRecipeId },
  });

  return NextResponse.json({ success: true });
});
