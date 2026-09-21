# How to Create a UI Test

Follow the patterns already used in `tests/b2b`, `tests/b2x`, and `tests/greenpan`.

## 1. Pick the product folder

| Product  | Spec folder       | Flow helper        | Project flag         |
| -------- | ----------------- | ------------------ | -------------------- |
| B2B      | `tests/b2b/`      | `b2bFlows.ts`      | `--project=b2b`      |
| B2X      | `tests/b2x/`      | `b2xFlows.ts`      | `--project=b2x`      |
| GreenPan | `tests/greenpan/` | `greenpanFlows.ts` | `--project=greenpan` |

File name: `<area>.spec.ts` (example: `homePage.spec.ts`, `quantityPage.spec.ts`).

## 2. Spec skeleton (match existing style)

```ts
import { expect, test } from "@playwright/test";

import { PoManager } from "../../src/core/PoManager";
import { openB2BHome } from "./b2bFlows";

test.describe("B2B home page", () => {
  let po: PoManager;

  test.beforeEach(async ({ page }) => {
    po = new PoManager(page);
    await openB2BHome(po);
    await expect(page).not.toHaveURL(/\/auth/);
  });

  test(
    "home page is visible with branch search and create branch action",
    {
      tag: ["@b2b", "@smoke", "@regression"],
    },
    async () => {
      await po.getB2BHomePage().assertHomePageVisible();
    },
  );
});
```

### GreenPan differences

- Do **not** assert `/auth` redirect (no admin storageState).
- Use flow helpers such as `openGreenpanHome`, `goToQuantityStep`, `goToGiftsStep`.
- For new-user / address cases, prefer `randomPhoneNumber()` so the address step appears.

```ts
import { PoManager } from "../../src/core/PoManager";
import testdata from "../../src/utils/testdata.json";
import { goToQuantityStep } from "./greenpanFlows";

test.beforeEach(async ({ page }) => {
  po = new PoManager(page);
  await goToQuantityStep(po, testdata.phones.validUser);
});
```

## 3. Keep specs thin

**Do in the spec**

- Choose which flow helper / phone / quantity / branch to use
- Call one or two page methods
- Assert the outcome of _this_ scenario

**Do not in the spec**

- Long locator chains
- Copy-paste of multi-step navigation (put it in `*Flows.ts`)
- `new SomePage(page)` — always use PoManager

## 4. Use / extend flow helpers

If several tests need the same path (example: reach gifts step), add a helper in the product `*Flows.ts`:

```ts
// tests/greenpan/greenpanFlows.ts
export async function goToGiftsStep(
  po: PoManager,
  phone = testdata.phones.validUser,
  quantity = testdata.quantities.medium,
) {
  await goToQuantityStep(po, phone);
  await po.getGreenpanQuantityPage().completeQuantityStep(quantity);
  await po.getGreenpanGiftsPage().assertPageVisible();
}
```

Naming used in this repo:

- `open*` — land on product home
- `goTo*Step` — navigate to a specific step
- `complete*` — finish a happy-path flow

## 5. Tags (required for CI filters)

Every meaningful test should include:

1. Product tag: `@b2b` | `@b2x` | `@greenpan` | `@api`
2. Suite tag(s): `@smoke` and/or `@regression`
3. Optional: `@e2e` for longer end-to-end paths
4. Optional suite name used by CI grep, e.g. `@create business client`, `@create-request`

```ts
test("…", { tag: ["@greenpan", "@smoke", "@regression", "@e2e"] }, async () => {
  // …
});
```

## 6. Timeouts

Product projects already use 180s. Slow describes may raise further:

```ts
test.describe.configure({ timeout: 180_000 });
```

Do not raise timeouts to hide flaky locators — fix the wait/locator instead.

## 7. Run only your new test

```bash
ENV=dev npx playwright test tests/greenpan/quantityPage.spec.ts --project=greenpan
ENV=staging npx playwright test tests/b2b/homePage.spec.ts --project=b2b --grep @smoke
```

## 8. Checklist before PR

- [ ] Spec uses `PoManager`
- [ ] Navigation lives in flow helper when reused
- [ ] Tags present
- [ ] No `test.only`
- [ ] `npm run validate` passes
- [ ] Test passed on the intended `ENV`
