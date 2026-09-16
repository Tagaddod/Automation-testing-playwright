import { expect, test } from "@playwright/test";

import { PoManager } from "../../src/core/PoManager";
import { testdata } from "../../src/utils/testdata";
import { goToQuantityStep } from "./greenpanFlows";

test.describe("GreenPan quantity page", () => {
  test.describe.configure({ timeout: 120_000 });

  let po: PoManager;

  test.beforeEach(async ({ page }) => {
    po = new PoManager(page);
    await goToQuantityStep(po);
  });

  test(
    "quantity page fields are visible",
    { tag: ["@all-regression", "@greenpan-regression-UI"] },
    async () => {
      await po.getGreenpanQuantityPage().assertPageVisible();
    },
  );

  test(
    "empty quantity does not open the address step",
    {
      tag: ["@all-regression", "@greenpan-regression-UI"],
    },
    async () => {
      const quantity = po.getGreenpanQuantityPage();
      await quantity.enterQuantity("");
      await quantity.proceed();
      await expect(quantity.quantityInput).toBeVisible();
      await expect(po.getPage().getByRole("heading", { name: /إضافة عنوان/ })).toBeHidden();
    },
  );

  test(
    "quantity below minimum does not open the address step",
    {
      tag: ["@all-regression", "@greenpan-regression-UI"],
    },
    async () => {
      const quantity = po.getGreenpanQuantityPage();
      await quantity.completeQuantityStep(testdata.greenpan.quantities.belowMinimum);
      await expect(quantity.minQuantityError).toHaveText(
        testdata.greenpan.errors.quantityBelowMinimum,
      );
      await expect(quantity.quantityInput).toBeVisible();
      await expect(po.getPage().getByRole("heading", { name: /إضافة عنوان/ })).toBeHidden();
    },
  );

  test(
    "quantity at or above minimum opens the address step",
    {
      tag: ["@all-regression", "@greenpan-regression-UI"],
    },
    async () => {
      await po.getGreenpanQuantityPage().completeQuantityStep(testdata.greenpan.quantities.minimum);
      await po.getGreenpanAddressPage().assertPageVisible();
    },
  );

  test(
    "quantity with containers and barrels opens the address step",
    {
      tag: ["@all-regression", "@greenpan-regression-UI"],
    },
    async () => {
      const quantity = po.getGreenpanQuantityPage();
      await quantity.enterQuantity(testdata.greenpan.quantities.valid);
      await quantity.fillContainers(testdata.greenpan.containers);
      await quantity.fillBarrels(testdata.greenpan.barrels);
      await quantity.proceed();
      await po.getGreenpanAddressPage().assertPageVisible();
    },
  );

  test(
    "increasing quantity updates the entered value",
    {
      tag: ["@all-regression", "@greenpan-regression-UI"],
    },
    async () => {
      const quantity = po.getGreenpanQuantityPage();
      await quantity.enterQuantity(testdata.greenpan.quantities.belowMinimum);
      await quantity.increaseQuantity(2);
      expect(await quantity.getEnteredQuantity()).toBe(
        testdata.greenpan.quantities.belowMinimum + 2,
      );
    },
  );

  test(
    "decreasing quantity updates the entered value",
    {
      tag: ["@all-regression", "@greenpan-regression-UI"],
    },
    async () => {
      const quantity = po.getGreenpanQuantityPage();
      await quantity.enterQuantity(testdata.greenpan.quantities.valid);
      await quantity.decreaseQuantity(2);
      expect(await quantity.getEnteredQuantity()).toBe(testdata.greenpan.quantities.valid - 2);
    },
  );
});
