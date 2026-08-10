import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";

/** Bundle package card + bottom-sheet phone entry. */
export class bundlePackagePage {
  readonly packageCard: Locator;
  readonly phoneInput: Locator;
  readonly chooseGiftButton: Locator;
  readonly sheetHeading: Locator;

  constructor(private page: Page) {
    // Dev packages are dynamic (e.g. "باقه العيد..."); use the first carousel card.
    this.packageCard = page.getByRole("region").getByRole("group").first();
    this.phoneInput = page.locator("#GiftCarouselBottomSheetPhoneForm-phone");
    this.chooseGiftButton = page
      .getByRole("button", { name: /اختار هديتك|احصل على الهديه|ابدأ/ })
      .or(page.getByText("اختار هديتك"))
      .first();
    this.sheetHeading = page
      .getByRole("heading", { name: /دخل رقم تليفونك|احصل على الهديه/ })
      .or(page.locator("h2").filter({ hasText: /تليفون|هديه|هدية/ }))
      .first();
  }

  async openPackageCard() {
    await expect(this.packageCard).toBeVisible({ timeout: 20_000 });
    await this.packageCard.click();
  }

  async assertSheetVisible() {
    await expect(this.phoneInput.or(this.sheetHeading).first()).toBeVisible({ timeout: 20_000 });
    await expect(this.phoneInput).toBeVisible({ timeout: 10_000 });
  }

  async enterPhoneNumber(phone: string) {
    await this.phoneInput.fill(phone);
    if (await this.chooseGiftButton.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await this.chooseGiftButton.click();
    } else {
      await this.page.keyboard.press("Enter");
    }
  }

  async completeBundlePhoneStep(phone: string) {
    await this.openPackageCard();
    await this.assertSheetVisible();
    await this.enterPhoneNumber(phone);
  }
}
