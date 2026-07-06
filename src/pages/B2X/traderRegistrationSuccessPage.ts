import { expect, Locator, Page } from "@playwright/test";

export class traderRegistrationSuccessPage {
  readonly successHeading: Locator;
  readonly registerAnotherTraderButton: Locator;

  constructor(private page: Page) {
    this.successHeading = page.getByRole("heading", {
      name: "تم تسجيل التاجر الجديد بنجاح",
    });
    this.registerAnotherTraderButton = page.getByRole("link", { name: "تسجيل تاجر آخر" });
  }

  createRequestForTraderButton(traderName: string): Locator {
    return this.page.getByRole("link", { name: new RegExp(`تسجيل طلب تاجر لـ\\s*${traderName}`) });
  }

  async assertSuccessPage(traderName: string) {
    await expect(this.successHeading).toBeVisible({ timeout: 30_000 });
    await expect(this.createRequestForTraderButton(traderName)).toBeVisible();
    await expect(this.registerAnotherTraderButton).toBeVisible();
  }

  async clickCreateRequestForTrader(traderName: string) {
    await this.createRequestForTraderButton(traderName).click();
    await expect(this.page.getByRole("heading", { name: "أدخل الكميات" })).toBeVisible({
      timeout: 30_000,
    });
  }

  async clickRegisterAnotherTrader() {
    await this.registerAnotherTraderButton.click();
    await expect(this.page.getByRole("combobox", { name: "ابحث بإسم التاجر" })).toBeVisible({
      timeout: 30_000,
    });
  }
}
