/**
 * Load portfolio documents from /data/portfolio-docs
 * Used for initial indexing
 */

import fs from "fs";
import path from "path";

const PORTFOLIO_DIR = path.join(process.cwd(), "data", "portfolio-docs");

export function loadPortfolioDocuments(): { id: string; text: string }[] {
  if (!fs.existsSync(PORTFOLIO_DIR)) {
    return [];
  }

  const files = fs.readdirSync(PORTFOLIO_DIR);
  const documents: { id: string; text: string }[] = [];

  for (const file of files) {
    if (!file.endsWith(".txt") && !file.endsWith(".md")) continue;

    const filePath = path.join(PORTFOLIO_DIR, file);
    const stat = fs.statSync(filePath);
    if (!stat.isFile()) continue;

    const text = fs.readFileSync(filePath, "utf-8");
    const id = path.basename(file, path.extname(file));
    documents.push({ id, text });
  }

  return documents;
}
