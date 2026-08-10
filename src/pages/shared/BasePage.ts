import type { Page } from "@playwright/test";

export class BasePage {
  constructor(protected page: Page) {}

  async waitForLoad() {
    await this.page.waitForLoadState("networkidle");
  }
}
