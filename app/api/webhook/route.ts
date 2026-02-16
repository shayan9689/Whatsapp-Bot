/**
 * Twilio WhatsApp webhook - receives messages, runs RAG, replies via TwiML
 */

import { NextRequest, NextResponse } from "next/server";

// Allow up to 30s for RAG + OpenAI (Vercel Pro; Hobby caps at 10s)
export const maxDuration = 30;
import { retrieveContext } from "@/lib/rag";
import { openai, SYSTEM_PROMPT } from "@/lib/openai";

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

// GET: health check / webhook validation (visit in browser to test)
export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "WhatsApp webhook is live. Twilio sends POST requests here.",
  });
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const body = formData.get("Body")?.toString() ?? "";
    const from = formData.get("From")?.toString() ?? "";

    if (!body.trim()) {
      return twimlResponse("Please send a message to get a response.");
    }

    // Quick test - no API calls (use to verify Twilio → Vercel works)
    const trimmed = body.trim().toLowerCase();
    if (trimmed === "ping" || trimmed === "test") {
      return twimlResponse("Pong! Bot is connected.");
    }

    // Handle greetings with a friendly welcome
    if (isGreeting(body)) {
      return twimlResponse(GREETING_RESPONSE);
    }

    // Retrieve relevant context from portfolio
    const context = await retrieveContext(body);

    // Build messages for OpenAI
    const userMessage = context
      ? `Context from portfolio:\n\n${context}\n\n---\n\nUser question: ${body}`
      : body;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
      max_tokens: 400,
      temperature: 0.3,
    });

    const reply =
      completion.choices[0]?.message?.content ??
      "This information is not available in the portfolio.";

    return twimlResponse(reply);
  } catch (error) {
    console.error("Webhook error:", error);
    return twimlResponse(
      "Sorry, something went wrong. Please try again later."
    );
  }
}

function twimlResponse(message: string): NextResponse {
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${escapeXml(message)}</Message>
</Response>`;

  return new NextResponse(twiml, {
    status: 200,
    headers: {
      "Content-Type": "text/xml",
    },
  });
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
