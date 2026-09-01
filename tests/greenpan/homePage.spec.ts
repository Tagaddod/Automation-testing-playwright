import { expect, test } from "@playwright/test";

import { PoManager } from "../../src/core/PoManager";
import testdata from "../../src/utils/testdata.json";
import { openGreenpanHome } from "./greenpanFlows";

test.describe("GreenPan home page", () => {
  let po: PoManager;

  test.beforeEach(async ({ page }) => {
    po = new PoManager(page);
    await openGreenpanHome(po);
  });

  test("home page fields are visible", { tag: ["@greenpan", "@regression"] }, async () => {
    const home = po.getGreenpanHomePage();
    await home.assertPageVisible();
  });

  test(
    "valid phone proceeds to quantity step",
    {
      tag: ["@greenpan", "@regression"],
    },
    async () => {
      await po.getGreenpanHomePage().completePhoneStep(testdata.phones.validNewUser);
      await po.getGreenpanQuantityPage().assertPageVisible();
    },
  );

  test("invalid phone shows error message", { tag: ["@greenpan", "@regression"] }, async () => {
    await po.getGreenpanHomePage().enterPhoneNumber(testdata.phones.invalidUser);
    await expect(po.getGreenpanHomePage().phoneErrorMessage).toBeVisible();
  });
});
