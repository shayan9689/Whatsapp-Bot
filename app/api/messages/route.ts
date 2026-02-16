/**
 * GET /api/messages - recent chat messages (web + WhatsApp)
 * Frontend polls this to show WhatsApp messages in the chat
 */

import { NextResponse } from "next/server";
import { getMessages } from "@/lib/redis";

export async function GET() {
  const messages = await getMessages(50);
  return NextResponse.json({ messages });
}
