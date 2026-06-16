/**
 * Safely extracts and parses JSON output from an LLM response.
 * Handles markdown code fences (e.g. ```json ... ```) and surrounding conversational text.
 * 
 * @param text - The raw output text from the LLM model.
 * @returns The parsed JSON structure if valid, or null if no parseable JSON could be found.
 */
export function parseLLMJson(text: string): unknown | null {
  if (!text || typeof text !== "string") {
    return null;
  }

  const trimmed = text.trim();

  try {
    return JSON.parse(trimmed);
  } catch {
  }

  const codeBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/;
  const match = trimmed.match(codeBlockRegex);
  if (match && match[1]) {
    try {
      return JSON.parse(match[1].trim());
    } catch {
    }
  }

  const startIdx = trimmed.indexOf("{");
  const endIdx = trimmed.lastIndexOf("}");
  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    const jsonCandidate = trimmed.slice(startIdx, endIdx + 1);
    try {
      return JSON.parse(jsonCandidate);
    } catch (err) {
      console.error("Failed to parse extracted LLM JSON substring:", err);
    }
  }

  return null;
}
