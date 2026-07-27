import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";

import { testdata } from "../../utils/testdata";

export class branchConfirmationPage {
  readonly successHeading: Locator;
  readonly registerBusinessRequestLink: Locator;

  constructor(private page: Page) {
    this.successHeading = page.getByRole("heading", {
      name: testdata.b2b.confirmation.successHeading,
    });
    this.registerBusinessRequestLink = page.getByRole("link", {
      name: testdata.b2b.confirmation.registerRequestLink,
    });
  }

  async assertPageVisible() {
    await expect(this.successHeading).toBeVisible({ timeout: 60_000 });
    await expect(this.registerBusinessRequestLink).toBeVisible();
  }

  async clickRegisterBusinessRequest() {
    await this.registerBusinessRequestLink.click();
  }
}
