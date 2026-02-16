/**
 * RAG service: chunk documents, store in Chroma, retrieve relevant chunks
 */

import { getPortfolioCollection } from "./vector";

const CHUNK_SIZE = 500;
const CHUNK_OVERLAP = 50;
const TOP_K = 3;

/**
 * Split text into overlapping chunks
 */
export function chunkText(text: string): string[] {
  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + CHUNK_SIZE, text.length);
    let chunk = text.slice(start, end);

    if (end < text.length) {
      const lastPeriod = chunk.lastIndexOf(".");
      const lastNewline = chunk.lastIndexOf("\n");
      const lastSpace = chunk.lastIndexOf(" ");
      const breakPoint = Math.max(lastPeriod, lastNewline, lastSpace);
      if (breakPoint >= 0 && breakPoint > CHUNK_SIZE / 2) {
        chunk = chunk.slice(0, breakPoint + 1);
        start += breakPoint + 1 - CHUNK_OVERLAP;
      } else {
        start = end - CHUNK_OVERLAP;
      }
    } else {
      start = end;
    }

    const trimmed = chunk.trim();
    if (trimmed) chunks.push(trimmed);
  }

  return chunks;
}

/**
 * Add documents to the vector store (for indexing)
 */
export async function indexPortfolioDocuments(
  documents: { id: string; text: string }[]
): Promise<void> {
  const collection = await getPortfolioCollection();
  const allIds: string[] = [];
  const allChunks: string[] = [];

  for (const doc of documents) {
    const chunks = chunkText(doc.text);
    chunks.forEach((chunk, i) => {
      allIds.push(`${doc.id}_chunk_${i}`);
      allChunks.push(chunk);
    });
  }

  if (allIds.length > 0) {
    await collection.upsert({
      ids: allIds,
      documents: allChunks,
    });
  }
}

/**
 * Retrieve top-k relevant chunks for a query
 */
export async function retrieveContext(query: string): Promise<string> {
  const collection = await getPortfolioCollection();
  const results = await collection.query({
    queryTexts: [query],
    nResults: TOP_K,
  });

  const docs = results.documents?.[0] ?? [];
  const filtered = docs.filter((d): d is string => typeof d === "string" && d.length > 0);
  return filtered.join("\n\n---\n\n");
}
