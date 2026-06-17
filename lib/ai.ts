import { createOpenAI } from "@ai-sdk/openai";

export const DEFAULT_MODEL = "gpt-4o-mini";

const apiKey = process.env.AI_GATEWAY_API_KEY;

if (!apiKey || apiKey.trim() === "") {
  throw new Error("AI_GATEWAY_API_KEY is missing or empty");
}

export const openaiClient = createOpenAI({
  apiKey: apiKey,
  baseURL: "https://ai-gateway.vercel.sh/v1",
});
