import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";

/** Agent order step: `/agent/:id/request/:id/new/order` — address, day, gifts, submit. */
export class sendRequestPage {
  readonly sendRequestButton: Locator;
  readonly pickupAddressHeading: Locator;
  readonly addNewAddressButton: Locator;
  readonly dayCard: Locator;
  readonly noSlotsMessage: Locator;
  readonly addGiftButton: Locator;
  readonly giftsHeading: Locator;
  readonly notesInput: Locator;

  constructor(private page: Page) {
    this.sendRequestButton = page.getByRole("button", { name: /إرسال الطلب/ });
    this.pickupAddressHeading = page.getByRole("heading", { name: /اختر العنوان/ });
    this.addNewAddressButton = page.getByRole("link", { name: /إضافة عنوان جديد/ });
    this.dayCard = page
      .getByRole("radiogroup")
      .last()
      .locator("div")
      .filter({
        hasText: /سبتمبر|أكتوبر|نوفمبر|ديسمبر|يناير|فبراير|مارس|أبريل|مايو|يونيو|يوليو|أغسطس/,
      });
    this.noSlotsMessage = page.getByText("لا يوجد مواعيد متاحة في هذه المنطقة");
    this.addGiftButton = page.getByRole("button", { name: /أضف الهدية/ });
    this.giftsHeading = page.getByRole("heading", { name: /الهدايا المتاحة/ });
    this.notesInput = page.locator("#orderNotes");
  }

  async assertPageVisible() {
    await expect(this.page).toHaveURL(/\/agent\/.+\/request\/.+\/new\/order/, { timeout: 30_000 });
    await expect(this.page.getByRole("heading", { name: "تفاصيل الطلب" })).toBeVisible({
      timeout: 30_000,
    });
    await expect(this.pickupAddressHeading).toBeVisible();
    await expect(this.sendRequestButton).toBeVisible();
    await this.waitForOrderReady();
  }

  /** Address cards start as skeletons; wait until the add-address link or a saved card is there. */
  async waitForOrderReady() {
    await expect(this.addNewAddressButton.or(this.page.getByText(/شقة رقم/)).first()).toBeVisible({
      timeout: 30_000,
    });
    await expect(
      this.dayCard.first().or(this.noSlotsMessage).or(this.giftsHeading).first(),
    ).toBeVisible({
      timeout: 20_000,
    });
  }

  async changeToNewAddress() {
    await this.waitForOrderReady();
    await expect(this.addNewAddressButton).toBeVisible({ timeout: 20_000 });
    await this.addNewAddressButton.click();
    await expect(this.page).toHaveURL(/\/agent\/.+\/address/, { timeout: 20_000 });
  }

  async selectDay(index = 0) {
    await expect(this.dayCard.first().or(this.noSlotsMessage).first()).toBeVisible({
      timeout: 20_000,
    });
    if (await this.noSlotsMessage.isVisible().catch(() => false)) {
      return;
    }
    await this.dayCard.nth(index).click();
  }

  async addRequiredGift(index = 0) {
    await expect(this.giftsHeading.or(this.addGiftButton.first()).first()).toBeVisible({
      timeout: 15_000,
    });
    const button = this.addGiftButton.nth(index);
    if (!(await button.isVisible({ timeout: 5_000 }).catch(() => false))) {
      return;
    }
    await button.scrollIntoViewIfNeeded();
    await button.click();
  }

  async fillNotes(notes: string) {
    await this.notesInput.fill(notes);
  }

  async sendRequest() {
    await expect(this.sendRequestButton).toBeEnabled({ timeout: 20_000 });
    await this.sendRequestButton.click();
  }

  async completeSendRequestStep(dayIndex = 0, notes?: string) {
    await this.assertPageVisible();
    if (notes) {
      await this.fillNotes(notes);
    }
    await this.selectDay(dayIndex);
    await this.addRequiredGift();
    await this.sendRequest();
  }
}
