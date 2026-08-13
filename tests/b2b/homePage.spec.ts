import { expect, test } from "@playwright/test";

import { PoManager } from "../../src/core/PoManager";
import { goToCreateBusinessClientStep, openB2BHome } from "./b2bFlows";

test.describe("B2B home page", () => {
  let po: PoManager;

  test.beforeEach(async ({ page }) => {
    po = new PoManager(page);
    await openB2BHome(po);
    await expect(page).not.toHaveURL(/\/auth/);
  });

  test(
    "home page is visible with branch search and create branch action",
    {
      tag: ["@b2b", "@regression"],
    },
    async () => {
      await po.getB2BHomePage().assertHomePageVisible();
    },
  );

  test(
    "create new branch opens business client step",
    {
      tag: ["@b2b", "@regression"],
    },
    async () => {
      await goToCreateBusinessClientStep(po);
      await po.getB2BCreateBusinessClientPage().assertPageVisible();
    },
  );

  test(
    "search non-existent branch shows empty results",
    { tag: ["@b2b", "@regression"] },
    async ({ page }) => {
      const home = po.getB2BHomePage();
      await home.clickSearch();
      await home.branchCombobox.fill("test-branch-non-existent-000000");
      const noDataMessage = page
        .locator(".ant-select-dropdown")
        .last()
        .locator(".ant-empty-description");
      await expect(noDataMessage).toBeVisible();
    },
  );
});
