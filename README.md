# frontend-testing-playwright

Frontend Testing with Playwright
This repository contains the end-to-end (E2E) automation testing framework for the B2C React Webform using Playwright with TypeScript.

📌 Project Scope
The initial scope of this project is to cover:

Automation of critical user flows for the B2C React Webform

Regression testing to ensure app stability

Scalable test structure for future test cases and other web platforms

🧰 Tech Stack
Playwright – Browser automation framework

TypeScript – Type-safe JavaScript for scalable development

Node.js – Runtime environment (20.19+)

ESLint (flat config) + Prettier – linting and formatting

Husky + lint-staged – pre-commit checks on staged files only

Allure / HTML Reports – For test result visualization (optional based on integration)

## Tooling (multi-developer)

```bash
npm install
npx playwright install
```

Useful scripts:

| Script              | Purpose                         |
| ------------------- | ------------------------------- |
| `npm run lint`      | ESLint across the repo          |
| `npm run lint:fix`  | Auto-fix lint issues            |
| `npm run format`    | Format with Prettier            |
| `npm run typecheck` | TypeScript `tsc --noEmit`       |
| `npm run validate`  | typecheck + lint + format check |

Pre-commit (Husky) runs **lint-staged** only — staged `ts/js` files are ESLint-fixed and Prettier-formatted. Playwright tests are **not** run on commit.
