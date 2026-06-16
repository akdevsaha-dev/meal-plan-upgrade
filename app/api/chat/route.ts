import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";
import { openai } from "@/lib/openai";
import { generateRecipeImage } from "@/lib/nanoBanana";
import { withErrorHandler } from "@/lib/apiWrapper";
import { SYSTEM_PROMPT } from "@/lib/chefPrompt";

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
  try {
    const parsed = JSON.parse(assistantMessage);
    if (parsed?.title && typeof parsed.title === "string") {
      createdRecipe = await prisma.recipe.create({
        data: {
          title: parsed.title,
          description: parsed.description || "",
          imageUrl: "/images/recipes/default.jpg",
          prepTime: parsed.prepTime || parsed.prep_time || 0,
          cookTime: parsed.cookTime || parsed.cook_time || 0,
          servings: parsed.servings || 1,
          calories: parsed.calories ?? null,
          cuisine: parsed.cuisine ?? null,
          dietaryTags: parsed.dietaryTags ?? parsed.dietary_tags ?? null,
          userId: session.userId,
          ingredients: {
            create: Array.isArray(parsed.ingredients)
              ? parsed.ingredients.map((ing: any) => ({
                name: String(ing?.name || ""),
                amount: String(ing?.amount || ""),
                unit: String(ing?.unit || ""),
              })) : [],
          },
        },
        include: { ingredients: true },
      });


      try {
        const imagePrompt =
          parsed.imagePrompt || parsed.image_prompt || `A delicious ${parsed.title}`;
        const imageUrl = await generateRecipeImage(imagePrompt);
        await prisma.recipe.update({
          where: { id: createdRecipe.id },
          data: { imageUrl },
        });
        createdRecipe.imageUrl = imageUrl;
      } catch (err) {
        console.error("Image generation failed:", err);
      }
    }
  } catch (err) {
    console.error("Failed to parse assistant JSON:", err);
  }
  return NextResponse.json({
    message: assistantMessage,
    recipe: createdRecipe,
    model: CHAT_MODEL,
  });
});
