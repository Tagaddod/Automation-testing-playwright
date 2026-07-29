# Framework Architecture

This document describes the **current** Playwright TypeScript framework used at Tagaddod. It is not a generic Playwright tutorial.

## Goals

- One shared framework for **B2B**, **B2X (trader)**, **GreenPan**, and **GraphQL API** tests
- Stable page objects behind a single entry point (`PoManager`)
- Thin specs + reusable flow helpers
- Environment-driven URLs and credentials (`ENV=dev|staging|uat`)
- Safe multi-engineer contribution (lint/format/typecheck on commit)

## High-level layout

```text
Tagaddod/
├── playwright.config.ts      # Projects, timeouts, env bootstrap
├── src/
│   ├── core/PoManager.ts     # Lazy page-object factory
│   ├── pages/
│   │   ├── b2b/
│   │   ├── B2X/
│   │   ├── greenpan/
│   │   └── shared/
│   ├── api/                  # GraphQL client + domain services
│   ├── config/               # env, environments, urls
│   ├── fixtures/             # loginFixture, apiFixture
│   └── utils/                # authApi, testdata, helpers
├── tests/
│   ├── setup/auth.setup.ts   # JWT + storageState for B2B/B2X
│   ├── b2b/                  # specs + b2bFlows.ts
│   ├── b2x/                  # specs + b2xFlows.ts
│   ├── greenpan/             # specs + greenpanFlows.ts
│   ├── b2c/                  # minimal stub
│   └── api/                  # GraphQL specs
└── playwright/.auth/         # generated user.json / token.json (gitignored)
```

## Playwright projects

Configured in `playwright.config.ts`:

| Project    | Matches                       | Auth                                       | Notes                                         |
| ---------- | ----------------------------- | ------------------------------------------ | --------------------------------------------- |
| `setup`    | `*.setup.ts`                  | Creates auth                               | Timeout 120s                                  |
| `b2b`      | `tests/b2b/**/*.spec.ts`      | `storageState: playwright/.auth/user.json` | Depends on `setup`; serial; 180s              |
| `b2x`      | `tests/b2x/**/*.spec.ts`      | Same storageState                          | Depends on `setup`; serial; 180s              |
| `greenpan` | `tests/greenpan/**/*.spec.ts` | **No** storageState                        | Public phone flow; `retries: 2`; serial; 180s |
| `b2c`      | `tests/b2c/**/*.spec.ts`      | None                                       | Stub / early coverage                         |
| `api`      | `tests/api/**/*.spec.ts`      | JWT via `getAuthToken()`                   | Uses `apiFixture`                             |

Env bootstrap in config:

```ts
const env = process.env.ENV || "staging";
dotenv.config({ path: `.env.${env}` });
dotenv.config();
```

> Prefer always setting `ENV=...` on the command line. `src/config/env.ts` defaults to `dev` if unset — do not rely on mixed defaults.

## Layered design (do not flatten)

```text
Spec (.spec.ts)
  → Flow helper (*Flows.ts)     // multi-step navigation
    → PoManager getter          // page access
      → Page object             // locators + actions + asserts
        → Playwright Page

API Spec
  → apiFixture { api, token }
    → ApiManager
      → Domain service (e.g. B2bService)
        → GraphQLClient
```

### Why this split

| Layer       | Owns                                                                    | Must not own                               |
| ----------- | ----------------------------------------------------------------------- | ------------------------------------------ |
| Spec        | Scenario, tags, data choice, final expectations that belong to the case | Long locator chains, multi-step navigation |
| Flow helper | “Go to step X”, “complete happy path Y”                                 | Product assertions unrelated to navigation |
| Page object | Locators, single-page actions, `assert*`, `complete*Step`               | Cross-page orchestration (prefer flows)    |
| PoManager   | Construction + caching of page objects                                  | Test logic                                 |
| Fixture     | Auth token / API client lifecycle                                       | UI assertions                              |

## Auth model

### B2B / B2X (admin session)

1. Project `setup` runs `tests/setup/auth.setup.ts`
2. `loginFixture` provides `token` from GraphQL `apiLogin()` (`ADMIN_EMAIL` / `ADMIN_PASSWORD`)
3. Token saved to `playwright/.auth/token.json`
4. Browser opens `${URLs.b2b.auth}${token}` and waits until URL leaves `/auth?token=`
5. `storageState` saved to `playwright/.auth/user.json`
6. `b2b` / `b2x` projects load that storage state

Specs still open the product home via flows and typically assert:

```ts
await expect(page).not.toHaveURL(/\/auth/);
```

### GreenPan (no admin storageState)

- GreenPan project does **not** depend on `setup`
- Users enter a phone number on the public GreenPan site
- Existing vs new user paths are controlled by phone data (`testdata.json` / `randomPhoneNumber()`)

### API

- Specs import `src/fixtures/apiFixture`
- Default `token` / `api` use admin EMAIL via `getAuthToken("admin")` (reuse `token.json` if present)
- Sales App / Collector App API roles use phone + password + country code:
  - `salesAppEgyptApi`, `salesAppSaudiApi`, `collectorAppApi`
  - or `apiLogin("sales-app-egypt" | "sales-app-saudi" | "collector-app")`
- B2B/B2X **UI** setup stays on admin EMAIL only (not phone roles)

## Configuration map

| File                         | Role                                                                                  |
| ---------------------------- | ------------------------------------------------------------------------------------- |
| `src/config/environments.ts` | Per-env GraphQL + GreenPan + B2B + B2X base URLs                                      |
| `src/config/urls.ts`         | Convenience `URLs.*` builders (including auth URLs)                                   |
| `src/config/env.ts`          | Loads `.env.${ENV}` and exports `ENV.ADMIN_*` + Sales/Collector phone app credentials |
| `src/utils/testdata.json`    | Shared phones, quantities, addresses, B2B/B2X fixtures                                |
| `src/utils/testdata.ts`      | Generators (`randomPhoneNumber`, `getB2bTestData`, …)                                 |

## Quality gates

| Mechanism           | When       | What                                        |
| ------------------- | ---------- | ------------------------------------------- |
| Husky + lint-staged | Pre-commit | ESLint fix + Prettier on staged files       |
| `npm run validate`  | Before PR  | typecheck + lint + format check             |
| Playwright projects | Local / CI | Product suites via `--project` and `--grep` |

## What “do not change architecture” means

Allowed in normal PRs:

- New page object methods / locators
- New flow helpers
- New specs and tags
- New API service methods + GraphQL documents
- Test data updates

Treat as architecture PRs (discuss first):

- Replacing PoManager
- Merging all products into one page folder without review
- Changing auth/setup contract for B2B/B2X
- Introducing a second competing fixture pattern for UI tests
