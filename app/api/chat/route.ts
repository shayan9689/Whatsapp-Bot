/**
 * Chat API for web frontend
 * POST: send message, get reply, optionally mirror to WhatsApp
 */

import { NextRequest, NextResponse } from "next/server";
import { processMessage } from "@/lib/bot";
import { appendMessage } from "@/lib/redis";
import { sendWhatsApp } from "@/lib/twilio-send";

export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const message = typeof body?.message === "string" ? body.message.trim() : "";
    if (!message) {
      return NextResponse.json(
        { error: "message is required" },
        { status: 400 }
      );
    }

    const reply = await processMessage(message);

    // Store for frontend (and WhatsApp messages)
    await appendMessage({
      role: "user",
      content: message,
      source: "web",
      timestamp: Date.now(),
    });
    await appendMessage({
      role: "assistant",
      content: reply,
      source: "web",
      timestamp: Date.now(),
    });

    // Mirror to WhatsApp if configured
    const mirrorTo = process.env.MIRROR_WHATSAPP_NUMBER;
    if (mirrorTo) {
      const mirrorBody = `[Web] User: ${message}\n\nBot: ${reply}`;
      await sendWhatsApp(mirrorTo, mirrorBody);
    }

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
