# How to Create or Extend a Fixture

Fixtures in this framework customize Playwright’s `test` object for auth and API access. UI specs normally stay on the default `@playwright/test` import.

## Existing fixtures

| Fixture        | Path                           | Provides                   | Used by                     |
| -------------- | ------------------------------ | -------------------------- | --------------------------- |
| `loginFixture` | `src/fixtures/loginFixture.ts` | `token: string`            | `tests/setup/auth.setup.ts` |
| `apiFixture`   | `src/fixtures/apiFixture.ts`   | `token`, `api: ApiManager` | `tests/api/**`              |

### loginFixture (current behavior)

```ts
export const test = base.extend<{ token: string }>({
  token: async ({}, use) => {
    const { token } = await apiLogin();
    await use(token);
  },
});
```

Setup imports it as:

```ts
import { test as setup } from "../../src/fixtures/loginFixture";

setup("authenticate B2B and save storage state", async ({ page, token }) => {
  // save token + storageState
});
```

B2B/B2X **UI specs do not import loginFixture**. They rely on project `storageState` created by setup.

### apiFixture (current behavior)

```ts
token: async ({}, use) => {
  await use(await getAuthToken());
},

api: async ({ token }, use) => {
  const client = await GraphQLClient.create(token);
  const api = new ApiManager(client);
  await use(api);
  await api.dispose();
},
```

## When to add a fixture

Add a fixture when many tests need the **same injected dependency** (token, API client, seeded data) with setup/teardown.

Do **not** add a fixture for:

- One-off navigation (use `*Flows.ts`)
- Page construction (use `PoManager`)
- A single test’s temporary helper

## How to extend an existing fixture

1. Open the fixture file under `src/fixtures/`.
2. Extend the fixture type.
3. Add a new `base.extend` field with `async ({ deps }, use) => { …; await use(value); }`.
4. Dispose resources after `use` when needed (see `api.dispose()`).
5. Update only the specs that should consume it.

Example shape for a new API domain (illustrative — register real services in `ApiManager` first):

```ts
api: async ({ token }, use) => {
  const client = await GraphQLClient.create(token);
  const api = new ApiManager(client); // ApiManager already exposes api.b2b
  await use(api);
  await api.dispose();
},
```

## Playwright empty destructuring

Playwright fixtures often use `async ({}, use)`. ESLint allows empty patterns under `src/fixtures/**` (`no-empty-pattern: off`). Keep that pattern rather than inventing unused parameter names.

## Rules for juniors

1. UI specs → `import { test, expect } from "@playwright/test"`
2. API specs → `import { test, expect } from ".../apiFixture"`
3. Setup only → `loginFixture`
4. Never put assertions inside fixture setup unless the fixture itself is a dedicated setup project test
5. Never commit tokens produced by fixtures (`playwright/.auth/` is gitignored)

## Checklist

- [ ] Fixture lives in `src/fixtures/`
- [ ] Types declared for provided values
- [ ] Resources disposed after `use`
- [ ] Only the right specs import the custom `test`
- [ ] Auth still goes through `authApi` / env credentials
