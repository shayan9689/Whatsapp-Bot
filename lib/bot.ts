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
  /^(salaam|assalam|salam|asalam|assalamualaikum|assalamu\s*alaikum)[\s!.,?]*$/i,
  /^(how\s+are\s+you|how\s+r\s+u|hru)[\s!.,?]*$/i,
  /^(hey\s+there|hi\s+there)[\s!.,?]*$/i,
  /^(good\s+day|g'?day)[\s!.,?]*$/i,
  /^(hey\s*$|hi\s*$)/i,
  /^hello\s*[!.]*$/i,
];

const GREETING_RESPONSE =
  "Hello. I'm Shayan's portfolio assistant. I can help with his skills, projects, experience, and contact details. What would you like to know?";

function normalizeInput(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function isGreetingOnly(message: string): boolean {
  const normalized = normalizeInput(message);
  if (normalized.length > 60) return false;
  return GREETING_ONLY_PATTERNS.some((pattern) => pattern.test(normalized));
}

export async function processMessage(userMessage: string): Promise<string> {
  const trimmed = normalizeInput(userMessage);
  if (!trimmed) return "Please send a message to get started.";

  const lower = trimmed.toLowerCase();
  if (lower === "ping" || lower === "test") return "Connected. How can I help?";

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

  const reply = completion.choices[0]?.message?.content?.trim();
  return reply ?? "This information is not available in the portfolio.";
}
