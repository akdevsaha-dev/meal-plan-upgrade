import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";
import { withErrorHandler } from "@/lib/apiWrapper";
import { checkQuota } from "@/lib/quota";

export const GET = withErrorHandler(async (req: NextRequest) => {
  const session = getUserFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const mealPlans = await prisma.mealPlan.findMany({
    where: { userId: session.userId },
    include: {
      recipes: {
        include: { recipe: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ mealPlans });
});

export const POST = withErrorHandler(async (req: NextRequest) => {
  const session = getUserFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const quota = await checkQuota(session.userId, "create_planner");
  if (!quota.allowed) {
    return NextResponse.json(
      { error: quota.error },
      { status: 403 }
    );
  }

  const body = await req.json();

  const mealPlan = await prisma.mealPlan.create({
    data: {
      name: body.name,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
      userId: session.userId,
    },
  });

  return NextResponse.json({ mealPlan }, { status: 201 });
});
