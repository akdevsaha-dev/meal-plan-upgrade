import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest, hasProAccess } from "@/lib/auth";
import { openaiClient, DEFAULT_MODEL } from "@/lib/ai";
import { generateRecipeImage } from "@/lib/nanoBanana";
import { withErrorHandler } from "@/lib/apiWrapper";
import { SYSTEM_PROMPT } from "@/lib/chefPrompt";
import { RecipeSchema } from "@/validation/recipeSchema";
import { sanitizeRecipe } from "@/lib/sanitizeRecipe";
import { streamText, generateText, Output } from "ai";
import { checkChatRateLimit } from "@/lib/rate-limit";

const MAX_HISTORY = 20;
const MAX_MESSAGE_LENGTH = 2000;

export const GET = withErrorHandler(async (req: NextRequest) => {
  const session = getUserFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const history = await prisma.chatMessage.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "asc" },
  });

  const recipeIds = history
    .map((m) => {
      const match = m.content.match(/<!-- recipeId:(.*?) -->/);
      return match ? match[1] : null;
    })
    .filter(Boolean) as string[];

  const recipes = await prisma.recipe.findMany({
    where: { id: { in: recipeIds } },
    include: { ingredients: true },
  });

  return NextResponse.json({
    model: DEFAULT_MODEL,
    messages: history,
    recipes,
  });
});

