import { expect, Locator, Page } from "@playwright/test";

const USED_OIL = "زيت مستعمل";

export class collectablePage {
  readonly materialsGroup: Locator;
  readonly nextButton: Locator;

  constructor(private page: Page) {
    this.materialsGroup = page.getByRole("group", { name: "اختر المواد المطلوبة" });
    this.nextButton = page.getByRole("button", { name: "التالي" }).last();
  }

  private addButton(blockIndex: number): Locator {
    return this.page.getByLabel(`إضافة ${USED_OIL}`).nth(blockIndex);
  }

  private usedOilArticle(blockIndex: number): Locator {
    return this.page
      .locator(`article:has([aria-label="عدد ${USED_OIL}"])`)
      .nth(blockIndex);
  }

  private priceInput(blockIndex: number): Locator {
    return this.page.getByPlaceholder("أدخل سعر الكيلو").nth(blockIndex);
  }

  private increaseButton(blockIndex: number): Locator {
    return this.usedOilArticle(blockIndex).locator(`[aria-label="زيادة عدد ${USED_OIL}"]`);
  }

  private decreaseButton(blockIndex: number): Locator {
    return this.usedOilArticle(blockIndex).locator(`[aria-label="تقليل عدد ${USED_OIL}"]`);
  }

  usedOilQuantityInput(blockIndex = 0): Locator {
    return this.usedOilArticle(blockIndex).locator(`[aria-label="عدد ${USED_OIL}"]`);
  }

  materialHeadings(): Locator {
    return this.materialsGroup
      .getByRole("heading", { level: 3 })
      .filter({ hasNotText: /^عدد / });
  }

  /** Clicks أضف / إضافة for the given collectable block (0 = first, 1 = second, …). */
  async addCollectable(blockIndex = 0) {
    const increaseBtn = this.increaseButton(blockIndex);
    if (await increaseBtn.isVisible({ timeout: 1_000 }).catch(() => false)) {
      return;
    }
    await this.addButton(blockIndex).click();
    await expect(increaseBtn).toBeVisible({ timeout: 10_000 });
  }

  async fillPricePerKilo(price: string, blockIndex = 0) {
    await this.priceInput(blockIndex).fill(price);
  }

  async increaseQuantity(times: number, blockIndex = 0) {
    const button = this.increaseButton(blockIndex);
    for (let i = 0; i < times; i++) {
      await button.scrollIntoViewIfNeeded();
      await button.click();
    }
  }

  async decreaseQuantity(times: number, blockIndex = 0) {
    const button = this.decreaseButton(blockIndex);
    for (let i = 0; i < times; i++) {
      await button.scrollIntoViewIfNeeded();
      await button.click();
    }
  }

  async clickNext() {
    await this.nextButton.click();
  }

  /** Full flow for one block: add → price → used-oil quantity. */
  async fillCollectableBlock(price: string, quantity: number, blockIndex = 0) {
    await this.addCollectable(blockIndex);
    await this.fillPricePerKilo(price, blockIndex);
    await this.increaseQuantity(quantity, blockIndex);
  }

  async completeCollectablesStep(price = "10", quantity = 2) {
    await this.fillCollectableBlock(price, quantity, 0);
    await this.clickNext();
  }
}
