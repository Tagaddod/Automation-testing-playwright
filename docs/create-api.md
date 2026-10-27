# How to Create an API Test

API automation in this repo is GraphQL-based and mirrors the UI layering:

- `PoManager` → page objects
- `ApiManager` → domain services (`api.b2b`)

## 1. Where things live

Every domain module uses the same layout:

```
src/api/{domain}/
  {Domain}Service.ts      # GraphQL methods + domain types
  testData.ts             # payload builders
  graphql/
    mutations.ts
    queries.ts

tests/api/{domain}/
  *.spec.ts
  helpers.ts              # optional shared setup
```

| Piece                | Path                                                                                                            |
| -------------------- | --------------------------------------------------------------------------------------------------------------- |
| Fixture              | `src/fixtures/apiFixture.ts`                                                                                    |
| Facade               | `src/api/ApiManager.ts` → `api.b2b` / `api.b2x` / `api.sales` / `api.warehouse` / `api.collector`               |
| REST trips           | `src/api/trips/TripService.ts` + `src/api/RestClient.ts` (`tripsApi` fixture)                                   |
| Shared enums         | `src/api/enums.ts`                                                                                              |
| Response dump helper | `src/api/saveApiResponse.ts`                                                                                    |
| Domains              | `b2b`, `b2x`, `b2c`, `sales`, `warehouse`, `collector`, `trips`                                                 |
| Specs                | `tests/api/{domain}/*.spec.ts`                                                                                  |
| Sales domain split   | `tests/api/sales/b2b/`, `tests/api/sales/b2x/` (Sales App flows)                                                |
| Playwright projects  | `api-other`, `api-warehouse`, `api-b2x*`, `api-sales-*`, `collector`, `collector-trip`, or meta `--project=api` |

## 2. Auth for API tests

`apiFixture` provides:

```ts
token / api                 → admin EMAIL (token.json or fresh apiLogin("admin"))
customerAppApi              → B2C Customer App phone login
salesAppEgyptApi            → Sales App Egypt (worker-scoped token)
salesAppSaudiApi            → Sales App Saudi
salesAppJordanApi           → Sales App Jordan
salesAppViennaApi           → Sales App Vienna / AT
collectorAppApi             → Collector App phone login (loginGap)
tripsApi                    → REST create-trips (sibling-server-api-key header)
```

The `api` project does **not** declare `dependencies: ["setup"]`. Still, running UI setup first (or having a valid `playwright/.auth/token.json`) avoids an extra admin login.

### Credentials (env)

| Profile            | Env vars                                                                   | Login type                            |
| ------------------ | -------------------------------------------------------------------------- | ------------------------------------- |
| `admin` (default)  | `ADMIN_EMAIL`, `ADMIN_PASSWORD`                                            | EMAIL — also used by B2B/B2X UI setup |
| `sales-app-egypt`  | `SALES_APP_EG_PHONE`, `SALES_APP_EG_PASSWORD`, `SALES_APP_EG_COUNTRY_CODE` | PHONE                                 |
| `sales-app-saudi`  | `SALES_APP_SA_PHONE`, `SALES_APP_SA_PASSWORD`, `SALES_APP_SA_COUNTRY_CODE` | PHONE                                 |
| `sales-app-jordan` | `SALES_APP_JORDAN_PHONE`, `SALES_APP_JORDAN_PASSWORD`                      | PHONE + `country_code: JO`            |
| `sales-app-vienna` | `SALES_APP_VIENNA_PHONE`, `SALES_APP_VIENNA_PASSWORD`                      | PHONE + `country_code: AT`            |
| `collector-app`    | `COLLECTOR_APP_PHONE`, `COLLECTOR_APP_PASSWORD`                            | PHONE (`loginGap`)                    |

REST create-trips (not a login profile):

