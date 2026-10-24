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
      testMatch: /\/tests\/b2b\/.*\.spec\.ts$/,
      fullyParallel: false,
      timeout: 180_000,
      use: {
        storageState: "playwright/.auth/user.json",
      },
    },
    {
      name: "b2c",
      testMatch: /\/tests\/b2c\/.*\.spec\.ts$/,
    },
    {
      name: "greenpan",
      testMatch: /\/tests\/greenpan\/.*\.spec\.ts$/,
      fullyParallel: false,
      retries: 2,
      timeout: 180_000,
    },
    {
      name: "b2x",
      dependencies: ["setup"],
      testMatch: /\/tests\/b2x\/.*\.spec\.ts$/,
      fullyParallel: false,
      timeout: 180_000,
      use: {
        storageState: "playwright/.auth/user.json",
      },
    },
    // Sales API projects are dependency-free: every spec builds its own trader /
    // branch / contract. Adding `dependencies` here would make Playwright run those
    // projects in full on any `--grep`, because filters never apply to dependencies.
    {
      name: "api-b2x",
      testMatch: "api/sales/b2x/createTraderSuperApp.spec.ts",
      fullyParallel: false,
    },
    {
      name: "api-b2x-request",
      testMatch: "api/sales/b2x/createTraderRequestSalesAgent.spec.ts",
      fullyParallel: false,
    },
    {
      name: "api-sales-branch",
      testMatch: "api/sales/b2b/createBranch.spec.ts",
      fullyParallel: false,
    },
    {
      name: "api-sales-sign-contract",
      testMatch: "api/sales/b2b/signContractSuperApp.spec.ts",
      fullyParallel: false,
    },
    {
      name: "api-sales-business-request",
      testMatch: "api/sales/b2b/createBusinessRequestSuperApp.spec.ts",
      fullyParallel: false,
    },
    {
      name: "api-warehouse",
      testMatch: /api\/warehouse\/.*\.spec\.ts$/,
      fullyParallel: false,
    },
    {
      name: "api-other",
      testMatch: /api\/(?!sales\/b2x\/|sales\/b2b\/|warehouse\/|collector\/|trips\/).*\.spec\.ts$/,
      fullyParallel: false,
    },
    {
      name: "collector-trip",
      testMatch: "api/trips/createTrips.spec.ts",
      fullyParallel: false,
      timeout: 180_000,
    },
    {
      name: "collector",
      testMatch: "api/collector/collectRequest.spec.ts",
      fullyParallel: false,
      timeout: 180_000,
    },
    {
      name: "trips",
      dependencies: ["api-b2x-request", "api-sales-business-request"],
      testMatch: "trips/**/*.spec.ts",
      fullyParallel: false,
    },
    {
      name: "api",
      dependencies: [
        "api-b2x",
        "api-b2x-request",
        "api-sales-branch",
        "api-sales-sign-contract",
        "api-sales-business-request",
        "api-warehouse",
        "api-other",
        "collector-trip",
        "collector",
        "trips",
      ],
      testMatch: /a^/,
    },
  ],
});
