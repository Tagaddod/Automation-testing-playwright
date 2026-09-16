import { expect, test } from "@playwright/test";

import { PoManager } from "../../src/core/PoManager";
import { randomPhoneNumber, testdata } from "../../src/utils/testdata";
import { openGreenpanHome } from "./greenpanFlows";

test.describe("GreenPan home page", () => {
  let po: PoManager;

  test.beforeEach(async ({ page }) => {
    po = new PoManager(page);
    await openGreenpanHome(po);
  });

  test(
    "home page fields are visible",
    { tag: ["@all-regression", "@greenpan-regression-UI"] },
    async () => {
      const home = po.getGreenpanHomePage();
      await home.assertPageVisible();
    },
  );

  test(
    "valid phone proceeds to quantity step",
    {
      tag: ["@all-regression", "@greenpan-regression-UI"],
    },
    async () => {
      await po.getGreenpanHomePage().completePhoneStep(randomPhoneNumber());
      await po.getGreenpanQuantityPage().assertPageVisible();
    },
  );

  test(
    "empty phone shows required error",
    { tag: ["@all-regression", "@greenpan-regression-UI"] },
    async () => {
      await po.getGreenpanHomePage().enterPhoneNumber("");
      await expect(po.getGreenpanHomePage().phoneErrorMessage).toHaveText(
        testdata.greenpan.errors.phoneRequired,
      );
    },
  );

  test(
    "invalid phone shows error message",
    { tag: ["@all-regression", "@greenpan-regression-UI"] },
    async () => {
      await po.getGreenpanHomePage().enterPhoneNumber(testdata.greenpan.phones.invalid);
      await expect(po.getGreenpanHomePage().phoneErrorMessage).toHaveText(
        testdata.greenpan.errors.phoneInvalid,
      );
    },
  );
});
