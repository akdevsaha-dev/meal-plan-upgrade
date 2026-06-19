/**
 * Conversational message helpers for Chef Ferraro.
 *
 * These keep the recipe flow feeling human and interactive: a warm
 * acknowledgement before cooking, and a friendly sign-off once the dish is
 * ready. They also provide a safety net that strips raw JSON the model may
 * occasionally leak into normal conversation.
 */

const ACK_MESSAGES = [
  "Great choice! Give me a moment while I put something special together for you...",
  "Ooh, excellent pick! Let me head into the kitchen and craft this for you...",
  "Love it! I'm firing up the stove and getting your recipe ready right now...",
  "Wonderful choice! Let me cook up something delicious for you...",
  "Mmm, great idea! Hang tight while I prepare the perfect recipe for you...",
  "Fantastic! Let me work my magic and plate this up for you...",
];

const CLOSING_TEMPLATES = [
  (title: string) =>
    `And here's your ${title}! 🍽️ Plate it up and enjoy it with the people you love.`,
  (title: string) =>
    `Your ${title} is ready! I hope it brings a little warmth to your table. Buon appetito!`,
  (title: string) =>
    `Voilà — ${title}, served! Gather everyone around and dig in together. ❤️`,
  (title: string) =>
    `That's your ${title} done! Enjoy every bite with family and friends.`,
  (title: string) =>
    `Here is your ${title}! Savor it slowly and share it with good company. 🥂`,
];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** A warm, generic acknowledgement shown the instant a recipe is requested. */
export function pickAckMessage(): string {
  return pickRandom(ACK_MESSAGES);
}

/** A friendly sign-off shown once the recipe has been generated. */
export function pickClosingMessage(title: string): string {
  const dish = title?.trim() || "dish";
  return pickRandom(CLOSING_TEMPLATES)(dish);
}

/**
 * Removes raw JSON the model may accidentally emit during normal conversation.
 *
 * Handles three cases:
 *  - Complete fenced ```json ... ``` (or ``` { ... } ```) blocks.
 *  - An unclosed trailing fence (important while streaming partial output).
 *  - A bare JSON object/array that takes up the whole reply.
 *
 * Used incrementally on the accumulated stream, so partial JSON never reaches
 * the client: while a fence is still open the cleaned length simply doesn't
 * grow, so nothing is emitted until (and unless) plain text resumes.
 */
export function stripJsonBlocks(text: string): string {
  let out = text;

  // Closed fenced code blocks that contain JSON-looking content.
  out = out.replace(/```(?:json)?\s*[[{][\s\S]*?[\]}]\s*```/gi, "");

  // Unclosed trailing fence (e.g. mid-stream) that has started emitting JSON.
  out = out.replace(/```(?:json)?\s*[[{][\s\S]*$/i, "");

  // A reply that is essentially just a bare JSON object/array.
  const trimmed = out.trim();
  if (/^[[{][\s\S]*[\]}]$/.test(trimmed)) {
    try {
      JSON.parse(trimmed);
      return "";
    } catch {
      // Not valid JSON — leave it alone.
    }
  }

  return out;
}
