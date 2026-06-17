import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";
import { openaiClient, DEFAULT_MODEL } from "@/lib/ai";
import { generateRecipeImage } from "@/lib/nanoBanana";
import { withErrorHandler } from "@/lib/apiWrapper";
import { SYSTEM_PROMPT } from "@/lib/chefPrompt";
import { RecipeSchema } from "@/validation/recipeSchema";
import { sanitizeRecipe } from "@/lib/sanitizeRecipe";
import { streamText, generateText, generateObject } from "ai";

const MAX_HISTORY = 20;
const MAX_MESSAGE_LENGTH = 2000;

export const GET = withErrorHandler(async (req: NextRequest) => {
  const session = getUserFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  return NextResponse.json({
    model: DEFAULT_MODEL,
  });
});

export const POST = withErrorHandler(async (req: NextRequest) => {
  const session = getUserFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
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

  const userId = session.userId;

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
    orderBy: { createdAt: "asc" },
    take: MAX_HISTORY,
  });

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

    const { object: recipe } = await generateObject({
      model: openaiClient(DEFAULT_MODEL),
      schema: RecipeSchema,
      system: "You are a professional chef. Generate a realistic and delicious recipe based on the user's request. Fill in all fields appropriately.",
      messages: formattedMessages,
    });

    const sanitized = sanitizeRecipe(recipe);

    let createdRecipe = null;
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
        await prisma.recipe.update({
          where: { id: createdRecipe.id },
          data: { imageUrl },
        });
      } catch (err) {
        console.error("Recipe image generation failed in structured pipeline:", err);
      }
    } catch (dbErr) {
      console.error("Failed to write sanitized recipe to database:", dbErr);
    }

    const confirmationPrompt = `Write a short, friendly, natural-language confirmation message to the user that their recipe "${sanitized.title}" has been successfully generated and saved to their recipe collection. Summarize the recipe key parameters (e.g. cuisine: ${sanitized.cuisine || "general"}, prep time: ${sanitized.prepTime} mins, calories: ${sanitized.calories || "N/A"}). Do NOT output raw JSON or internal recipe object fields in the text. Keep it conversational.`;

    const result = await streamText({
      model: openaiClient(DEFAULT_MODEL),
      prompt: confirmationPrompt,
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
          console.error("Failed to write assistant response in structured pipeline:", dbErr);
        }
      },
    });

    return result.toTextStreamResponse();
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

    return result.toTextStreamResponse();
  }
});
