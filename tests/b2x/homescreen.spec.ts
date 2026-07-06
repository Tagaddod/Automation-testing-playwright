import { test, expect } from "@playwright/test";
import { PoManager } from "../../src/core/PoManager";
import { randomTraderName, testdata } from "../../src/utils/testdata";
import { openB2XHome } from "./b2xFlows";

test.describe("B2X home", () => {
  let po: PoManager;

  test.beforeEach(async ({ page }) => {
    po = new PoManager(page);
    await openB2XHome(po);
    await expect(page).not.toHaveURL(/\/auth/);
  });

  test("opens B2X trader search page", { tag: ["@b2x", "@smoke", "@e2e"] }, async ({ page }) => {
    const home = po.getB2XHomePage();
    await expect(home.searchTraderInput).toBeVisible();
    await expect(home.nextBTN).toBeVisible();
    await expect(page.getByRole("heading", { name: "ادخل اسم التاجر" })).toBeVisible();
  });

  test("add new trader opens trader form", { tag: ["@b2x", "@smoke", "@regression", "@e2e"] }, async () => {
    await po.getB2XHomePage().addNewTrader(randomTraderName());
    await expect(po.getB2XFormPage().phoneNumber).toBeVisible({ timeout: 30_000 });
  });

  test("search existing trader and proceed to collectables", { tag: ["@b2x", "@regression", "@e2e"] }, async ({ page }) => {
    await po.getB2XHomePage().searchExistTrader(testdata.b2x.existingTraderName);
    await expect(page.getByRole("heading", { name: "أدخل الكميات" })).toBeVisible({ timeout: 30_000 });
  });

  test("search non-existent trader shows empty results", { tag: ["@b2x", "@regression"] }, async () => {
    const home = po.getB2XHomePage();
    await home.searchTraderWithNoResults(testdata.b2x.nonExistingTraderName);
    await expect(home.traderDropdownEmptyState()).toBeVisible({ timeout: 15_000 });
  });
});
