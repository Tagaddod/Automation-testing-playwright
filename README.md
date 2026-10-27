# Automation-testing-playwright

Playwright + TypeScript E2E / API automation for Tagaddod products: **B2B**, **B2X**, **B2C**, **GreenPan**, and GraphQL / REST **API** tests.

## Test inventory

Counts from `npx playwright test --list` (all Playwright projects):

| Area             |   Tests | Spec files | Location                              |
| ---------------- | ------: | ---------: | ------------------------------------- |
| **UI total**     | **112** |     **18** | `tests/b2b`, `b2x`, `b2c`, `greenpan` |
| B2B UI           |      34 |          6 | `tests/b2b/`                          |
| B2X UI           |      44 |          5 | `tests/b2x/`                          |
| GreenPan UI      |      32 |          5 | `tests/greenpan/`                     |
| B2C UI           |       1 |          1 | `tests/b2c/`                          |
| **API total**    |  **74** |     **12** | `tests/api/`                          |
| Auth setup       |       1 |          1 | `tests/setup/auth.setup.ts`           |
| **All projects** | **186** |     **30** |                                       |

The API folder defines **~71** distinct `test()` cases; Playwright lists **74** because some specs (for example `createTrips.spec.ts`) are registered under more than one project.

### API coverage

| Area          | Notes                                                                |
| ------------- | -------------------------------------------------------------------- |
| Warehouse     | Trip load, scales, sample, quality, middle mile                      |
| B2B webform   | Business client, branch, request GraphQL                             |
| B2X webform   | Trader webform GraphQL                                               |
| B2C           | Customer app GraphQL                                                 |
| Sales App     | B2B / B2X create branch, contract, trader, requests (EG, SA, JO, AT) |
| Collector GAP | Create request → REST create-trips → collect → end trip              |
| Trips         | REST `create-trips` chained after Sales request specs                |

## Quick start

```bash
npm install
npx playwright install
```

Copy [`.env.example`](.env.example) to `.env.dev` / `.env.staging` / `.env.uat` (gitignored). Minimum for UI:

```bash
ENV=staging
ADMIN_EMAIL=...
ADMIN_PASSWORD=...
```

Collector / trip flows also need `SIBLING_SERVER_API_KEY` and `TRIPS_COLLECTOR_ID` (see `.env.example` and [docs/create-api.md](docs/create-api.md)).

Run examples:

```bash
ENV=staging npx playwright test --project=b2b
ENV=dev npx playwright test --project=greenpan --grep @smoke
ENV=staging npx playwright test --project=api-other --grep "@webform-API-regression"
ENV=staging npx playwright test --project=api-warehouse --workers=1
ENV=staging npx playwright test --project=collector --workers=1
ENV=staging npx playwright test --project=api
```

The meta-project `api` runs all API sub-projects in dependency order (Sales → warehouse → collector, etc.).

## Documentation

| Doc                                                              | Purpose                              |
| ---------------------------------------------------------------- | ------------------------------------ |
| [CONTRIBUTING.md](CONTRIBUTING.md)                               | How to contribute safely as a team   |
| [docs/framework-architecture.md](docs/framework-architecture.md) | Projects, auth, layout               |
| [docs/create-test.md](docs/create-test.md)                       | Add a UI test                        |
| [docs/create-page.md](docs/create-page.md)                       | Add a page object + PoManager getter |
| [docs/create-api.md](docs/create-api.md)                         | Add a GraphQL / REST API test        |
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
