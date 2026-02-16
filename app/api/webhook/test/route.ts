/**
 * Simple test webhook - NO Chroma, NO OpenAI
 * Use this URL in Twilio to verify: Twilio → Vercel → WhatsApp works
 * If you get a reply, the issue is in the main webhook (Chroma/OpenAI)
 */

import { NextResponse } from "next/server";

const TWIML = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>Bot connection test OK! Main webhook is the issue.</Message>
</Response>`;

export async function POST() {
  return new NextResponse(TWIML, {
    status: 200,
    headers: { "Content-Type": "text/xml" },
  });
}

export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "Test webhook. Set Twilio to: YOUR_VERCEL_URL/api/webhook/test",
  });
}
