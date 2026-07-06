import { test, expect } from "@playwright/test";
import { PoManager } from "../../src/core/PoManager";
import { goToCollectablesStep, goToTraderForm, submitTraderAndProceedToCollectables } from "./b2xFlows";
import { getB2xTestData, testdata } from "../../src/utils/testdata";

test.describe("B2X collectables", () => {
  let po: PoManager;

  test.beforeEach(async ({ page }) => {
    po = new PoManager(page);
    await goToCollectablesStep(po);
    await expect(page).not.toHaveURL(/\/auth/);
    await expect(page.getByRole("heading", { name: "أدخل الكميات" })).toBeVisible({ timeout: 30_000 });
  });

  test("add collectable with price and quantity", { tag: ["@b2x", "@smoke", "@regression", "@e2e"] }, async ({ page }) => {
    const collectable = po.getB2XCollectablePage();

    await collectable.fillCollectableBlock(testdata.b2x.pricePerKilo, testdata.b2x.quantity, 0);
    await collectable.clickNext();
    await expect(page.getByText("تفاصيل التجميع")).toBeVisible({ timeout: 30_000 });
  });

  test("collectable materials are visible on collectables page", { tag: ["@b2x", "@regression"] }, async () => {
    await expect(po.getB2XCollectablePage().materialsGroup).toBeVisible();
    await expect(po.getB2XCollectablePage().materialsGroup.getByRole("heading", { level: 3 }).first()).toBeVisible();
  });

  test("increase first quantity updates count", { tag: ["@b2x", "@regression"] }, async () => {
    const collectable = po.getB2XCollectablePage();

    await collectable.addCollectable(0);
    await collectable.increaseQuantity(3, 0);
    await expect(collectable.usedOilQuantityInput(0)).toHaveValue("3");
  });

  test("decrease first quantity updates count", { tag: ["@b2x", "@regression"] }, async () => {
    const collectable = po.getB2XCollectablePage();

    await collectable.addCollectable(0);
    await collectable.increaseQuantity(3, 0);
    await collectable.decreaseQuantity(1, 0);
    await expect(collectable.usedOilQuantityInput(0)).toHaveValue("2");
  });

  test("cannot proceed without adding collectable", { tag: ["@b2x", "@regression"] }, async ({ page }) => {
    await po.getB2XCollectablePage().clickNext();
    await expect(page.getByRole("heading", { name: "أدخل الكميات" })).toBeVisible();
  });

  test("cannot proceed without price per kilo", { tag: ["@b2x", "@regression"] }, async ({ page }) => {
    const collectable = po.getB2XCollectablePage();

    await collectable.addCollectable(0);
    await collectable.increaseQuantity(1, 0);
    await collectable.clickNext();
    await expect(page.getByRole("heading", { name: "أدخل الكميات" })).toBeVisible();
  });

  test("cannot proceed with zero quantity", { tag: ["@b2x", "@regression"] }, async ({ page }) => {
    const collectable = po.getB2XCollectablePage();

    await collectable.addCollectable(0);
    await collectable.fillPricePerKilo(testdata.b2x.pricePerKilo, 0);
    await collectable.clickNext();
    await expect(page.getByRole("heading", { name: "أدخل الكميات" })).toBeVisible();
  });

  test("collect with only one collectable", { tag: ["@b2x", "@smoke", "@regression", "@e2e"] }, async ({ page }) => {
    const collectable = po.getB2XCollectablePage();

    await collectable.fillCollectableBlock(testdata.b2x.pricePerKilo, 1, 0);
    await collectable.clickNext();
    await expect(page.getByText("تفاصيل التجميع")).toBeVisible({ timeout: 30_000 });
  });

  test("collect with more than one collectable", { tag: ["@b2x", "@regression", "@e2e"] }, async ({ page }) => {
    const data = getB2xTestData();
    await goToTraderForm(po, data.traderName);
    await po.getB2XFormPage().completeTraderForm(data, ["زيت مستعمل", "أحماض دهنية"]);
    await submitTraderAndProceedToCollectables(po, data.traderName);
    await expect(page.getByRole("heading", { name: "أدخل الكميات" })).toBeVisible({ timeout: 30_000 });

    const collectable = po.getB2XCollectablePage();

    await collectable.fillCollectableBlock(testdata.b2x.pricePerKilo, testdata.b2x.quantity, 0);
    await collectable.fillCollectableBlock(testdata.b2x.secondaryPricePerKilo, 1, 1);
    await expect(collectable.materialHeadings()).toHaveCount(2);
    await collectable.clickNext();

    await expect(page.getByText("تفاصيل التجميع")).toBeVisible({ timeout: 30_000 });
  });
});
