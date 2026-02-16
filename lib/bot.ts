/**
 * Shared bot logic: RAG + OpenAI reply
 * Used by webhook (WhatsApp) and /api/chat (web frontend)
 */

import { retrieveContext } from "./rag";
import { openai, SYSTEM_PROMPT } from "./openai";

const GREETING_ONLY_PATTERNS = [
  /^(hi|hey|hello|hola|hey there|hi there|hiya|heya)[\s!.,?]*$/i,
  /^(good\s?(morning|afternoon|evening|night))[\s!.,?]*$/i,
  /^(howdy|yo|sup|what'?s up|wassup|waddup)[\s!.,?]*$/i,
  /^(greetings?|salutations?)[\s!.,?]*$/i,
  /^(salaam|assalam|salam|asalam)[\s!.,?]*$/i,
  /^(how\s+are\s+you|how\s+r\s+u|hru)[\s!.,?]*$/i,
  /^(hey\s+there|hi\s+there)[\s!.,?]*$/i,
  /^(good\s+day|g'?day)[\s!.,?]*$/i,
];

const GREETING_RESPONSE =
  "Hello! 👋 I'm Shayan's portfolio assistant. Ask about his skills, projects, experience, or contact. Try: \"What are your skills?\" or \"Tell me about your projects\".";

function isGreetingOnly(message: string): boolean {
  const trimmed = message.trim();
  if (trimmed.length > 60) return false;
  return GREETING_ONLY_PATTERNS.some((pattern) => pattern.test(trimmed));
}

export async function processMessage(userMessage: string): Promise<string> {
  const trimmed = userMessage.trim();
  if (!trimmed) return "Please send a message to get a response.";

  const lower = trimmed.toLowerCase();
  if (lower === "ping" || lower === "test") return "Pong! Bot is connected.";

  if (isGreetingOnly(trimmed)) return GREETING_RESPONSE;

  const context = await retrieveContext(trimmed);
  const prompt = context
    ? `Context from portfolio:\n\n${context}\n\n---\n\nUser question: ${trimmed}\n\nAnswer directly and concisely. No preamble.`
    : `${trimmed}\n\nAnswer directly and concisely. No preamble.`;

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