export const POST = withErrorHandler(async (req: NextRequest) => {
  const session = getUserFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const userId = session.userId;
  const rateLimitResult = await checkChatRateLimit(userId);

  if (!rateLimitResult.allowed) {
    const errorMsg = rateLimitResult.limit === 10 ? "Daily limit reached" : "Hourly limit reached";
    return NextResponse.json(
      {
        error: errorMsg,
        limit: rateLimitResult.limit,
        remaining: rateLimitResult.remaining,
        resetAt: rateLimitResult.resetAt,
        upgradeAvailable: rateLimitResult.upgradeAvailable,
      },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": String(rateLimitResult.limit),
          "X-RateLimit-Remaining": String(rateLimitResult.remaining),
          "X-RateLimit-Reset": String(rateLimitResult.resetAt),
        },
      }
    );
  }

  const rateLimitHeaders = {
    "X-RateLimit-Limit": String(rateLimitResult.limit),
    "X-RateLimit-Remaining": String(rateLimitResult.remaining),
    "X-RateLimit-Reset": String(rateLimitResult.resetAt),
  };

  const isPro = user ? hasProAccess(user) : false;
  const limit = isPro ? 200 : 10;

  const recipeCount = await prisma.recipe.count({
    where: { userId: userId },
  });

  if (recipeCount >= limit) {
    return NextResponse.json(
      {
        error: `Recipe limit reached. You can only generate up to ${limit} recipes on your current plan. Upgrade to Pro for a higher limit.`,
        limit,
        remaining: 0,
      },
      {
        status: 403,
        headers: rateLimitHeaders,
      }
    );
  }
  const { messages } = await req.json();
  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "Invalid messages payload" }, { status: 400 });
  }

  const lastUserMessage = messages[messages.length - 1];
  if (
    !lastUserMessage ||
    lastUserMessage.role !== "user" ||
    typeof lastUserMessage.content !== "string"
  ) {
    return NextResponse.json({ error: "Last message must be a user message" }, { status: 400 });
  }

  const messageText = lastUserMessage.content;
  if (messageText.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json({ error: "Message too large" }, { status: 400 });
  }

  if (!process.env.AI_GATEWAY_API_KEY || process.env.AI_GATEWAY_API_KEY.trim() === "") {
    throw new Error("AI_GATEWAY_API_KEY is missing or empty");
  }

  await prisma.chatMessage.create({
    data: {
      role: "user",
      content: messageText,
      userId: userId,
    },
  });

  const history = await prisma.chatMessage.findMany({
    where: { userId: userId },
    orderBy: { createdAt: "desc" },
    take: MAX_HISTORY,
  });
  history.reverse();

  const formattedMessages: Array<{ role: "user" | "assistant"; content: string }> = history.map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));

  const contextForClassification = formattedMessages.slice(-5).map(m => `${m.role}: ${m.content}`).join("\n");

  const classification = await generateText({
    model: openaiClient(DEFAULT_MODEL),
    system: "You are an intent classifier. Your task is to output 'true' if the user is asking to create, generate, discover, adapt, modify, suggest, or write a recipe based on their latest message or the conversational context. Otherwise, output 'false'. Respond with ONLY 'true' or 'false' (no explanation, no punctuation, lowercase).",
    prompt: `Conversation Context:\n${contextForClassification}\n\nLast Message:\n${messageText}`,
  });

  const isRecipeRequest = classification.text.toLowerCase().includes("true");

  if (isRecipeRequest) {
    console.log(`[Recipe Intent Detected] Generating structured recipe for user ${userId}`);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        subscriptionStatus: true,
        currentPeriodEnd: true,
      },
    });

    try {
      const { output: recipe } = await generateText({
        model: openaiClient(DEFAULT_MODEL),
        output: Output.object({
          schema: RecipeSchema,
        }),
        system: "You are a professional chef. Generate a realistic and delicious recipe based on the user's request. Fill in all fields appropriately.",
        messages: formattedMessages,
      });

      const sanitized = sanitizeRecipe(recipe);

      let createdRecipe = await prisma.recipe.create({
        data: {
          title: sanitized.title,
          description: sanitized.description || "",
          imageUrl: "/images/recipes/default.jpg",
          prepTime: sanitized.prepTime,
          cookTime: sanitized.cookTime,
          servings: sanitized.servings,
          calories: sanitized.calories,
          cuisine: sanitized.cuisine,
          dietaryTags: sanitized.dietaryTags ? sanitized.dietaryTags.join(", ") : null,
          steps: JSON.stringify(sanitized.steps),
          userId: userId,
          ingredients: {
            create: sanitized.ingredients.map((ing) => ({
              name: ing.name,
              amount: ing.amount,
              unit: ing.unit,
            })),
          },
        },
        include: { ingredients: true },
      });

      try {
        const imagePrompt = sanitized.imagePrompt;
        const imageUrl = await generateRecipeImage(imagePrompt);
        createdRecipe = await prisma.recipe.update({
          where: { id: createdRecipe.id },
          data: { imageUrl },
          include: { ingredients: true },
        });
      } catch (err) {
        console.error("Recipe image generation failed in structured pipeline:", err);
      }


      const conciseMessage = `Recipe created successfully.
Recipe: ${sanitized.title}
Prep Time: ${sanitized.prepTime} min
Cook Time: ${sanitized.cookTime} min
Calories: ${sanitized.calories || "N/A"}
Servings: ${sanitized.servings}
View the recipe card below.

<!-- recipeId:${createdRecipe.id} -->`;

      await prisma.chatMessage.create({
        data: {
          role: "assistant",
          content: conciseMessage,
          userId: userId,
        },
      });

      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(conciseMessage));
          controller.close();
        },
      });

      return new NextResponse(stream, {
        headers: {
          ...rateLimitHeaders,
          "Content-Type": "text/plain; charset=utf-8",
          "X-Recipe-Data": encodeURIComponent(JSON.stringify(createdRecipe)),
        },
      });

    } catch (err) {
      console.error("Structured recipe pipeline error, running fallback:", err);

      const errMsg = err instanceof Error ? err.message : String(err);
      const fallbackText = `I encountered an issue generating your structured recipe card. Error: ${errMsg}. Please try again.`;

      await prisma.chatMessage.create({
        data: {
          role: "assistant",
          content: fallbackText,
          userId: userId,
        },
      });

      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(fallbackText));
          controller.close();
        },
      });

      return new NextResponse(stream, {
        headers: {
          ...rateLimitHeaders,
          "Content-Type": "text/plain; charset=utf-8",
        },
      });
    }

  } else {
    const result = streamText({
      model: openaiClient(DEFAULT_MODEL),
      system: SYSTEM_PROMPT,
      messages: formattedMessages,
      temperature: 0.7,
      async onFinish({ text }) {
        try {
          await prisma.chatMessage.create({
            data: {
              role: "assistant",
              content: text,
              userId: userId,
            },
          });
        } catch (dbErr) {
          console.error("Failed to write assistant response in normal chat pipeline:", dbErr);
        }
      },
    });

    return result.toTextStreamResponse({ headers: rateLimitHeaders });
  }
});
