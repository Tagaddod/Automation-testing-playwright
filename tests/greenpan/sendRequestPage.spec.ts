import { expect, test } from "@playwright/test";

import { PoManager } from "../../src/core/PoManager";
import testdata from "../../src/utils/testdata.json";
import { goToSendRequestStepForExistingUser } from "./greenpanFlows";

test.describe("GreenPan send request page", () => {
  test.describe.configure({ timeout: 180_000 });

  let po: PoManager;

  test.beforeEach(async ({ page }) => {
    po = new PoManager(page);
    await goToSendRequestStepForExistingUser(
      po,
      testdata.phones.validUser,
      testdata.quantities.medium,
    );
  });

  test(
    "send request page fields are visible",
    {
      tag: ["@greenpan", "@regression"],
    },
    async () => {
      const send = po.getGreenpanSendRequestPage();
      await send.assertPageVisible();
      await expect(send.sendRequestButton).toBeVisible();
    },
  );

  test(
    "existing user can open change address and add a new address",
    {
      tag: ["@greenpan", "@regression"],
    },
    async ({ page }) => {
      const send = po.getGreenpanSendRequestPage();
      const address = po.getGreenpanAddressPage();
      const updatedAddress = {
        ...testdata.addresses.cairo,
        street: `auto-street-${Date.now()}`,
        building: "9",
        apartment: "3",
        floor: "2",
        clientName: "Haidy Change",
      };

      await send.changeToNewAddress();
      await address.completeAddressStep(updatedAddress);
      await send.assertPageVisible();
      await expect(page.getByText(updatedAddress.street)).toBeVisible({ timeout: 20_000 });
    },
  );

  test(
    "selecting day and submitting shows success page",
    {
      tag: ["@greenpan", "@create-request", "@regression"],
    },
    async () => {
      await po.getGreenpanSendRequestPage().completeSendRequestStep();
      await po.getGreenpanRequestSuccessPage().assertPageVisible();
    },
  );
});
