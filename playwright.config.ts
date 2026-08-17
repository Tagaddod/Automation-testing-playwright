import { defineConfig } from "@playwright/test";
import dotenv from "dotenv";

// Pin ENV so workers and src/config/env.ts use the same target (Sales Egypt JWT is env-specific).
const env = process.env.ENV || "staging";
process.env.ENV = env;
dotenv.config({ path: `.env.${env}` });
dotenv.config();

export default defineConfig({
  testDir: "./tests",
  timeout: 60_000,

  use: {
    baseURL: process.env.BASE_URL,
    headless: true,
    viewport: { width: 1280, height: 720 },
    actionTimeout: 15_000,
    ignoreHTTPSErrors: true,
    screenshot: "only-on-failure",
  },

  reporter: [["list"], ["html", { open: "never", outputFolder: "playwright-report" }]],

  projects: [
    {
      name: "setup",
      testMatch: /.*\.setup\.ts/,
      timeout: 120_000,
    },
    {
      name: "b2b",
      dependencies: ["setup"],
      testMatch: "b2b/**/*.spec.ts",
      fullyParallel: false,
      timeout: 180_000,
      use: {
        storageState: "playwright/.auth/user.json",
      },
    },
    {
      name: "b2c",
      testMatch: "b2c/**/*.spec.ts",
    },
    {
      name: "greenpan",
      testMatch: "greenpan/**/*.spec.ts",
      fullyParallel: false,
      retries: 2,
      timeout: 180_000,
    },
    {
      name: "b2x",
      dependencies: ["setup"],
      // Anchor at tests/b2x only — a string glob becomes **/b2x/** and would also match api/sales/b2x.
      testMatch: /^b2x\/.*\.spec\.ts$/,
      fullyParallel: false,
      timeout: 180_000,
      use: {
        storageState: "playwright/.auth/user.json",
      },
    },
    // Ordered B2X API: SuperApp saves traderId, then Request reuses it.
    {
      name: "api-b2x",
      testMatch: "api/sales/b2x/createTraderSuperApp.spec.ts",
      fullyParallel: false,
    },
    {
      name: "api-b2x-request",
      // Ordered after SuperApp so traderId.json exists; Sales suite stays self-contained.
      dependencies: ["api-b2x"],
      testMatch: "api/sales/b2x/createTraderRequestSalesAgent.spec.ts",
      fullyParallel: false,
    },
    // Ordered Sales B2B API: createBranch → signContract → createBusinessRequest.
    {
      name: "api-sales-branch",
      testMatch: "api/sales/b2b/createBranch.spec.ts",
      fullyParallel: false,
    },
    {
      name: "api-sales-sign-contract",
      // Backend requires a signed contract before createBusinessRequestSuperApp.
      dependencies: ["api-sales-branch"],
      testMatch: "api/sales/b2b/signContractSuperApp.spec.ts",
      fullyParallel: false,
    },
    {
      name: "api-sales-business-request",
      dependencies: ["api-sales-sign-contract"],
      testMatch: "api/sales/b2b/createBusinessRequestSuperApp.spec.ts",
      fullyParallel: false,
    },
    {
      // Sales (non-b2x/non-b2b-flow) + other API specs.
      name: "api-other",
      dependencies: ["api-sales-business-request"],
      testMatch: /api\/(?!sales\/b2x\/|sales\/b2b\/).*\.spec\.ts$/,
      fullyParallel: false,
    },
    {
      // `--project=api` runs dependencies in order (B2X → Sales B2B flow → other API).
      name: "api",
      dependencies: [
        "api-b2x",
        "api-b2x-request",
        "api-sales-branch",
        "api-sales-sign-contract",
        "api-sales-business-request",
        "api-other",
      ],
      testMatch: /a^/,
    },
  ],
});
