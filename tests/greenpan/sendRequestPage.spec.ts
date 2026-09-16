import { expect, test } from "@playwright/test";

import { PoManager } from "../../src/core/PoManager";
import { testdata } from "../../src/utils/testdata";
import { goToSendRequestStep } from "./greenpanFlows";

test.describe("GreenPan send request page", () => {
  test.describe.configure({ timeout: 180_000 });

  let po: PoManager;

  test.beforeEach(async ({ page }) => {
    po = new PoManager(page);
    await goToSendRequestStep(po);
  });

  test(
    "order page fields are visible",
    {
      tag: ["@all-regression", "@greenpan-regression-UI"],
    },
    async () => {
      const send = po.getGreenpanSendRequestPage();
      await send.assertPageVisible();
      await expect(send.sendRequestButton).toBeVisible();
      await expect(send.giftsHeading).toBeVisible();
      await expect(send.notesInput).toBeVisible();
      await expect(send.addNewAddressButton).toBeVisible();
    },
  );

  test(
    "submit stays disabled without a pickup day and gift",
    {
      tag: ["@all-regression", "@greenpan-regression-UI"],
    },
    async () => {
      const send = po.getGreenpanSendRequestPage();
      await expect(send.sendRequestButton).toBeDisabled();
    },
  );

  test(
    "submit stays disabled after selecting a day without a gift",
    {
      tag: ["@all-regression", "@greenpan-regression-UI"],
    },
    async () => {
      const send = po.getGreenpanSendRequestPage();
      await send.selectDay(0);
      await expect(send.sendRequestButton).toBeDisabled();
    },
  );

  test(
    "submit stays disabled after adding a gift without a pickup day",
    {
      tag: ["@all-regression", "@greenpan-regression-UI"],
    },
    async () => {
      const send = po.getGreenpanSendRequestPage();
      await send.addRequiredGift();
      await expect(send.sendRequestButton).toBeDisabled();
    },
  );

  test(
    "customer can add a new address from the order page",
    {
      tag: ["@all-regression", "@greenpan-regression-UI"],
    },
    async ({ page }) => {
      const send = po.getGreenpanSendRequestPage();
      const address = po.getGreenpanAddressPage();
      const updatedAddress = {
        ...testdata.greenpan.address,
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
    "selecting day, adding a gift, and submitting shows success page",
    {
      tag: ["@all-regression", "@greenpan-regression-UI", "@create-b2c-request-UI"],
    },
    async () => {
      await po.getGreenpanSendRequestPage().completeSendRequestStep(0, testdata.greenpan.notes);
      await expect(po.getGreenpanRequestSuccessPage().successHeading).toBeVisible({
        timeout: 60_000,
      });
    },
  );
});
