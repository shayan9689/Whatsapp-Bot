/**
 * GET /api/sync-status - Debug sync setup (Redis, Twilio mirror)
 */

import { NextResponse } from "next/server";
import { ping, getMessages } from "@/lib/redis";

export async function GET() {
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL ? "set" : "missing";
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN ? "set" : "missing";
  const mirrorNumber = process.env.MIRROR_WHATSAPP_NUMBER ?? null;

  const redisOk = await ping();
  const msgs = await getMessages(5);
  const messageCount = msgs.length;

  return NextResponse.json({
    redis: {
      url: redisUrl,
      token: redisToken,
      connected: redisOk,
      recentMessages: messageCount,
    },
    webToWhatsApp: {
      mirrorNumber: mirrorNumber ? "configured" : "NOT SET - add MIRROR_WHATSAPP_NUMBER to .env",
      yourNumber: mirrorNumber ? `${mirrorNumber.slice(0, 4)}***` : null,
    },
    fix: {
      webToWhatsApp: "Add MIRROR_WHATSAPP_NUMBER=+1234567890 to .env (your WhatsApp number with country code)",
      whatsAppToWeb: "Ensure UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are correct. Get them from console.upstash.com → your DB → REST API",
    },
  });
}
