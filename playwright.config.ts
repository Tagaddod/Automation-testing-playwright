import { defineConfig } from "@playwright/test";
import dotenv from "dotenv";

const env = process.env.ENV || "staging";
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

  reporter: [
    ["list"],
    ["html", { open: "never", outputFolder: "playwright-report" }],
  ],

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
    },
    {
      name: "b2x",
      dependencies: ["setup"],
      testMatch: "b2x/**/*.spec.ts",
      fullyParallel: false,
      timeout: 180_000,
      use: {
        storageState: "playwright/.auth/user.json",
      },
    },
  ],
});
