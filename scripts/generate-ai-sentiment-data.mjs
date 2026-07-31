#!/usr/bin/env node
// Converts the raw AI Sentiment 2026 CSVs into JSON consumed by
// lib/data/aiSentiment2026.ts. Re-run after editing the CSVs in data/.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const dataDir = path.join(rootDir, "data");

function parseCsv(filePath) {
  const lines = readFileSync(filePath, "utf8").trim().split(/\r?\n/);
  const headers = lines[0].split(",").map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const cells = line.split(",").map((c) => c.trim());
    const row = {};
    headers.forEach((header, i) => {
      const raw = cells[i];
      const num = Number(raw);
      row[header] = raw !== "" && !Number.isNaN(num) ? num : raw;
    });
    return row;
  });
}

const countries = parseCsv(path.join(dataDir, "ai_sentiment_2026_countries.csv"));
const demographics = parseCsv(path.join(dataDir, "ai_sentiment_2026_topline_and_demographics.csv"));

writeFileSync(path.join(dataDir, "ai_sentiment_2026_countries.json"), JSON.stringify(countries, null, 2) + "\n");
writeFileSync(path.join(dataDir, "ai_sentiment_2026_demographics.json"), JSON.stringify(demographics, null, 2) + "\n");

console.log(`Wrote ${countries.length} countries and ${demographics.length} demographic rows.`);
