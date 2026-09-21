# Contributing Guide

This repository is the **Tagaddod frontend Playwright + TypeScript** automation framework (B2B, B2X, GreenPan, API).

**API** GraphQL areas (folder / suite names):

- Warehouse
- B2B webform
- B2X webform
- B2C webform
- Sales App (B2B, B2X)
- Collector App

It is maintained by multiple QA Automation Engineers and Junior QAs. Follow these rules so changes stay consistent and reviewable.

## Prerequisites

- Node.js **20+** (see `.nvmrc`)
- Access to the target environment credentials (`ADMIN_EMAIL`, `ADMIN_PASSWORD`)
- Playwright browsers installed locally

```bash
npm install
npx playwright install
```

Create local env files (gitignored):

- `.env.dev`
- `.env.staging`
- `.env.uat`

Minimum keys:

```bash
ENV=dev
ADMIN_EMAIL=...
ADMIN_PASSWORD=...
```

Always pass `ENV` explicitly when running tests (config defaults can differ from `src/config/env.ts`):

```bash
ENV=dev npx playwright test --project=greenpan
ENV=staging npx playwright test --project=b2b
```

## Branching

1. Branch from an up-to-date `main` (or the agreed base branch).
2. Use a clear branch name, for example:

- `greenpan/...`
- `b2b/...`
- `api/warehouse/...`
- `api/b2b-webform/...`
- `api/sales-app/...`
- `api/collector-app/...`
- `chore/...`

3. Keep PRs focused (one product area or one tooling change when possible).

## Before you push

Run:

```bash
npm run validate
```

This runs:

1. `tsc --noEmit` (typecheck)
2. ESLint
3. Prettier check

Pre-commit (Husky) runs **lint-staged only** on staged files:

- ESLint `--fix` + Prettier for `ts/js`
- Prettier for `json/md/yml`

**Playwright tests are not run on commit.** Run the relevant project locally before opening a PR.

## How to add work (start here)

| Task                 | Doc                                                              |
| -------------------- | ---------------------------------------------------------------- |
| Understand structure | [docs/framework-architecture.md](docs/framework-architecture.md) |
| Add a UI test        | [docs/create-test.md](docs/create-test.md)                       |
| Add a page object    | [docs/create-page.md](docs/create-page.md)                       |
| Add an API test      | [docs/create-api.md](docs/create-api.md)                         |
| Add/extend a fixture | [docs/create-fixture.md](docs/create-fixture.md)                 |
| Debug failures       | [docs/debugging.md](docs/debugging.md)                           |
| Review a PR          | [docs/code-review-checklist.md](docs/code-review-checklist.md)   |

## Non-negotiable conventions

1. **Do not change the framework architecture** in a feature PR (PoManager + page objects + flow helpers + fixtures). Propose architecture changes separately.
2. Specs stay thin. Multi-step navigation belongs in `*Flows.ts` helpers.
3. Specs get pages only through `**PoManager` getters** — do not `new SomePage(page)` in specs.
4. New page objects must be registered in `src/core/PoManager.ts`.
5. Tag tests so CI `--grep` works (`@b2b`, `@b2x`, `@greenpan`, `@api`, `@warehouse`, `@sales-app`, `@collector-app`, plus `@smoke` / `@regression` / `@e2e`).
6. Never commit secrets, `.env`*, or `playwright/.auth/*`.
7. Never leave `test.only` / `test.skip` without a clear reason (`.only` is an ESLint error).
8. Prefer Arabic-accessible locators already used in the product (`getByRole`, stable ids) over brittle CSS.
9. Warehouse API runs should use `--workers=1` (shared admin JWT / single session).

## Remotes

This repo often has:

- `origin` → Tagaddod org repo

Push to the remote your team uses for PRs:

```bash
git push -u origin <branch>   # org
# or
git push -u fork <branch>     # personal fork
```

## Questions

If unsure where code belongs (page vs flow vs fixture), ask in review **before** inventing a new pattern. Match the closest existing product folder (`b2b`, `b2x`, `greenpan`, `api/warehouse`, `api/b2b`, `api/sales`, …).
