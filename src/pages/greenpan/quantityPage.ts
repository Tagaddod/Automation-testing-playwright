import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";

import { testdata } from "../../utils/testdata";

/** Agent quantity step: "معاك كام كيلو؟" */
export class quantityPage {
  readonly quantityInput: Locator;
  readonly questionText: Locator;
  readonly nextButton: Locator;
  readonly minQuantityError: Locator;
  readonly containersInput: Locator;
  readonly barrelsInput: Locator;

  constructor(private page: Page) {
    this.quantityInput = page
      .locator("#agentOilQuantityForm-oilQuantity")
      .or(page.getByPlaceholder("ادخل الكمية"));
    this.questionText = page.getByText(/معاك كام كيلو/);
    this.nextButton = page.locator('button[type="submit"]').filter({ hasText: "التالي" });
    this.minQuantityError = page.getByText(testdata.greenpan.errors.quantityBelowMinimum);
    this.containersInput = page.locator("#agentOilQuantityForm-containers");
    this.barrelsInput = page.locator("#agentOilQuantityForm-barrels");
  }

  async assertPageVisible() {
    await expect(this.quantityInput).toBeVisible({ timeout: 45_000 });
    await expect(this.questionText.or(this.quantityInput).first()).toBeVisible();
    await expect(this.containersInput).toBeVisible();
    await expect(this.barrelsInput).toBeVisible();
  }

  async enterQuantity(quantity: number | string) {
    await this.quantityInput.fill(String(quantity));
  }

  async fillContainers(count: number) {
    await this.containersInput.fill(String(count));
  }

  async fillBarrels(count: number) {
    await this.barrelsInput.fill(String(count));
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

  async proceed() {
    await this.nextButton.click();
  }

  async completeQuantityStep(quantity: number) {
    await this.assertPageVisible();
    await this.enterQuantity(quantity);
    await this.proceed();
  }
}
