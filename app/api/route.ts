/**
 * GET /api - API info for integration
 */

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const headers = request.headers;
  const host = headers.get("x-forwarded-host") ?? headers.get("host") ?? "localhost:3000";
  const protocol = headers.get("x-forwarded-proto") ?? "http";
  const baseUrl = `${protocol}://${host}`;

  return NextResponse.json({
    name: "WhatsApp RAG Bot API",
    baseUrl,
    endpoints: {
      chat: `${baseUrl}/api/chat`,
      messages: `${baseUrl}/api/messages`,
      webhook: `${baseUrl}/api/webhook`,
    },
  });
}
