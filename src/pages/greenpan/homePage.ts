import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";

import { URLs } from "../../config/urls";

/** Landing step: phone entry and start request. */
export class greenpanHomePage {
  readonly phoneInput: Locator;
  readonly startRequestButton: Locator;
  readonly phoneErrorMessage: Locator;
  readonly heroText: Locator;
  readonly oopsHeading: Locator;

  constructor(private page: Page) {
    this.phoneInput = page.locator("#phoneForm-phone");
    this.startRequestButton = page.getByRole("button", { name: "ابدأ الطلب" });
    this.phoneErrorMessage = page.locator("#phoneForm-phone-error");
    this.heroText = page.getByText(/بدلي الزيت المستعمل بهدايا/);
    this.oopsHeading = page.getByRole("heading", { name: "Oops!" });
  }

  async open() {
    for (let attempt = 0; attempt < 4; attempt++) {
      await this.page.goto(URLs.greenpan.base, { waitUntil: "domcontentloaded" });
      await this.page.waitForLoadState("networkidle", { timeout: 15_000 }).catch(() => undefined);

      if (await this.phoneInput.isVisible({ timeout: 10_000 }).catch(() => false)) {
        return;
      }

      if (await this.oopsHeading.isVisible({ timeout: 1_500 }).catch(() => false)) {
        const homeLink = this.page.getByRole("link", { name: "Go back home" });
        if (await homeLink.isVisible().catch(() => false)) {
          await homeLink.click();
        }
        await this.page.waitForTimeout(1_000);
        continue;
      }

      await this.page.reload({ waitUntil: "domcontentloaded" }).catch(() => undefined);
    }

    await expect(this.phoneInput).toBeVisible({ timeout: 30_000 });
  }

  async assertPageVisible() {
    await expect(this.page).toHaveURL(/greenpan/);
    await expect(this.phoneInput).toBeVisible({ timeout: 30_000 });
    await expect(this.startRequestButton).toBeVisible();
    await expect(this.heroText).toBeVisible();
  }

  async enterPhoneNumber(phone: string) {
    await this.phoneInput.fill(phone);
    await this.startRequestButton.click();
  }

  async completePhoneStep(phone: string) {
    await this.enterPhoneNumber(phone);
  }
}
