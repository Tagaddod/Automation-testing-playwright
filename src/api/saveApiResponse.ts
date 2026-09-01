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
  const filePath = getApiResponsePath(name);
  if (!existsSync(filePath)) return undefined;
  try {
    return JSON.parse(readFileSync(filePath, "utf-8")) as T;
  } catch {
    return undefined;
  }
}

export type SavedBranchIdPayload = {
  branchId?: string;
  phone?: string;
};

export type SavedTraderIdPayload = {
  traderId?: string;
  phone?: string;
};

/** Read branchId.json saved by createBranch. */
export function readSavedBranchPayload(): SavedBranchIdPayload {
  if (!existsSync(BRANCH_ID_PATH)) {
    throw new Error("branchId.json should exist from the valid createBranch test.");
  }
  return JSON.parse(readFileSync(BRANCH_ID_PATH, "utf-8")) as SavedBranchIdPayload;
}

/** Require a non-empty Branch ID from branchId.json. */
export function requireSavedBranchId(): string {
  const saved = readSavedBranchPayload();
  if (!saved.branchId) {
    throw new Error("A saved Branch ID is required.");
  }
  return saved.branchId;
}

/** Require branchId + phone from branchId.json (duplicate-phone scenarios). */
export function requireSavedBranchWithPhone(): { branchId: string; phone: string } {
  const saved = readSavedBranchPayload();
  if (!saved.branchId) {
    throw new Error("A saved Branch ID is required.");
  }
  if (!saved.phone) {
    throw new Error("A saved branch phone is required.");
  }
  return { branchId: saved.branchId, phone: saved.phone };
}

/** Read traderId.json saved by createTraderSuperApp. */
export function readSavedTraderPayload(): SavedTraderIdPayload {
  if (!existsSync(TRADER_ID_PATH)) {
    throw new Error("traderId.json should exist from the valid createTraderSuperApp test.");
  }
  return JSON.parse(readFileSync(TRADER_ID_PATH, "utf-8")) as SavedTraderIdPayload;
}

/** Require a non-empty Trader ID from traderId.json. */
export function requireSavedTraderId(): string {
  const saved = readSavedTraderPayload();
  if (!saved.traderId) {
    throw new Error("A saved Trader ID is required.");
  }
  return saved.traderId;
}

/** Require traderId + phone from traderId.json (duplicate-phone scenarios). */
export function requireSavedTraderWithPhone(): { traderId: string; phone: string } {
  const saved = readSavedTraderPayload();
  if (!saved.traderId) {
    throw new Error("A saved Trader ID is required.");
  }
  if (!saved.phone) {
    throw new Error("A saved trader phone is required.");
  }
  return { traderId: saved.traderId, phone: saved.phone };
}
