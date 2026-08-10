import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";

/** Success confirmation after submitting a GreenPan request. */
export class requestSuccessPage {
  readonly successHeading: Locator;

  constructor(private page: Page) {
    this.successHeading = page.getByRole("heading", { name: "تم إرسال الطلب" });
  }

  async assertPageVisible() {
    await expect(this.successHeading).toBeVisible({ timeout: 60_000 });
  }
}
