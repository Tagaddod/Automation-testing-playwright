import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

/**
 * Shared API IDs (traderId, branchId, …) live under playwright/ — not under
 * Playwright's outputDir (`test-results`) — so they survive per-test cleanup
 * and work when the Sales suite runs on its own.
 */
export const API_RESPONSES_DIR = join("playwright", "api-responses");

/** Absolute-from-cwd path for a saved API response JSON. */
export function getApiResponsePath(name: string): string {
  return join(API_RESPONSES_DIR, `${name}.json`);
}

export const BRANCH_ID_PATH = getApiResponsePath("branchId");
export const TRADER_ID_PATH = getApiResponsePath("traderId");

/** Save an API response JSON under playwright/api-responses/<name>.json */
export function saveApiResponse(name: string, payload: unknown): string {
  const filePath = getApiResponsePath(name);
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, JSON.stringify(payload, null, 2), "utf-8");
  return filePath;
}

/** Read a previously saved API response so later endpoints/tests can reuse it. */
export function readApiResponse<T = unknown>(name: string): T | undefined {
  const filePath = join(RESPONSES_DIR, `${name}.json`);
  if (!existsSync(filePath)) return undefined;
  try {
    return JSON.parse(readFileSync(filePath, "utf-8")) as T;
  } catch {
    return undefined;
  }
}
