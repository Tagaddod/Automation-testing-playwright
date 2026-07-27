import { expect, test } from "@playwright/test";

import { PoManager } from "../../src/core/PoManager";
import testdata from "../../src/utils/testdata.json";
import { goToQuantityStep } from "./greenpanFlows";

test.describe("GreenPan quantity page", () => {
  test.describe.configure({ timeout: 120_000 });

  let po: PoManager;

  test.beforeEach(async ({ page }) => {
    po = new PoManager(page);
    await goToQuantityStep(po, testdata.phones.validUser);
  });

  test(
    "quantity page fields are visible",
    { tag: ["@greenpan", "@smoke", "@regression"] },
    async () => {
      await po.getGreenpanQuantityPage().assertPageVisible();
    },
  );

  test(
    "quantity below minimum does not open gifts step",
    {
      tag: ["@greenpan", "@regression"],
    },
    async () => {
      await po.getGreenpanQuantityPage().enterQuantity(testdata.quantities.small);
      await expect(po.getGreenpanGiftsPage().chooseGiftHeading).toBeHidden();
    },
  );

  test(
    "quantity at or above minimum opens gifts step",
    {
      tag: ["@greenpan", "@smoke", "@regression", "@e2e"],
    },
    async () => {
      const quantity = po.getGreenpanQuantityPage();
      await quantity.enterQuantity(testdata.quantities.medium);
      await expect(quantity.rewardsText).toBeVisible();
      await po.getGreenpanGiftsPage().assertPageVisible();
    },
  );

  test(
    "increasing quantity updates the entered value",
    {
      tag: ["@greenpan", "@regression"],
    },
    async () => {
      const quantity = po.getGreenpanQuantityPage();
      await quantity.enterQuantity(testdata.quantities.small);
      await quantity.increaseQuantity(2);
      expect(await quantity.getEnteredQuantity()).toBe(testdata.quantities.small + 2);
    },
  );

  test(
    "decreasing quantity updates the entered value",
    {
      tag: ["@greenpan", "@regression"],
    },
    async () => {
      const quantity = po.getGreenpanQuantityPage();
      await quantity.enterQuantity(testdata.quantities.medium);
      await quantity.decreaseQuantity(2);
      expect(await quantity.getEnteredQuantity()).toBe(testdata.quantities.medium - 2);
    },
  );
});
