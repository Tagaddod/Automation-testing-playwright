import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";

import { URLs } from "../../config/urls";
import { getAuthToken, gotoAuthTokenPage } from "../../utils/authApi";

/** Agent webform: `/auth?token=` (admin) → `/agent` phone step. */
export class greenpanHomePage {
  readonly phoneInput: Locator;
  readonly startRequestButton: Locator;
  readonly phoneErrorMessage: Locator;
  readonly heroText: Locator;
  readonly oopsHeading: Locator;

  constructor(private page: Page) {
    this.phoneInput = page.locator("#phoneForm-phone");
    this.startRequestButton = page.getByRole("button", { name: /ابدأ الطلب|التالي/ }).first();
    this.phoneErrorMessage = page.locator("#phoneForm-phone-error");
    this.heroText = page.getByRole("heading", { name: /ماترميش زيت القلي|بدلي الزيت المستعمل/ });
    this.oopsHeading = page.getByRole("heading", { name: "Oops!" });
  }

  async open() {
    const token = await getAuthToken("admin");
    await gotoAuthTokenPage(this.page, `${URLs.greenpan.auth}${token}`);

    if (!(await this.phoneInput.isVisible({ timeout: 10_000 }).catch(() => false))) {
      await this.page.goto(URLs.greenpan.base, { waitUntil: "domcontentloaded" });
    }

    await expect(this.phoneInput).toBeVisible({ timeout: 30_000 });
  }

  async assertPageVisible() {
    await expect(this.page).toHaveURL(/\/agent/);
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
