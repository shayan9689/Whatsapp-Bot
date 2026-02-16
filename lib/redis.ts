/**
 * Upstash Redis for message storage (WhatsApp ↔ frontend sync)
 * Create free DB at https://console.upstash.com/
 */

import { Redis } from "@upstash/redis";

function getRedis(): Redis | null {
  const url = (process.env.UPSTASH_REDIS_REST_URL ?? "").replace(/^["']|["']$/g, "").trim();
  const token = (process.env.UPSTASH_REDIS_REST_TOKEN ?? "").replace(/^["']|["']$/g, "").trim();
  if (!url || !token) return null;
  return new Redis({ url, token });
}

export type StoredMessage = {
  role: "user" | "assistant";
  content: string;
  source: "web" | "whatsapp";
  timestamp: number;
};

const KEY = "chat:messages";
const MAX_MESSAGES = 100;

export async function appendMessage(msg: StoredMessage): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  try {
    await redis.lpush(KEY, JSON.stringify(msg));
    await redis.ltrim(KEY, 0, MAX_MESSAGES - 1);
  } catch (e) {
    console.error("Redis append error:", e);
  }
}

export async function ping(): Promise<boolean> {
  const redis = getRedis();
  if (!redis) return false;
  try {
    await redis.ping();
    return true;
  } catch {
    return false;
  }
}

export async function getMessages(limit = 50): Promise<StoredMessage[]> {
  const redis = getRedis();
  if (!redis) return [];
  try {
    const raw = await redis.lrange(KEY, 0, limit - 1);
    return raw
      .map((r) => {
        try {
          return JSON.parse(r as string) as StoredMessage;
        } catch {
          return null;
        }
      })
      .filter((m): m is StoredMessage => m != null)
      .reverse();
  } catch (e) {
    console.error("Redis get error:", e);
    return [];
  }
}