| Variable                 | Purpose                                                                                                                                                             |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `SIBLING_SERVER_API_KEY` | Required for `tripsApi.createTrips`                                                                                                                                 |
| `TRIPS_API_URL`          | Optional override; default from `src/config/environments.ts`                                                                                                        |
| `TRIPS_COLLECTOR_ID`     | `collectors.id` on the trip (default **916**). Must match the collector that will run `getCollectorActiveTrip` — query `myCollector { id }` with the collector JWT. |

```ts
import { apiLogin } from "../../../src/utils/authApi";
import { GraphQLClient } from "../../../src/api/GraphQLClient";

const { token } = await apiLogin("sales-app-egypt");
const client = await GraphQLClient.create(token);
```

Or via fixtures:

```ts
test("sales egypt api", async ({ salesAppEgyptApi }) => {
  /* ... */
});
test("collector api", async ({ collectorAppApi }) => {
  /* ... */
});
test("create trips rest", async ({ tripsApi }) => {
  const response = await tripsApi.createTrips(payload);
  expect(response.ok).toBeTruthy();
});
```

End-to-end collector GAP example: `tests/api/collector/collectRequest.spec.ts` (`--project=collector`).

UI B2B/B2X setup still uses **admin EMAIL only** (`auth.setup.ts` → `/auth?token=` → `user.json`).

## 3. Spec template (from current suite)

```ts
import { buildBusinessClientData } from "../../../src/api/b2b/testData";
import { saveApiResponse } from "../../../src/api/saveApiResponse";
import { expect, test } from "../../../src/fixtures/apiFixture";

test.describe("B2B GraphQL API", { tag: ["@api", "@b2b", "@create business client"] }, () => {
  test("create business client", async ({ api }) => {
    const brands = await api.b2b.getBrandTypes();
    expect(brands.errors).toBeUndefined();

    const brandTypeId = brands.data?.getBrandTypesB2bForm?.[0]?.id;
    expect(brandTypeId, "No brand types returned").toBeTruthy();

    const data = buildBusinessClientData({ brand_type_id: brandTypeId! });
    const response = await api.b2b.createBusinessClient(data);

    expect(response.errors).toBeUndefined();
    expect(response.data?.createBusinessClientB2bForm).toBeDefined();

    saveApiResponse("createBusinessClient", response);
  });
});
```

Important: import `test` / `expect` from **`apiFixture`**, not from `@playwright/test`.

## 4. Adding a new B2B API operation

1. Add the GraphQL string to `src/api/b2b/graphql/`.
2. Add a method on `B2bService` that calls `this.client.request(...)`.
3. If the payload is complex, add a builder in `testData.ts` (Faker is already used).
4. Write the spec under `tests/api/b2b/`.
5. Tag with `@api`, `@b2b`, and a suite tag CI can grep (example: `@create business client`).

Do **not** call `GraphQLClient` directly from the spec — go through `api.b2b`.

## 5. Conditional tests

If a case needs IDs created earlier:

```ts
test.skip(!process.env.BUSINESS_CLIENT_ID, "Set BUSINESS_CLIENT_ID");
```

Keep skips intentional and documented (ESLint warns on `.skip`).

## 6. Saving responses

Use `saveApiResponse(name, response)` to write under `test-results/api/responses/` for debugging. Do not commit those files.

## 7. Run commands

```bash
ENV=staging npx playwright test --project=api
ENV=staging npx playwright test --project=api-other tests/api/b2b --grep "@webform-API-regression"
ENV=staging npx playwright test --project=api-warehouse --workers=1
ENV=staging npx playwright test --project=collector --workers=1
ENV=staging npx playwright test --project=collector-trip --workers=1
```

## 8. Checklist

- [ ] Spec imports from `apiFixture`
- [ ] Uses `api.<domain>.*` (today: `api.b2b`)
- [ ] Asserts `errors` undefined / expected data present
- [ ] Tags include `@api` + product + suite name
- [ ] No secrets hardcoded
- [ ] `npm run validate` passes
