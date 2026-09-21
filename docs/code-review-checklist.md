# Code Review Checklist

Use this checklist for PRs on the Tagaddod Playwright framework. It is tailored to **this** architecture (PoManager, flow helpers, fixtures, projects).

## Architecture (must not break)

- [ ] Specs remain thin; no new competing pattern that bypasses PoManager
- [ ] Multi-step navigation lives in `tests/<product>/*Flows.ts` when reused
- [ ] New page objects are registered in `src/core/PoManager.ts`
- [ ] Specs do not `new SomePage(page)` directly
- [ ] API specs use `apiFixture` + `ApiManager` (not raw `fetch` / raw client in specs)
- [ ] Auth contract unchanged unless the PR is explicitly about auth:
  - B2B/B2X → setup + `storageState`
  - GreenPan → no admin storageState
  - API → `getAuthToken` / `apiFixture`

## Tests

- [ ] File is under the correct folder (`tests/b2b`, `tests/b2x`, `tests/greenpan`, `tests/api/...`)
- [ ] Product tag present (`@b2b` / `@b2x` / `@greenpan` / `@api`)
- [ ] Suite tags present (`@smoke` / `@regression` / `@e2e` as appropriate)
- [ ] CI-facing suite tags kept if workflows grep them (e.g. `@create business client`)
- [ ] No `test.only`
- [ ] `test.skip` only when conditional and documented
- [ ] Assertions are meaningful (page `assert*` and/or explicit `expect`)
- [ ] GreenPan new-user paths use a fresh phone when address step is required
- [ ] B2B/B2X `beforeEach` still guards against `/auth` when opening authenticated apps

## Page objects

- [ ] Locators prefer role/name, stable ids, or `tag-test-id`
- [ ] Method names follow `open` / `assert*` / `complete*Step` conventions
- [ ] No hardcoded secrets
- [ ] Timeouts are justified (not masking bad locators)
- [ ] Deprecated PoManager aliases added only when renaming getters

## API

- [ ] GraphQL documents live under `src/api/<domain>/graphql/`
- [ ] Service method added on the domain service (`B2bService`, etc.)
- [ ] Builders used for complex payloads (`testData.ts`)
- [ ] Response errors asserted
- [ ] No committed API response dumps from `test-results/`

## Data & config

- [ ] Shared constants updated in `testdata.json` / `testdata.ts` when needed
- [ ] Env-specific URLs stay in `environments.ts` / `urls.ts`
- [ ] No `.env`, tokens, or `playwright/.auth/*` in the PR
- [ ] `node_modules` not staged

## Quality

- [ ] `npm run validate` passes (or equivalent CI checks)
- [ ] Imports sorted; no unused vars
- [ ] Prefer `console.warn` / `console.error` over `console.log`
- [ ] Diff is focused; unrelated refactors called out in the PR description

## Reviewer notes (what to challenge)

1. “I duplicated a 20-line navigation block in three specs” → move to flow helper
2. “I instantiated the page class in the spec” → use PoManager
3. “I increased timeout to 5 minutes” → ask for root cause
4. “I skipped GreenPan setup differently from other products” → confirm intentional
5. “I changed ESLint/Husky in a feature PR” → split tooling unless required

## Author PR description template

```markdown
## Summary

- …

## Product

- [ ] B2B [ ] B2X [ ] GreenPan [ ] API [ ] Tooling

## Test plan

- [ ] `ENV=… npx playwright test --project=… --grep …`
- [ ] `npm run validate`
```
