/**
 * Shared bot logic: RAG + OpenAI reply
 * Used by webhook (WhatsApp) and /api/chat (web frontend)
 */

import { retrieveContext } from "./rag";
import { openai, SYSTEM_PROMPT } from "./openai";

const GREETING_PATTERNS = [
  /^(hi|hey|hello|hola|hey there|hi there)[\s!.,?]*$/i,
  /^(good\s?(morning|afternoon|evening|night))[\s!.,?]*$/i,
  /^(howdy|yo|sup|what'?s up|wassup)[\s!.,?]*$/i,
  /^(greetings?|salutations?)[\s!.,?]*$/i,
  /^(hiya|heya)[\s!.,?]*$/i,
];

const GREETING_RESPONSE =
  "Hello! 👋 I'm Shayan's portfolio assistant. Ask me about his skills, projects, experience, or how to contact him. For example: \"What are your skills?\" or \"Tell me about your projects\".";

function isGreeting(message: string): boolean {
  const trimmed = message.trim();
  if (trimmed.length > 50) return false;
  return GREETING_PATTERNS.some((pattern) => pattern.test(trimmed));
}

export async function processMessage(userMessage: string): Promise<string> {
  const trimmed = userMessage.trim();
  if (!trimmed) return "Please send a message to get a response.";

  const lower = trimmed.toLowerCase();
  if (lower === "ping" || lower === "test") return "Pong! Bot is connected.";

  if (isGreeting(trimmed)) return GREETING_RESPONSE;

  const context = await retrieveContext(trimmed);
  const prompt = context
    ? `Context from portfolio:\n\n${context}\n\n---\n\nUser question: ${trimmed}`
    : trimmed;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: prompt },
    ],
    max_tokens: 400,
    temperature: 0.3,
  });

  return (
    completion.choices[0]?.message?.content ??
    "This information is not available in the portfolio."
  );
}
