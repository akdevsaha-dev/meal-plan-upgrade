import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";
import { checkQuota } from "@/lib/quota";
import { openaiClient, DEFAULT_MODEL } from "@/lib/ai";
import { generateRecipeImage } from "@/lib/nanoBanana";
import { withErrorHandler } from "@/lib/apiWrapper";
import { SYSTEM_PROMPT } from "@/lib/chefPrompt";
import { RecipeSchema } from "@/validation/recipeSchema";
import { sanitizeRecipe } from "@/lib/sanitizeRecipe";
import { streamText, generateText, Output } from "ai";
import { checkChatRateLimit } from "@/lib/rate-limit";
import { pickAckMessage, pickClosingMessage, stripJsonBlocks } from "@/lib/chefMessages";

const MAX_HISTORY = 20;
const MAX_MESSAGE_LENGTH = 2000;

/**
 * Newline-delimited JSON stream protocol shared with the chat client.
 *
 * Each event is a single JSON object on its own line:
 *  - { type: "text",     content }  → append to the current streaming bubble
 *  - { type: "message",  content }  → a complete standalone assistant bubble
 *  - { type: "thinking" }           → re-show the typing indicator
 *  - { type: "recipe",   recipe }   → attach a generated recipe card
 */
type ChatEvent =
  | { type: "text"; content: string }
  | { type: "message"; content: string }
  | { type: "thinking" }
  | { type: "recipe"; recipe: unknown };

const NDJSON_HEADERS = { "Content-Type": "application/x-ndjson; charset=utf-8" };

function encodeEvent(encoder: TextEncoder, event: ChatEvent): Uint8Array {
  return encoder.encode(JSON.stringify(event) + "\n");
}

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
  const chatQuota = await checkQuota(userId, "send_chat");
  if (!chatQuota.allowed) {
    return NextResponse.json(
      { error: chatQuota.error },
      { status: 403 }
    );
  }

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

    const recipeQuota = await checkQuota(userId, "create_recipe");

    if (!recipeQuota.allowed) {
      return NextResponse.json(
        {
          error: recipeQuota.error,
          limit: recipeQuota.limits.recipesPerDay,
          remaining: 0,
        },
        {
          status: 403,
          headers: rateLimitHeaders,
        }
      );
    }

    const encoder = new TextEncoder();

    // Stream the conversation in phases so the chat feels human and interactive:
    //   1. an instant, warm acknowledgement ("Great choice!...")
    //   2. a "thinking" beat while the recipe is actually generated
    //   3. the recipe card followed by a friendly sign-off
    const stream = new ReadableStream({
      async start(controller) {
        const send = (event: ChatEvent) => controller.enqueue(encodeEvent(encoder, event));

        // 1. Warm acknowledgement (saved + shown immediately).
        const ackMessage = pickAckMessage();
        send({ type: "message", content: ackMessage });
        await prisma.chatMessage.create({
          data: { role: "assistant", content: ackMessage, userId },
        });

        // 2. Show the typing indicator again while we cook.
        send({ type: "thinking" });

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

          // 3a. The recipe card itself. It is persisted as its own marker-only
          //     message so that, on reload, the card renders in this position —
          //     before the sign-off, matching the live order.
          send({ type: "recipe", recipe: createdRecipe });
          await prisma.chatMessage.create({
            data: {
              role: "assistant",
              content: `<!-- recipeId:${createdRecipe.id} -->`,
              userId,
            },
          });

          // 3b. Friendly sign-off, shown after the card.
          const closing = pickClosingMessage(sanitized.title);
          send({ type: "message", content: closing });
          await prisma.chatMessage.create({
            data: { role: "assistant", content: closing, userId },
          });
        } catch (err) {
          console.error("Structured recipe pipeline error, running fallback:", err);

          const errMsg = err instanceof Error ? err.message : String(err);
          const fallbackText = `Sorry, I ran into a problem while preparing that recipe (${errMsg}). Could you try asking me again?`;
          send({ type: "message", content: fallbackText });
          await prisma.chatMessage.create({
            data: { role: "assistant", content: fallbackText, userId },
          });
        } finally {
          controller.close();
        }
      },
    });

    return new NextResponse(stream, {
      headers: {
        ...rateLimitHeaders,
        ...NDJSON_HEADERS,
      },
    });

  } else {
    const result = streamText({
      model: openaiClient(DEFAULT_MODEL),
      system: SYSTEM_PROMPT,
      messages: formattedMessages,
      temperature: 0.7,
    });

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        const send = (event: ChatEvent) => controller.enqueue(encodeEvent(encoder, event));

        // Sanitize incrementally: only ever emit the cleaned text we haven't
        // sent yet. While a JSON block is mid-stream the cleaned length doesn't
        // grow, so partial JSON never leaks to the client.
        let full = "";
        let emitted = "";

        try {
          for await (const delta of result.textStream) {
            full += delta;
            const clean = stripJsonBlocks(full);
            if (clean.length > emitted.length) {
              send({ type: "text", content: clean.slice(emitted.length) });
              emitted = clean;
            }
          }

          const finalClean = stripJsonBlocks(full).trim();
          if (finalClean.length > emitted.length) {
            send({ type: "text", content: finalClean.slice(emitted.length) });
          }

          const contentToSave =
            finalClean ||
            "Sorry, I couldn't put that into words just now. Could you rephrase?";

          if (!finalClean) {
            send({ type: "message", content: contentToSave });
          }

          try {
            await prisma.chatMessage.create({
              data: { role: "assistant", content: contentToSave, userId },
            });
          } catch (dbErr) {
            console.error("Failed to write assistant response in normal chat pipeline:", dbErr);
          }
        } catch (err) {
          console.error("Normal chat streaming error:", err);
          send({
            type: "message",
            content: "Sorry, something went wrong on my end. Please try again.",
          });
        } finally {
          controller.close();
        }
      },
    });

    return new NextResponse(stream, {
      headers: {
        ...rateLimitHeaders,
        ...NDJSON_HEADERS,
      },
    });
  }
});
