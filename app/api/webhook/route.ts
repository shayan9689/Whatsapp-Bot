/**
 * Twilio WhatsApp webhook - receives messages, runs RAG, replies via TwiML
 * Also stores messages for frontend sync (WhatsApp → web)
 */

import { NextRequest, NextResponse } from "next/server";
import { processMessage } from "@/lib/bot";
import { appendMessage } from "@/lib/redis";

export const maxDuration = 30;

// GET: health check / webhook validation (visit in browser to test)
export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "WhatsApp webhook is live. Twilio sends POST requests here.",
  });
}

export async function POST(request: NextRequest) {
  try {
    const text = await request.text();
    const params = new URLSearchParams(text);
    const body = params.get("Body") ?? "";

    const reply = await processMessage(body);

    // Store for frontend (WhatsApp → web sync)
    await appendMessage({
      role: "user",
      content: body.trim(),
      source: "whatsapp",
      timestamp: Date.now(),
    });
    await appendMessage({
      role: "assistant",
      content: reply,
      source: "whatsapp",
      timestamp: Date.now(),
    });

    return twimlResponse(reply);
  } catch (error) {
    console.error("Webhook error:", error);
    return twimlResponse(
      "Apologies, something went wrong. Please try again."
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
