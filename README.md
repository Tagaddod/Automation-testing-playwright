# Automation-testing-playwright

Playwright + TypeScript E2E / API automation for Tagaddod products: **B2B**, **B2X**, **GreenPan**, and GraphQL **API**.

### API coverage (GraphQL)

| Area          | Notes                                           |
| ------------- | ----------------------------------------------- |
| Warehouse     | Trip load, scales, sample, quality, middle mile |
| B2B webform   | Business client / form GraphQL                  |
| B2X webform   | Trader webform GraphQL                          |
| B2C webform   | Household webform GraphQL                       |
| Sales App     | B2B and B2X sales flows                         |
| Collector App | Collector GraphQL                               |

## Quick start

```bash
npm install
npx playwright install
```

Create `.env.dev` / `.env.staging` / `.env.uat` (gitignored) with at least:

```bash
ENV=dev
ADMIN_EMAIL=...
ADMIN_PASSWORD=...
```

Run examples:

```bash
ENV=staging npx playwright test --project=b2b
ENV=dev npx playwright test --project=greenpan --grep @smoke
ENV=staging npx playwright test --project=api --grep "@create business client"
ENV=staging npx playwright test --project=api tests/api/Warehouse --workers=1
```

## Documentation

| Doc                                                              | Purpose                              |
| ---------------------------------------------------------------- | ------------------------------------ |
| [CONTRIBUTING.md](CONTRIBUTING.md)                               | How to contribute safely as a team   |
| [docs/framework-architecture.md](docs/framework-architecture.md) | How the framework is structured      |
| [docs/create-test.md](docs/create-test.md)                       | Add a UI test                        |
| [docs/create-page.md](docs/create-page.md)                       | Add a page object + PoManager getter |
| [docs/create-api.md](docs/create-api.md)                         | Add a GraphQL API test               |
| [docs/create-fixture.md](docs/create-fixture.md)                 | Extend login/API fixtures            |
| [docs/debugging.md](docs/debugging.md)                           | Debug failures and flakes            |
| [docs/code-review-checklist.md](docs/code-review-checklist.md)   | PR review checklist                  |

## Tooling

| Script              | Purpose                         |
| ------------------- | ------------------------------- |
| `npm run lint`      | ESLint                          |
| `npm run lint:fix`  | Auto-fix lint issues            |
| `npm run format`    | Prettier write                  |
| `npm run typecheck` | `tsc --noEmit`                  |
| `npm run validate`  | typecheck + lint + format check |

Pre-commit (Husky) runs **lint-staged** on staged files only. Playwright tests are **not** run on commit.

Node **20+** required (see `.nvmrc`).
