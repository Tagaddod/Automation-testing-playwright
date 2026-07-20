import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";

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
    await expect(this.questionText.or(this.quantityInput).first()).toBeVisible();
  }

  async enterQuantity(quantity: number) {
    await this.quantityInput.fill(String(quantity));
  }

  async increaseQuantity(by = 1) {
    const current = await this.getEnteredQuantity();
    await this.enterQuantity(current + by);
  }

  async decreaseQuantity(by = 1) {
    const current = await this.getEnteredQuantity();
    await this.enterQuantity(Math.max(0, current - by));
  }

  async getEnteredQuantity(): Promise<number> {
    return Number(await this.quantityInput.inputValue());
  }

  async completeQuantityStep(quantity: number) {
    await this.assertPageVisible();
    await this.enterQuantity(quantity);
  }
}
