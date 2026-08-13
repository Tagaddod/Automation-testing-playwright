import { expect, test } from "@playwright/test";

import { PoManager } from "../../src/core/PoManager";
import { getB2bTestData } from "../../src/utils/testdata";
import {
  completeB2BCreateNewBranchFlow,
  openB2BHome,
  selectBranchForExistingClientRequest,
} from "./b2bFlows";

test.describe("B2B branch confirmation page", () => {
  test.describe.configure({ timeout: 300_000 });

  let po: PoManager;

  test.beforeEach(async ({ page }) => {
    po = new PoManager(page);
    await openB2BHome(po);
    await expect(page).not.toHaveURL(/\/auth/);
  });

  test(
    "confirmation page is shown after successful branch creation",
    {
      tag: ["@b2b", "@regression"],
    },
    async () => {
      await completeB2BCreateNewBranchFlow(po, getB2bTestData());
      const confirmation = po.getB2BBranchConfirmationPage();
      await confirmation.assertPageVisible();
      await expect(confirmation.registerBusinessRequestLink).toBeVisible();
    },
  );

  test(
    "register business request link opens materials step",
    {
      tag: ["@b2b", "@regression"],
    },
    async () => {
      const data = getB2bTestData();
      await completeB2BCreateNewBranchFlow(po, data);
      await po.getB2BBranchConfirmationPage().clickRegisterBusinessRequest();
      await selectBranchForExistingClientRequest(po, data.branchName);
      await po.getB2BRequestMaterialsPage().assertPageVisible();
    },
  );
});
