/**
 * One-time script to index portfolio documents into Chroma
 * Run: npm run index
 */

import "dotenv/config";
import path from "path";
import { loadPortfolioDocuments } from "../lib/load-portfolio";
import { indexPortfolioDocuments } from "../lib/rag";

// Ensure .env is loaded from project root (dotenv/config uses cwd by default)
import * as dotenv from "dotenv";
dotenv.config({ path: path.join(process.cwd(), ".env") });

async function main() {
  // Validate Chroma config
  const apiKey = process.env.CHROMA_API_KEY;
  const chromaUrl = process.env.CHROMA_URL;
  if (!apiKey && !chromaUrl) {
    console.error("Error: Set CHROMA_API_KEY (Chroma Cloud) or CHROMA_URL (local) in .env");
    process.exit(1);
  }
  if (apiKey) {
    console.log("Using Chroma Cloud...");
  } else {
    console.log("Using local Chroma at", chromaUrl);
  }

  console.log("Loading portfolio documents...");
  const docs = loadPortfolioDocuments();
  console.log(`Found ${docs.length} document(s)`);

  if (docs.length === 0) {
    console.log("No documents to index. Add .txt or .md files to data/portfolio-docs/");
    process.exit(0);
    return;
  }

  console.log("Indexing into Chroma...");
  await indexPortfolioDocuments(docs);
  console.log("Done!");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
