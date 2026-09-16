import { expect, test } from "@playwright/test";

import { PoManager } from "../../src/core/PoManager";
import { getB2bTestData, testdata } from "../../src/utils/testdata";
import {
  branchWithCollectablesAndFreshProduct,
  completeB2BCreateNewBranchFlow,
  createBranchThenOpenRequest,
  openB2BHome,
  openRequestForBranchWithFp,
  selectBranchForExistingClientRequest,
} from "./b2bFlows";

test.describe("B2B request materials page", () => {
  test.describe.configure({ timeout: 300_000 });

  let po: PoManager;
  const quantity = testdata.b2b.requestQuantity;

  test.beforeEach(async ({ page }) => {
    po = new PoManager(page);
    await openB2BHome(po);
    await expect(page).not.toHaveURL(/\/auth/);
  });

  test(
    "materials page is visible after starting a request",
    { tag: ["@all-regression", "@b2b-regression-UI"] },
    async () => {
      await openRequestForBranchWithFp(po);
      await po.getB2BRequestMaterialsPage().assertPageVisible();
    },
  );

  test(
    "cannot proceed without selecting any material",
    { tag: ["@all-regression", "@b2b-regression-UI"] },
    async () => {
      await openRequestForBranchWithFp(po);
      const materials = po.getB2BRequestMaterialsPage();
      await materials.clickNext();
      await expect(materials.materialsRequiredError).toBeVisible();
      await expect(materials.materialsRequiredError).toHaveText(
        testdata.b2b.errors.materialsRequired,
      );
    },
  );

  test(
    "fresh products section is visible when branch supports supermarket products",
    {
      tag: ["@all-regression", "@b2b-regression-UI"],
    },
    async () => {
      await createBranchThenOpenRequest(po);
      const materials = po.getB2BRequestMaterialsPage();
      await expect(materials.freshProductsGroup).toBeVisible();
      await expect(materials.addCollectableButton).toBeVisible();
    },
  );

  test(
    "used oil quantity can be increased",
    { tag: ["@all-regression", "@b2b-regression-UI"] },
    async () => {
      await createBranchThenOpenRequest(po);
      const materials = po.getB2BRequestMaterialsPage();
      await materials.addUsedOilCollectable();
      await materials.increaseUsedOilQuantity(quantity);
      await expect(materials.usedOilQuantityInput()).toHaveValue(String(quantity));
    },
  );

  test(
    "create request with collectables only",
    { tag: ["@all-regression", "@b2b-regression-UI"] },
    async () => {
      await createBranchThenOpenRequest(po);
      await po.getB2BRequestMaterialsPage().completeUsedOilOnlyStep(quantity);
      await po.getB2BRequestDetailsPage().assertPageVisible();
    },
  );

  test(
    "create request with fresh products only",
    { tag: ["@all-regression", "@b2b-regression-UI"] },
    async () => {
      await createBranchThenOpenRequest(po);
      await po.getB2BRequestMaterialsPage().completeFreshProductOnlyStep(quantity);
      await po.getB2BRequestDetailsPage().assertPageVisible();
    },
  );

  test(
    "create request with fresh products and collectables",
    {
      tag: ["@all-regression", "@b2b-regression-UI"],
    },
    async () => {
      await createBranchThenOpenRequest(po);
      await po.getB2BRequestMaterialsPage().completeBothMaterialsStep(quantity);
      await po.getB2BRequestDetailsPage().assertPageVisible();
    },
  );

  test(
    "create request with multiple collectables and fresh products",
    {
      tag: ["@all-regression", "@b2b-regression-UI"],
    },
    async () => {
      await createBranchThenOpenRequest(po);
      await po
        .getB2BRequestMaterialsPage()
        .completeMultipleCollectablesAndFreshProductsStep(quantity);
      await po.getB2BRequestDetailsPage().assertPageVisible();
    },
  );

  test(
    "full request flow from new branch creation",
    { tag: ["@all-regression", "@b2b-regression-UI", "@create-b2b-request-UI"] },
    async () => {
      const data = getB2bTestData();
      await completeB2BCreateNewBranchFlow(po, data, branchWithCollectablesAndFreshProduct);
      await po.getB2BBranchConfirmationPage().clickRegisterBusinessRequest();
      await selectBranchForExistingClientRequest(po, data.branchName);
      await po.getB2BRequestMaterialsPage().completeUsedOilOnlyStep(quantity);
      const { requestId } = await po.getB2BRequestDetailsPage().completeRequestDetailsStep();
      expect(requestId, "create request did not return an id").toBeTruthy();
      console.warn(`Created B2B request id: ${requestId}`);
    },
  );
});
