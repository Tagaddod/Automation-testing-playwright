import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { test as setup } from "../../src/fixtures/loginFixture";
import { URLs } from "../../src/config/urls";

const AUTH_STATE_PATH = "playwright/.auth/user.json";

async function waitForAuthRedirect(page: import("@playwright/test").Page, authUrl: string) {
  for (let attempt = 0; attempt < 3; attempt++) {
    await page.goto(authUrl, { waitUntil: "domcontentloaded" });

    const networkError = page.getByRole("heading", { name: "Network Error" });
    if (await networkError.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await page.getByRole("button", { name: "retry" }).click();
    }

    try {
      await page.waitForURL((url) => !url.href.includes("/auth?token="), { timeout: 30_000 });
      return;
    } catch {
      if (attempt === 2) {
        throw new Error("Auth redirect failed after 3 attempts (Network Error or timeout on staging).");
      }
    }
  }
}

/**
 * Runs once before B2B tests: token login → save cookies/localStorage for reuse.
 */
setup("authenticate B2B and save storage state", async ({ page, token }) => {
  mkdirSync(dirname(AUTH_STATE_PATH), { recursive: true });

  await waitForAuthRedirect(page, `${URLs.b2b.auth}${token}`);
  await page.context().storageState({ path: AUTH_STATE_PATH });
});
