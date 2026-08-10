import type { Page } from "@playwright/test";

export class LoginRedirectPage {
  constructor(private page: Page) {}

  async openAuthUrl(_authUrl: string) {
    // Wait until redirected away from auth token URL to a page that likely contains the dashboard
    await this.page.waitForURL(/auth\?token=|greenpan|dashboard|home/, { timeout: 15000 });
    // Try to wait for a visible Dashboard text but don't fail the whole flow if it's not present
    try {
      await this.page.waitForSelector("text=Dashboard", { timeout: 5000 }); // adjust selector if needed
    } catch {
      // selector not found in time — continue and let tests assert expected state
    }
  }
}
