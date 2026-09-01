import { expect, test } from "@playwright/test";

test("Navigate to B2C household page", { tag: ["@b2c", "@create-request"] }, async ({ page }) => {
  await page.goto("/household");

  await expect(page).toHaveURL(/.*household/);
  await expect(page).toHaveTitle(/GreenPan|Tagaddod/i); // adjust title as needed
});
