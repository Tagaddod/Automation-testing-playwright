import { test, expect } from "@playwright/test";
import { PoManager } from "../../src/core/PoManager";
import { getB2xTestData, testdata } from "../../src/utils/testdata";
import { goToCollectablesStepWithWarehouse, goToTraderForm, openB2XHome, submitTraderAndProceedToCollectables } from "./b2xFlows";

test.describe("B2X create trader request", () => {
  test("create full trader request end to end (no warehouse)", { tag: ["@b2x", "@smoke", "@e2e"] }, async ({ page }) => {
    const po = new PoManager(page);
    const data = getB2xTestData();

    await goToTraderForm(po, data.traderName);
    await po.getB2XFormPage().completeTraderForm(data);
    await submitTraderAndProceedToCollectables(po, data.traderName);
    await po.getB2XCollectablePage().completeCollectablesStep(data.pricePerKilo, data.quantity);
    await po.getB2XRequestDetailsPage().completeRequestDetailsStep();

    await expect(po.getB2XRequestDetailsPage().successHeading).toBeVisible({ timeout: 60_000 });
  });

  test("create full trader request with warehouse", { tag: ["@b2x", "@regression", "@e2e"] }, async ({ page }) => {
    const po = new PoManager(page);
    const data = getB2xTestData();

    await goToTraderForm(po, data.traderName);
    await po.getB2XFormPage().completeTraderFormWithWarehouse(data);
    await submitTraderAndProceedToCollectables(po, data.traderName);
    await po.getB2XCollectablePage().completeCollectablesStep(data.pricePerKilo, data.quantity);
    await po.getB2XRequestDetailsPage().completeRequestDetailsStep();

    await expect(po.getB2XRequestDetailsPage().successHeading).toBeVisible({ timeout: 60_000 });
  });

  test("create request for existing trader", { tag: ["@b2x", "@regression", "@e2e"] }, async ({ page }) => {
    const po = new PoManager(page);
    const data = getB2xTestData();

    await openB2XHome(po);
    await po.getB2XHomePage().searchExistTrader(testdata.b2x.existingTraderName);
    await expect(page.getByRole("heading", { name: "أدخل الكميات" })).toBeVisible({ timeout: 30_000 });
    await po.getB2XCollectablePage().completeCollectablesStep(data.pricePerKilo, data.quantity);
    await po.getB2XRequestDetailsPage().completeRequestDetailsStep();

    await expect(po.getB2XRequestDetailsPage().successHeading).toBeVisible({ timeout: 60_000 });
  });

  test("create request with warehouse trader and notes", { tag: ["@b2x", "@regression", "@e2e"] }, async ({ page }) => {
    const po = new PoManager(page);
    const data = await goToCollectablesStepWithWarehouse(po);

    await po.getB2XCollectablePage().completeCollectablesStep(data.pricePerKilo, data.quantity);
    const details = po.getB2XRequestDetailsPage();
    await details.fillPickupDate();
    await details.selectPickupTime(details.afternoonTime);
    await details.selectDeliveryMethod(details.deliverToWarehouse);
    await details.selectWarehouseType();
    await details.fillNotes(data.notes);
    await details.clickSubmit();

    await expect(details.successHeading).toBeVisible({ timeout: 60_000 });
  });
});
