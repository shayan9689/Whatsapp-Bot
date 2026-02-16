/**
 * Root API info - for frontend integration
 * GET / returns base URL and webhook endpoint
 */

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const headers = request.headers;
  const host = headers.get("x-forwarded-host") ?? headers.get("host") ?? "localhost:3000";
  const protocol = headers.get("x-forwarded-proto") ?? "http";
  const baseUrl = `${protocol}://${host}`;
  const webhookUrl = `${baseUrl}/api/webhook`;

  return NextResponse.json({
    name: "WhatsApp RAG Bot API",
    baseUrl,
    webhookUrl,
    endpoints: {
      webhook: "/api/webhook",
      webhookTest: "/api/webhook/test",
    },
  });
}
