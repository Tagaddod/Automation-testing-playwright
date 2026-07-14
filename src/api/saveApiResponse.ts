import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const RESPONSES_DIR = join("test-results", "api", "responses");

/** Save an API response JSON under test-results/api/responses/<name>.json */
export function saveApiResponse(name: string, payload: unknown): string {
  const filePath = join(RESPONSES_DIR, `${name}.json`);
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, JSON.stringify(payload, null, 2), "utf-8");
  return filePath;
}
