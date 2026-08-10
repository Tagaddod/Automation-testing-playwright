import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";

import { testdata } from "../../utils/testdata";

export class requestMaterialsPage {
  readonly stepLabel: Locator;
  readonly pageHeading: Locator;
  readonly createRequestButton: Locator;
  readonly materialsGroup: Locator;
  readonly freshProductsGroup: Locator;
  readonly addCollectableButton: Locator;
  readonly deleteCollectableButton: Locator;
  readonly nextButton: Locator;
  readonly materialsRequiredError: Locator;

  constructor(private page: Page) {
    this.stepLabel = page.getByText("خطوه 1 / 2");
    this.pageHeading = page.getByRole("heading", { name: "أدخل الكميات" });
    this.createRequestButton = page.getByText("عمل طلب جديد");
    this.materialsGroup = page
      .getByRole("group", { name: "اختر المواد المطلوبة" })
      .filter({ hasText: testdata.b2b.wasteTypes.usedOil })
      .first();
    this.freshProductsGroup = page
      .getByRole("main")
      .filter({ has: page.getByRole("heading", { name: testdata.b2b.freshProductsSection }) })
      .last();
    this.addCollectableButton = page.getByLabel(`إضافة ${testdata.b2b.wasteTypes.usedOil}`);
    this.deleteCollectableButton = page.getByText("حذف");
    this.nextButton = page.getByRole("button", { name: "التالي" }).last();
    this.materialsRequiredError = page.getByText(testdata.b2b.errors.materialsRequired).first();
  }

  private usedOilIncreaseButton(): Locator {
    return this.page.locator(`[aria-label="زيادة عدد ${testdata.b2b.wasteTypes.usedOil}"]`);
  }

  private usedOilReduceButton(): Locator {
    return this.page.locator(`[aria-label="تقليل عدد ${testdata.b2b.wasteTypes.usedOil}"]`);
  }

  usedOilQuantityInput(): Locator {
    return this.page.locator(`[aria-label="عدد ${testdata.b2b.wasteTypes.usedOil}"]`);
  }

  private firstFreshProductQuantityInput(): Locator {
    const usedOil = testdata.b2b.wasteTypes.usedOil;
    return this.page
      .locator(
        `[aria-label^="عدد"]:not([aria-label="عدد ${usedOil}"]):not([aria-label="عدد كيلو"]):not([aria-label="عدد بلاستيك"])`,
      )
      .first();
  }

  freshProductIncreaseButton(productName?: string): Locator {
    if (productName) {
      return this.page.locator(`[aria-label="زيادة عدد ${productName}"]`);
    }
    return this.freshProductsGroup.locator('[aria-label^="زيادة عدد"]').first();
  }

  async assertPageVisible() {
    await expect(this.pageHeading).toBeVisible({ timeout: 30_000 });
    const hasMaterials = await this.materialsGroup.isVisible().catch(() => false);
    const hasFreshProducts = await this.page
      .getByRole("heading", { name: testdata.b2b.freshProductsSection })
      .isVisible()
      .catch(() => false);
    expect(hasMaterials || hasFreshProducts).toBeTruthy();
    await expect(this.nextButton).toBeVisible();
  }

  async waitForMaterialsLoaded() {
    await expect(this.pageHeading).toBeVisible({ timeout: 45_000 });
    await expect(
      this.addCollectableButton.or(this.page.locator('[aria-label^="زيادة عدد"]')).first(),
    ).toBeVisible({ timeout: 45_000 });
  }

  async clickCreateRequestButton() {
    await this.createRequestButton.click();
  }

  async addUsedOilCollectable() {
    const increaseBtn = this.usedOilIncreaseButton();
    if (await increaseBtn.isVisible({ timeout: 1_000 }).catch(() => false)) {
      return;
    }
    await this.addCollectableButton.scrollIntoViewIfNeeded();
    await this.addCollectableButton.click({ force: true });
    await expect(increaseBtn).toBeVisible({ timeout: 10_000 });
  }

  async setUsedOilQuantity(quantity: number) {
    const input = this.usedOilQuantityInput();
    await input.scrollIntoViewIfNeeded();
    await expect(input).toBeVisible({ timeout: 10_000 });
    await input.fill(String(quantity));
    await input.blur();
    await expect(input).toHaveValue(String(quantity));
  }

  async setCollectableQuantity(collectableLabel: string, quantity: number) {
    const input = this.page.locator(`[aria-label="عدد ${collectableLabel}"]`);
    await input.scrollIntoViewIfNeeded();
    await expect(input).toBeVisible({ timeout: 10_000 });
    await input.fill(String(quantity));
    await input.blur();
    await expect(input).toHaveValue(String(quantity));
  }

  async setFreshProductQuantity(quantity: number, productName?: string) {
    const input = productName
      ? this.page.locator(`[aria-label="عدد ${productName}"]`)
      : this.firstFreshProductQuantityInput();
    await input.scrollIntoViewIfNeeded();
    await expect(input).toBeVisible({ timeout: 10_000 });
    await input.fill(String(quantity));
    await input.blur();
    await expect(input).toHaveValue(String(quantity));
  }

  async increaseUsedOilQuantity(times: number) {
    await this.setUsedOilQuantity(times);
  }

  async decreaseUsedOilQuantity(times: number) {
    const button = this.usedOilReduceButton();
    await button.scrollIntoViewIfNeeded();
    for (let i = 0; i < times; i++) {
      await button.click({ force: true });
    }
  }

  async increaseFreshProductQuantity(times: number, productName?: string) {
    await this.setFreshProductQuantity(times, productName);
  }

  async clickNext() {
    await this.nextButton.click();
  }

  async clickNextToDetails() {
    await this.clickNext();
    await expect(this.page.locator('input[id="pickupDate"]')).toBeVisible({ timeout: 30_000 });
  }

  async completeUsedOilOnlyStep(quantity = testdata.b2b.requestQuantity) {
    await this.waitForMaterialsLoaded();
    await this.addUsedOilCollectable();
    await this.increaseUsedOilQuantity(quantity);
    await this.clickNextToDetails();
  }

  async completeFreshProductOnlyStep(quantity = testdata.b2b.requestQuantity) {
    await this.waitForMaterialsLoaded();
    await expect(this.freshProductsGroup).toBeVisible({ timeout: 15_000 });
    await this.increaseFreshProductQuantity(quantity);
    await this.clickNextToDetails();
  }

  async completeBothMaterialsStep(quantity = testdata.b2b.requestQuantity) {
    await this.waitForMaterialsLoaded();
    await this.addUsedOilCollectable();
    await this.increaseUsedOilQuantity(quantity);
    await this.increaseFreshProductQuantity(quantity);
    await this.clickNextToDetails();
  }

  async completeMultipleCollectablesAndFreshProductsStep(quantity = testdata.b2b.requestQuantity) {
    await this.waitForMaterialsLoaded();
    await this.addUsedOilCollectable();
    await this.setUsedOilQuantity(quantity);
    await this.setCollectableQuantity("كيلو", quantity);
    await this.setCollectableQuantity("بلاستيك", quantity);
    await this.increaseFreshProductQuantity(quantity);
    await this.clickNextToDetails();
  }
}
