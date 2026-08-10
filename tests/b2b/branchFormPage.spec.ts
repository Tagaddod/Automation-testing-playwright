import { expect, test } from "@playwright/test";

import { PoManager } from "../../src/core/PoManager";
import {
  getB2bTestData,
  randomBranchName,
  randomPhoneNumber,
  testdata,
} from "../../src/utils/testdata";
import {
  branchWithCollectablesAndFreshProduct,
  completeB2BCreateNewBranchFlow,
  goToBranchFormStep,
  openB2BHome,
} from "./b2bFlows";

test.describe("B2B branch form page", () => {
  test.describe.configure({ timeout: 300_000 });

  let po: PoManager;

  test.beforeEach(async ({ page }) => {
    po = new PoManager(page);
    await openB2BHome(po);
    await expect(page).not.toHaveURL(/\/auth/);
  });

  test(
    "branch form page fields are visible",
    { tag: ["@b2b", "@smoke", "@regression"] },
    async () => {
      await goToBranchFormStep(po, randomBranchName());
      await po.getB2BBranchFormPage().assertPageVisible();
    },
  );

  test(
    "fresh product checkbox is selected by default",
    { tag: ["@b2b", "@regression"] },
    async () => {
      await goToBranchFormStep(po, randomBranchName());
      const form = po.getB2BBranchFormPage();
      await form.fillPhoneNumber(randomPhoneNumber());
      await form.fillCountryCode();
      await form.fillAddress(testdata.b2b.address);
      await form.assertFreshProductSelectedByDefault();
    },
  );

  test(
    "should show error when phone number is invalid",
    { tag: ["@b2b", "@regression"] },
    async ({ page }) => {
      await goToBranchFormStep(po, randomBranchName());
      const form = po.getB2BBranchFormPage();
      await form.fillForm({ phone: "", address: testdata.b2b.address });
      await form.submit();
      await expect(form.phoneErrorMessage).toHaveText(testdata.b2b.errors.phoneRequired);
      await expect(page.getByRole("button", { name: "إضافة فرع" })).toBeVisible();
    },
  );

  test("show error when country code is missing", { tag: ["@b2b", "@regression"] }, async () => {
    await goToBranchFormStep(po, randomBranchName());
    const form = po.getB2BBranchFormPage();
    await form.fillPhoneNumber(randomPhoneNumber());
    await form.submit();
    await expect(form.countryCodeErrorMessage).toHaveText(testdata.b2b.errors.countryCodeRequired);
  });

  test("show error when address is missing", { tag: ["@b2b", "@regression"] }, async () => {
    await goToBranchFormStep(po, randomBranchName());
    const form = po.getB2BBranchFormPage();
    await form.fillPhoneNumber(randomPhoneNumber());
    await form.fillCountryCode();
    await form.submit();
    await expect(form.addressErrorMessage).toHaveText(testdata.b2b.errors.addressRequired);
  });

  test(
    "show error when no collectables type is selected",
    { tag: ["@b2b", "@regression"] },
    async () => {
      await goToBranchFormStep(po, randomBranchName());
      const form = po.getB2BBranchFormPage();
      await form.fillPhoneNumber(randomPhoneNumber());
      await form.fillCountryCode();
      await form.fillAddress(testdata.b2b.address);
      await form.setWasteTypeChecked(testdata.b2b.wasteTypes.freshProduct, false);
      await form.submit();
      await expect(form.collectablesTypeErrorMessage).toBeVisible();
    },
  );

  test("show error when payment method is missing", { tag: ["@b2b", "@regression"] }, async () => {
    await goToBranchFormStep(po, randomBranchName());
    const form = po.getB2BBranchFormPage();
    await form.fillPhoneNumber(randomPhoneNumber());
    await form.fillCountryCode();
    await form.fillAddress(testdata.b2b.address);
    await form.configureWasteTypes(branchWithCollectablesAndFreshProduct);
    await form.submit();
    await expect(form.paymentMethodErrorMessage).toHaveText(
      testdata.b2b.errors.paymentMethodRequired,
    );
  });

  test("show error when branch photo is missing", { tag: ["@b2b", "@regression"] }, async () => {
    await goToBranchFormStep(po, randomBranchName());
    const form = po.getB2BBranchFormPage();
    await form.fillPhoneNumber(randomPhoneNumber());
    await form.fillCountryCode();
    await form.fillAddress(testdata.b2b.address);
    await form.configureWasteTypes(branchWithCollectablesAndFreshProduct);
    await form.selectPaymentMethod();
    await form.submit();
    await expect(form.photoErrorMessage).toHaveText(testdata.b2b.errors.photoRequired);
  });

  test(
    "create new client and branch with collectables and fresh product",
    {
      tag: ["@b2b", "@smoke", "@regression", "@e2e"],
    },
    async () => {
      await completeB2BCreateNewBranchFlow(
        po,
        getB2bTestData(),
        branchWithCollectablesAndFreshProduct,
      );
      await po.getB2BBranchConfirmationPage().assertPageVisible();
    },
  );
});
