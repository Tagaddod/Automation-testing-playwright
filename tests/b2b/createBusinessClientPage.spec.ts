import { expect, test } from "@playwright/test";

import { PoManager } from "../../src/core/PoManager";
import { getB2bTestData, randomBranchName } from "../../src/utils/testdata";
import {
  goToBranchFormForExistingClient,
  goToCreateBusinessClientStep,
  openB2BHome,
  setupExistingClientWithFirstBranch,
} from "./b2bFlows";

test.describe("B2B create business client page", () => {
  test.describe.configure({ timeout: 300_000 });

  let po: PoManager;

  test.beforeEach(async ({ page }) => {
    po = new PoManager(page);
    await openB2BHome(po);
    await expect(page).not.toHaveURL(/\/auth/);
  });

  test("business client page fields are visible", { tag: ["@b2b", "@regression"] }, async () => {
    await goToCreateBusinessClientStep(po);
    const client = po.getB2BCreateBusinessClientPage();
    await client.assertPageVisible();
    await client.addNewClient(randomBranchName());
    await client.assertNewClientFieldsVisible();
  });

  test(
    "add new client with english name and business type proceeds to form",
    {
      tag: ["@b2b", "@regression"],
    },
    async () => {
      const branchName = randomBranchName();
      await goToCreateBusinessClientStep(po);
      await po.getB2BCreateBusinessClientPage().completeNewClientStep(branchName);
      await po.getB2BBranchFormPage().assertPageVisible();
    },
  );

  test(
    "select existing client proceeds to branch form",
    {
      tag: ["@b2b", "@regression"],
    },
    async () => {
      const { clientName, clientId } = await setupExistingClientWithFirstBranch(po);
      const branchData = getB2bTestData();

      await goToBranchFormForExistingClient(po, clientName, clientId);
      await po.getB2BBranchFormPage().fillForm(branchData, { freshProduct: true, usedOil: true });
      await po.getB2BBranchFormPage().submit({ waitForSuccess: true });
      await po.getB2BBranchConfirmationPage().assertPageVisible();
    },
  );

  test(
    "english name is required for new client flow",
    { tag: ["@b2b", "@regression"] },
    async () => {
      const branchName = randomBranchName();
      await goToCreateBusinessClientStep(po);
      const client = po.getB2BCreateBusinessClientPage();
      await client.addNewClient(branchName);
      await client.selectBusinessType();
      await client.clickNext();
      await client.assertEnglishNameRequired();
    },
  );
});
