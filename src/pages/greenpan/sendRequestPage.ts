import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";

/** Schedule / send request step. */
export class sendRequestPage {
  readonly dayCard: Locator;
  readonly sendRequestButton: Locator;
  readonly changeAddressButton: Locator;
  readonly pickupAddressHeading: Locator;
  readonly addNewAddressButton: Locator;
  readonly currentAddressText: Locator;

  constructor(private page: Page) {
    this.dayCard = page.locator('input[name="tripDay"] + div');
    this.sendRequestButton = page.getByRole("button", { name: "إرسال الطلب" });
    this.changeAddressButton = page.getByRole("button", { name: "تغيير" });
    this.pickupAddressHeading = page.getByRole("heading", { name: "عنوان الإستلام" });
    this.addNewAddressButton = page.getByRole("button", { name: /إضافة عنوان جديد/ });
    this.currentAddressText = page.getByText(/سيتم الاستلام من/);
  }

  async assertPageVisible() {
    await expect(this.sendRequestButton).toBeVisible({ timeout: 30_000 });
    await expect(this.dayCard.first()).toBeVisible();
  }

  async assertExistingAddressVisible() {
    await expect(this.changeAddressButton).toBeVisible({ timeout: 15_000 });
    await expect(this.currentAddressText).toBeVisible();
  }

  async clickChangeAddress() {
    await this.changeAddressButton.click();
  }

  async assertAddressPickerVisible() {
    await expect(this.pickupAddressHeading).toBeVisible({ timeout: 15_000 });
    await expect(this.addNewAddressButton).toBeVisible();
  }

  async clickAddNewAddress() {
    await this.addNewAddressButton.click();
  }

  async changeToNewAddress() {
    await this.assertExistingAddressVisible();
    await this.clickChangeAddress();
    await this.assertAddressPickerVisible();
    await this.clickAddNewAddress();
  }

  async selectDay(index = 1) {
    await this.dayCard.nth(index).click();
  }

  async sendRequest() {
    await this.sendRequestButton.click();
  }

  async completeSendRequestStep(dayIndex = 1) {
    await this.assertPageVisible();
    await this.selectDay(dayIndex);
    await this.sendRequest();
  }
}
