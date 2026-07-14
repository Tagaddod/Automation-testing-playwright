import { test, expect } from "@playwright/test";
import { PoManager } from "../../src/core/PoManager";
import { getB2bTestData } from "../../src/utils/testdata";

test.describe("B2B create request", () => {
  let po: PoManager;

  test.beforeEach(async ({ page }) => {
    po = new PoManager(page);
    await po.getB2BHomePage().open();
    await expect(page).not.toHaveURL(/\/auth/);
  });

  test("create request for new branch", { tag: ["@b2b", "create b2b request", "@regression"] }, async ({ page }) => {
    const b2bData = getB2bTestData();

    await po.completeB2BCreateNewBranchFlow(b2bData);
    await po.getNewClientForm().registerBusinessRequestLink().click();
    await po.getB2BHomePage().open();
    await po.getB2BHomePage().selectBranch(b2bData.branchName);
    await po.getSendB2BRequestPage().CreateRequestFlow();
    await po.getRequestDetails().ClickEnterDateButton();
    await po.getRequestDetails().selectPickupTime();
    await po.getRequestDetails().ClickSubmitButton();
  });

  test("create request for branch that already has a request", { tag: ["@b2b", "@e2e", "@regression"] }, async ({ page }) => {
    await po.getB2BHomePage().selectBranch("test-branch-1781622277870-3949");
    await expect(page.getByText("الطلبات المفتوحة للفرع").first()).toBeVisible();
  });

  test("create request for branch dosn't exist", { tag: ["@b2b", "@e2e", "@regression"] }, async ({ page }) => {
    const home = po.getB2BHomePage();
    await home.clickSearch();
    await home.branchCombobox.fill("test-branch-1781622-3949");
    const noDataMessage = page
      .locator(".ant-select-dropdown")
      .last()
      .locator(".ant-empty-description");
    await expect(noDataMessage).toBeVisible();
  });

  
});
