import { expect, test } from "@playwright/test";

import { PoManager } from "../../src/core/PoManager";
import { testdata } from "../../src/utils/testdata";
import { goToAddressStep } from "./greenpanFlows";

test.describe("GreenPan address page", () => {
  test.describe.configure({ timeout: 180_000 });

  let po: PoManager;

  test.beforeEach(async ({ page }) => {
    po = new PoManager(page);
    await goToAddressStep(po);
  });

  test(
    "address page fields are visible",
    { tag: ["@all-regression", "@greenpan-regression-UI"] },
    async () => {
      const address = po.getGreenpanAddressPage();
      await address.assertPageVisible();
      await expect(address.streetNameInput).toBeVisible();
      await expect(address.clientNameInput).toBeVisible();
      await expect(address.landmarkInput).toBeVisible();
    },
  );

  test(
    "empty address stays on the address step",
    {
      tag: ["@all-regression", "@greenpan-regression-UI"],
    },
    async ({ page }) => {
      const address = po.getGreenpanAddressPage();
      await address.addAddressButton.click();
      await expect(page.getByRole("heading", { name: "إضافة عنوان" })).toBeVisible();
      await expect(page).toHaveURL(/\/new\/address/);
    },
  );

  test(
    "address without street stays on the address step",
    {
      tag: ["@all-regression", "@greenpan-regression-UI"],
    },
    async ({ page }) => {
      const address = po.getGreenpanAddressPage();
      await address.fillAddressWithoutStreet(testdata.greenpan.address);
      await address.addAddressButton.click();
      await expect(page.getByRole("heading", { name: "إضافة عنوان" })).toBeVisible();
      await expect(page).toHaveURL(/\/new\/address/);
    },
  );

  test(
    "address without client name stays on the address step",
    {
      tag: ["@all-regression", "@greenpan-regression-UI"],
    },
    async ({ page }) => {
      const address = po.getGreenpanAddressPage();
      await address.fillAddressWithoutClientName(testdata.greenpan.address);
      await address.addAddressButton.click();
      await expect(page.getByRole("heading", { name: "إضافة عنوان" })).toBeVisible();
      await expect(page).toHaveURL(/\/new\/address/);
    },
  );

  test(
    "filling address proceeds to send request step",
    {
      tag: ["@all-regression", "@greenpan-regression-UI"],
    },
    async () => {
      await po.getGreenpanAddressPage().completeAddressStep(testdata.greenpan.address);
      await po.getGreenpanSendRequestPage().assertPageVisible();
    },
  );
});
