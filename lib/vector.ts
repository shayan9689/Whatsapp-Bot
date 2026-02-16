/**
 * Chroma vector database client and collection management
 * Supports: Chroma Cloud (CHROMA_API_KEY) or local/Docker (CHROMA_URL)
 */

import { ChromaClient, CloudClient } from "chromadb";
import { OpenAIEmbeddingFunction } from "@chroma-core/openai";

const COLLECTION_NAME = "portfolio_chunks";

function parseChromaUrl(url: string): { host: string; port: number; ssl: boolean } {
  try {
    const parsed = new URL(url);
    return {
      host: parsed.hostname,
      port: parsed.port ? parseInt(parsed.port, 10) : parsed.protocol === "https:" ? 443 : 8000,
      ssl: parsed.protocol === "https:",
    };
  } catch {
    return { host: "localhost", port: 8000, ssl: false };
  }
}

export function getChromaClient() {
  // Chroma Cloud: use CloudClient when API key is set
  const apiKey = process.env.CHROMA_API_KEY;
  if (apiKey) {
    return new CloudClient({
      apiKey,
      tenant: process.env.CHROMA_TENANT,
      database: process.env.CHROMA_DATABASE,
    });
  }
  // Local/Docker: use ChromaClient with host/port
  const chromaUrl = process.env.CHROMA_URL ?? "http://localhost:8000";
  const { host, port, ssl } = parseChromaUrl(chromaUrl);
  return new ChromaClient({ host, port, ssl });
}

export async function getPortfolioCollection() {
  const client = getChromaClient();
  const embedder = new OpenAIEmbeddingFunction({
    apiKey: process.env.OPENAI_API_KEY!,
    modelName: "text-embedding-3-small",
  });

  return client.getOrCreateCollection({
    name: COLLECTION_NAME,
    embeddingFunction: embedder,
  });
}
