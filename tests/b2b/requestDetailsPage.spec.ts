import { expect, test } from "@playwright/test";

import { PoManager } from "../../src/core/PoManager";
import { testdata } from "../../src/utils/testdata";
import {
  calculateFreshProductTotal,
  calculateNetTotal,
  calculateUsedOilTotal,
  createBranchThenOpenRequest,
  openB2BHome,
  openRequestForBranchWithFp,
  readFreshProductUnitPrice,
} from "./b2bFlows";

test.describe("B2B request details page", () => {
  test.describe.configure({ timeout: 300_000 });

  let po: PoManager;
  const quantity = testdata.b2b.requestQuantity;
  const oilUnitPrice = Number(testdata.b2b.usedOilPricePerKilo);

  test.beforeEach(async ({ page }) => {
    po = new PoManager(page);
    await openB2BHome(po);
    await expect(page).not.toHaveURL(/\/auth/);
  });

  test(
    "request details page fields are visible",
    { tag: ["@all-regression", "@b2b-regression-UI"] },
    async () => {
      await openRequestForBranchWithFp(po);
      await po.getB2BRequestMaterialsPage().completeBothMaterialsStep(quantity);
      await po.getB2BRequestDetailsPage().assertPageVisible();
    },
  );

  test(
    "collectables only shows amount paid to customer",
    { tag: ["@all-regression", "@b2b-regression-UI"] },
    async () => {
      await createBranchThenOpenRequest(po);
      await po.getB2BRequestMaterialsPage().completeUsedOilOnlyStep(quantity);

      const payToCustomer = calculateUsedOilTotal(quantity, oilUnitPrice);
      await po.getB2BRequestDetailsPage().assertPriceSummary({
        payToCustomer,
        total: payToCustomer,
      });
    },
  );

  test(
    "fresh products only shows amount client will pay",
    { tag: ["@all-regression", "@b2b-regression-UI"] },
    async () => {
      await createBranchThenOpenRequest(po);
      const unitPrice = await readFreshProductUnitPrice(po);
      await po.getB2BRequestMaterialsPage().completeFreshProductOnlyStep(quantity);

      const clientWillPay = calculateFreshProductTotal(quantity, unitPrice);
      await po.getB2BRequestDetailsPage().assertPriceSummary({
        clientWillPay,
        total: clientWillPay,
      });
    },
  );

  test(
    "both materials show pay to customer, client pay, and net total",
    {
      tag: ["@all-regression", "@b2b-regression-UI"],
    },
    async () => {
      await createBranchThenOpenRequest(po);
      const fpUnitPrice = await readFreshProductUnitPrice(po);
      await po.getB2BRequestMaterialsPage().completeBothMaterialsStep(quantity);

      const payToCustomer = calculateUsedOilTotal(quantity, oilUnitPrice);
      const clientWillPay = calculateFreshProductTotal(quantity, fpUnitPrice);
      const total = calculateNetTotal(payToCustomer, clientWillPay);

      await po.getB2BRequestDetailsPage().assertPriceSummary({
        payToCustomer,
        clientWillPay,
        total,
      });
    },
  );

  test(
    "price summary remains visible after selecting pickup date and time",
    {
      tag: ["@all-regression", "@b2b-regression-UI"],
    },
    async () => {
      await createBranchThenOpenRequest(po);
      await po.getB2BRequestMaterialsPage().completeBothMaterialsStep(quantity);
      const details = po.getB2BRequestDetailsPage();

      await details.fillPickupDate();
      await details.selectPickupTime();
      await expect(details.totalPriceHeading).toBeVisible();
      await expect(details.payToCustomerLabel).toBeVisible();
      await expect(details.clientWillPayLabel).toBeVisible();
      await expect(details.totalLabel).toBeVisible();
    },
  );

  test(
    "submit request shows success confirmation",
    { tag: ["@all-regression", "@b2b-regression-UI"] },
    async () => {
      await createBranchThenOpenRequest(po);
      await po.getB2BRequestMaterialsPage().completeUsedOilOnlyStep(quantity);
      await po.getB2BRequestDetailsPage().completeRequestDetailsStep();
    },
  );
});
