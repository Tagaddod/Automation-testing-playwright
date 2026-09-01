import { expect, test } from "@playwright/test";

import { PoManager } from "../../src/core/PoManager";
import { randomPhoneNumber } from "../../src/utils/testdata";
import testdata from "../../src/utils/testdata.json";
import { goToAddressStep } from "./greenpanFlows";

test.describe("GreenPan address page", () => {
  test.describe.configure({ timeout: 180_000 });

  let po: PoManager;

  test.beforeEach(async ({ page }) => {
    po = new PoManager(page);
    // Use a fresh phone so the address step is shown (saved numbers skip it).
    await goToAddressStep(po, randomPhoneNumber(), testdata.quantities.medium);
  });

  test("address page fields are visible", { tag: ["@greenpan", "@regression"] }, async () => {
    const address = po.getGreenpanAddressPage();
    await address.assertPageVisible();
    await expect(address.streetNameInput).toBeVisible();
    await expect(address.clientNameInput).toBeVisible();
  });

  test(
    "filling address proceeds to send request step",
    {
      tag: ["@greenpan", "@regression"],
    },
    async () => {
      await po.getGreenpanAddressPage().completeAddressStep(testdata.addresses.cairo);
      await po.getGreenpanSendRequestPage().assertPageVisible();
    },
  );
});
