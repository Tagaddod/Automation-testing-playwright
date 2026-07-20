import eslint from "@eslint/js";
import { defineConfig } from "eslint/config";
import eslintConfigPrettier from "eslint-config-prettier";
import playwright from "eslint-plugin-playwright";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import tseslint from "typescript-eslint";

/**
 * Flat ESLint config for the Playwright + TypeScript framework.
 * Compatible with ESLint 10 and typescript-eslint v8.
 */
export default defineConfig(
  {
    ignores: [
      "**/node_modules/**",
      "**/playwright-report/**",
      "**/test-results/**",
      "**/allure-results/**",
      "**/playwright/.auth/**",
      "**/.playwright-cli/**",
      "**/dist/**",
      "**/coverage/**",
      "package-lock.json",
    ],
  },

  eslint.configs.recommended,
  ...tseslint.configs.recommended,

  {
    files: ["**/*.{ts,js,mjs,cjs}"],
    plugins: {
      "simple-import-sort": simpleImportSort,
    },
    rules: {
      eqeqeq: ["error", "smart"],
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          prefer: "type-imports",
          fixStyle: "separate-type-imports",
          disallowTypeAnnotations: false,
        },
      ],
      // Soften for gradual adoption across an existing suite.
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },

  // Type-aware rules for TypeScript sources/tests only (not config .mjs files).
  {
    files: ["**/*.ts"],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-misused-promises": [
        "error",
        { checksVoidReturn: { arguments: false } },
      ],
      "@typescript-eslint/await-thenable": "error",
    },
  },

  {
    files: ["src/fixtures/**/*.{ts,js}"],
    rules: {
      // Playwright fixture factories commonly use `async ({}, use) => ...`
      "no-empty-pattern": "off",
    },
  },

  {
    files: ["tests/**/*.{ts,js}", "**/*.spec.ts"],
    ...playwright.configs["flat/recommended"],
    rules: {
      ...playwright.configs["flat/recommended"].rules,
      // Existing suite uses short waits / networkidle for flaky environments.
      "playwright/no-wait-for-timeout": "warn",
      "playwright/no-networkidle": "warn",
      "playwright/no-skipped-test": "warn",
      "playwright/no-focused-test": "error",
      // Page-object helpers hold the expects; rule can't see method calls reliably.
      "playwright/expect-expect": "off",
    },
  },

  // Must be last so Prettier wins over conflicting stylistic ESLint rules.
  eslintConfigPrettier,
);
