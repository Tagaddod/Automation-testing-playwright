import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";

/** Gifts / rewards selection step. */
export class giftsPage {
  readonly chooseGiftHeading: Locator;
  readonly addGiftButton: Locator;
  readonly nextButton: Locator;
  readonly insufficientPointsButton: Locator;
  readonly plusButton: Locator;
  readonly minusButton: Locator;
  readonly giftQuantityInput: Locator;

  constructor(private page: Page) {
    this.chooseGiftHeading = page.getByRole("heading", { name: /اختار هديتك/ });
    this.addGiftButton = page.getByRole("button", { name: "اضف الهدية" });
    this.nextButton = page.getByRole("button", { name: "التالي" });
    this.insufficientPointsButton = page.locator("button:has-text('نقاطك لا تكفي')");
    this.plusButton = page.locator("button:has(svg use[href*='#plus'])");
    this.minusButton = page.locator("button:has(svg use[href*='#minus'])");
    this.giftQuantityInput = this.plusButton.locator("xpath=following-sibling::input[1]");
  }

  async assertPageVisible() {
    await expect(this.chooseGiftHeading).toBeVisible({ timeout: 45_000 });
    await expect(this.addGiftButton.first()).toBeVisible({ timeout: 15_000 });
  }

  async addGift(index = 0) {
    const button = this.addGiftButton.nth(index);
    await button.scrollIntoViewIfNeeded();
    await button.click();
    await expect(this.page.getByText(/نقاط متبقية/)).toBeVisible({ timeout: 10_000 });
  }

  async increaseGiftQuantity(count = 1) {
    for (let i = 0; i < count; i++) {
      if (await this.plusButton.isEnabled().catch(() => false)) {
        await this.plusButton.click();
        await this.page.waitForTimeout(150);
      } else {
        break;
      }
    }
  }

  async decreaseGiftQuantity(count = 1) {
    for (let i = 0; i < count; i++) {
      if (await this.minusButton.isEnabled().catch(() => false)) {
        await this.minusButton.click();
        await this.page.waitForTimeout(150);
      } else {
        break;
      }
    }
  }

  async getSelectedGiftQuantity(): Promise<number> {
    await this.giftQuantityInput.waitFor({ state: "visible", timeout: 10_000 });
    return Number(await this.giftQuantityInput.inputValue());
  }

  async getRemainingPoints(): Promise<number> {
    const digit = this.page
      .locator("div")
      .filter({ hasText: "نقاط متبقية" })
      .locator('.tabular-nums span[style*="transform: none"]')
      .last();
    // Animated counter spans are often "hidden" to Playwright; read attached text instead.
    await digit.waitFor({ state: "attached", timeout: 15_000 });
    const text = (await digit.textContent()) ?? "0";
    return Number(text.replace(/,/g, "").trim());
  }

  insufficientPointsButtonAt(index: number): Locator {
    return this.insufficientPointsButton.nth(index);
  }

  async clickNext() {
    await this.nextButton.scrollIntoViewIfNeeded();
    await expect(this.nextButton).toBeVisible({ timeout: 30_000 });
    await this.nextButton.click();
  }

  async completeGiftsStep(giftIndex = 0) {
    await this.assertPageVisible();
    await this.addGift(giftIndex);
    await this.clickNext();
  }
}
