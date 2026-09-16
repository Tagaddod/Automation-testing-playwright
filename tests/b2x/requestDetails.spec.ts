import { expect, test } from "@playwright/test";

import { PoManager } from "../../src/core/PoManager";
import { testdata } from "../../src/utils/testdata";
import { goToRequestDetailsStep } from "./b2xFlows";

test.describe("B2X request details", () => {
  let po: PoManager;

  test.beforeEach(async ({ page }) => {
    po = new PoManager(page);
    await goToRequestDetailsStep(po);
    await expect(page).not.toHaveURL(/\/auth/);
    await expect(po.getB2XRequestDetailsPage().collectionDetailsHeading).toBeVisible({
      timeout: 30_000,
    });
  });

  test(
    "submit request with valid data",
    { tag: ["@all-regression", "@b2x-regression-UI"] },
    async () => {
      await po.getB2XRequestDetailsPage().completeRequestDetailsStep();
      await expect(po.getB2XRequestDetailsPage().successHeading).toBeVisible({ timeout: 60_000 });
    },
  );

  test(
    "all request detail fields are visible",
    { tag: ["@all-regression", "@b2x-regression-UI"] },
    async () => {
      await po.getB2XRequestDetailsPage().assertAllFieldsVisible();
    },
  );

  test(
    "submit request with optional notes",
    { tag: ["@all-regression", "@b2x-regression-UI"] },
    async () => {
      const details = po.getB2XRequestDetailsPage();

      await details.fillPickupDate();
      await details.selectPickupTime();
      await details.selectDeliveryMethod();
      await details.fillNotes(testdata.b2x.notes);
      await details.clickSubmit();
      await expect(details.successHeading).toBeVisible({ timeout: 60_000 });
    },
  );

  test(
    "submit request with delivery to warehouse",
    { tag: ["@all-regression", "@b2x-regression-UI"] },
    async () => {
      const details = po.getB2XRequestDetailsPage();

      await details.fillPickupDate();
      await details.selectPickupTime();
      await details.selectDeliveryMethod(details.deliverToWarehouse);
      await details.selectWarehouseType();
      await details.clickSubmit();
      await expect(details.successHeading).toBeVisible({ timeout: 60_000 });
    },
  );

  test(
    "submit request with green pan representative",
    { tag: ["@all-regression", "@b2x-regression-UI"] },
    async () => {
      const details = po.getB2XRequestDetailsPage();

      await details.fillPickupDate();
      await details.selectPickupTime();
      await details.selectDeliveryMethod(details.greenPanRepDelivery);
      await details.clickSubmit();
      await expect(details.successHeading).toBeVisible({ timeout: 60_000 });
    },
  );

  test("select dawn pickup time", { tag: ["@all-regression", "@b2x-regression-UI"] }, async () => {
    const details = po.getB2XRequestDetailsPage();

    await details.fillPickupDate();
    await details.selectPickupTime(details.dawnTime);
    await details.selectDeliveryMethod();
    await details.clickSubmit();
    await expect(details.successHeading).toBeVisible({ timeout: 60_000 });
  });

  test(
    "select afternoon pickup time",
    { tag: ["@all-regression", "@b2x-regression-UI"] },
    async () => {
      const details = po.getB2XRequestDetailsPage();

      await details.fillPickupDate();
      await details.selectPickupTime(details.afternoonTime);
      await details.selectDeliveryMethod();
      await details.clickSubmit();
      await expect(details.successHeading).toBeVisible({ timeout: 60_000 });
    },
  );

  test(
    "select evening pickup time",
    { tag: ["@all-regression", "@b2x-regression-UI"] },
    async () => {
      const details = po.getB2XRequestDetailsPage();

      await details.fillPickupDate();
      await details.selectPickupTime(details.eveningTime);
      await details.selectDeliveryMethod();
      await details.clickSubmit();
      await expect(details.successHeading).toBeVisible({ timeout: 60_000 });
    },
  );

  test(
    "total price summary is visible before submit",
    { tag: ["@all-regression", "@b2x-regression-UI"] },
    async () => {
      const details = po.getB2XRequestDetailsPage();

      await expect(details.usedOilItem).toBeVisible();
      await expect(details.totalSummary).toBeVisible();
      await expect(details.pricePerKiloBadge).toBeVisible();
      await expect(details.quantityDisplay).toBeVisible();
    },
  );
});
