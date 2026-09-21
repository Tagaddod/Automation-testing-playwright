# How to Create a Page Object

Page objects live under `src/pages/<product>/` and are exposed only through `PoManager`.

## 1. Choose the folder

| Product        | Folder                |
| -------------- | --------------------- |
| B2B            | `src/pages/b2b/`      |
| B2X            | `src/pages/B2X/`      |
| GreenPan       | `src/pages/greenpan/` |
| Shared helpers | `src/pages/shared/`   |

Match the naming style of the folder you are editing (the repo already mixes PascalCase and camelCase class names — do not invent a third style inside an existing folder).

## 2. Page object template (from this framework)

```ts
import { expect, type Locator, type Page } from "@playwright/test";

/** Quantity step: how many kilos of used oil. */
export class quantityPage {
  readonly quantityInput: Locator;
  readonly questionText: Locator;
  readonly rewardsText: Locator;

  constructor(private page: Page) {
    this.quantityInput = page.locator("#quantityForm-quantity");
    this.questionText = page.getByText(/معاك كام كيلو/);
    this.rewardsText = page.getByText(/هتكسب.*نقط تبدلهم بهدايا/);
  }

  async assertPageVisible() {
    await expect(this.quantityInput).toBeVisible({ timeout: 45_000 });
  }

  async enterQuantity(quantity: number) {
    await this.quantityInput.fill(String(quantity));
  }

  async completeQuantityStep(quantity: number) {
    await this.assertPageVisible();
    await this.enterQuantity(quantity);
  }
}
```

### Preferred method prefixes

| Prefix           | Meaning                   | Examples in repo                                                |
| ---------------- | ------------------------- | --------------------------------------------------------------- |
| `open` / `open*` | Navigate to this screen   | `greenpanHomePage.open()`, `B2BHomePage.open()`                 |
| `assert*`        | Visibility / state checks | `assertPageVisible()`, `assertHomePageVisible()`                |
| `complete*Step`  | Fill + submit this step   | `completePhoneStep`, `completeAddressStep`, `completeGiftsStep` |
| plain verbs      | Single actions            | `enterQuantity`, `selectDay`, `clickChangeAddress`              |

## 3. Locator guidelines (this codebase)

Prefer, in order:

1. Role + accessible name (often Arabic): `getByRole("button", { name: "إرسال الطلب" })`
2. Stable form ids: `#quantityForm-quantity`, `#phoneForm-phone`
3. Product test ids when present: `[tag-test-id="…"]` (B2B)
4. Avoid brittle deep CSS and positional `nth` unless necessary

Keep locators as `readonly` fields on the class.

## 4. Register the page in PoManager (required)

1. Import the class in `src/core/PoManager.ts`
2. Add a private cache field
3. Add a getter that lazily constructs it

```ts
getGreenpanQuantityPage() {
  if (!this.greenpanQuantity) this.greenpanQuantity = new quantityPage(this.page);
  return this.greenpanQuantity;
}
```

Specs must call:

```ts
await po.getGreenpanQuantityPage().assertPageVisible();
```

Not:

```ts
await new quantityPage(page).assertPageVisible(); // ❌
```

## 5. What belongs in the page vs flow helper

| Put in page object                | Put in `*Flows.ts`                            |
| --------------------------------- | --------------------------------------------- |
| Locators for one screen           | Crossing multiple screens                     |
| Fill/submit one step              | “Start from home and reach gifts”             |
| `assertPageVisible` for that step | Happy-path orchestration reused by many specs |

## 6. Deprecations

If renaming a PoManager getter, keep a short `@deprecated` alias (see `getGreenpanHome()` → `getGreenpanHomePage()`) so existing callers do not break abruptly.

## 7. Checklist

- [ ] File under the correct `src/pages/<product>/` folder
- [ ] Locators are readable and resilient
- [ ] `assert*` / `complete*` naming matches neighbors
- [ ] Getter added to `PoManager`
- [ ] Specs updated to use the getter
- [ ] No business flow spanning multiple pages hidden only inside one page method (prefer a flow helper)
