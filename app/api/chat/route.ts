import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";
import { openai } from "@/lib/openai";
import { generateRecipeImage } from "@/lib/nanoBanana";
import { withErrorHandler } from "@/lib/apiWrapper";
import { SYSTEM_PROMPT } from "@/lib/chefPrompt";
import { parseLLMJson } from "@/lib/parseLLM";
import { RecipeSchema } from "@/validation/recipeSchema";
import { sanitizeRecipe } from "@/lib/sanitizeRecipe";

const CHAT_MODEL = "gpt-4o-mini";
const MAX_HISTORY = 20;
const MAX_MESSAGE_LENGTH = 2000;

export const GET = withErrorHandler(async (req: NextRequest) => {
  const session = getUserFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  return NextResponse.json({
    model: CHAT_MODEL
  });
});

export const POST = withErrorHandler(async (req: NextRequest) => {
  const session = getUserFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { message } = await req.json();
  if (!message || typeof message !== "string") {
    return NextResponse.json({ error: "Invalid message" }, { status: 400 });
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json({ error: "Message too large" }, { status: 400 });
  }

  await prisma.chatMessage.create({
    data: {
      role: "user",
      content: message,
      userId: session.userId,
    },
  });

  const history = await prisma.chatMessage.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "asc" },
    take: MAX_HISTORY,
  });

  const messages = [
    { role: "system" as const, content: SYSTEM_PROMPT },
    ...history.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
  ];

  let completion;
  try {
    completion = await openai.chat.completions.create({
      model: CHAT_MODEL,
      messages,
      temperature: 0.7,
    });
  } catch (error: any) {
    console.error("OpenAI API Error:", error.message || error);
    if (error.status === 401) {
      return NextResponse.json(
        { error: "Invalid OpenAI API key configured. Please check your .env file." },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: "OpenAI service is currently unavailable or over quota." },
      { status: 500 }
    );
  }

  const assistantMessage = completion.choices[0]?.message?.content ?? "";

  await prisma.chatMessage.create({
    data: {
      role: "assistant",
      content: assistantMessage,
      userId: session.userId,
    },
  });

  let createdRecipe = null;

  const parsed = parseLLMJson(assistantMessage);

  if (parsed !== null) {
    const validation = RecipeSchema.safeParse(parsed);

    if (validation.success) {
      const sanitized = sanitizeRecipe(validation.data);

      try {
        createdRecipe = await prisma.recipe.create({
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
            userId: session.userId,
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
          await prisma.recipe.update({
            where: { id: createdRecipe.id },
            data: { imageUrl },
          });
          createdRecipe.imageUrl = imageUrl;
        } catch (err) {
          console.error("Recipe image generation failed:", err);
        }
      } catch (dbErr) {
        console.error("Failed to write sanitized recipe to database:", dbErr);
      }
    } else {
      console.warn(
        "Recipe validation failed for assistant message. Issues:",
        JSON.stringify(validation.error.issues, null, 2)
      );
    }
  } else {
    if (assistantMessage.trim().startsWith("{") || assistantMessage.includes("title")) {
      console.error("Assistant response appeared to contain recipe JSON but parsing failed completely.");
    }
  }

  return NextResponse.json({
    message: assistantMessage,
    recipe: createdRecipe,
    model: CHAT_MODEL,
  });
});


