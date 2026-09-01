import { expect, test } from "@playwright/test";

import { PoManager } from "../../src/core/PoManager";
import testdata from "../../src/utils/testdata.json";
import { goToGiftsStep } from "./greenpanFlows";

test.describe("GreenPan gifts page", () => {
  test.describe.configure({ timeout: 180_000 });

  test.describe("with medium quantity", () => {
    let po: PoManager;

    test.beforeEach(async ({ page }) => {
      po = new PoManager(page);
      await goToGiftsStep(po, testdata.phones.validUser, testdata.quantities.medium);
    });

    test("gifts page fields are visible", { tag: ["@greenpan", "@regression"] }, async () => {
      await po.getGreenpanGiftsPage().assertPageVisible();
    });

    test(
      "remaining points match entered quantity before adding gifts",
      {
        tag: ["@greenpan", "@regression"],
      },
      async () => {
        const remaining = await po.getGreenpanGiftsPage().getRemainingPoints();
        expect(remaining).toBe(testdata.quantities.medium);
      },
    );

    test(
      "adding a gift deducts remaining points",
      {
        tag: ["@greenpan", "@regression"],
      },
      async () => {
        const gifts = po.getGreenpanGiftsPage();
        const before = await gifts.getRemainingPoints();
        await gifts.addGift(0);
        await expect
          .poll(async () => gifts.getRemainingPoints(), { timeout: 15_000 })
          .toBeLessThan(before);
      },
    );

    test(
      "next proceeds to send request for existing user",
      {
        tag: ["@greenpan", "@regression"],
      },
      async () => {
        await po.getGreenpanGiftsPage().completeGiftsStep(0);
        await po.getGreenpanSendRequestPage().assertPageVisible();
      },
    );
  });

  test(
    "increasing gift quantity updates selected gift count",
    {
      tag: ["@greenpan", "@regression"],
    },
    async ({ page }) => {
      const po = new PoManager(page);
      await goToGiftsStep(po, testdata.phones.validUser, testdata.quantities.large);
      const gifts = po.getGreenpanGiftsPage();
      // Cheaper gift (index 3) leaves enough points to increase quantity.
      await gifts.addGift(3);
      await expect.poll(async () => gifts.getSelectedGiftQuantity()).toBe(1);
      await gifts.increaseGiftQuantity(1);
      await expect.poll(async () => gifts.getSelectedGiftQuantity()).toBe(2);
    },
  );

  test(
    "decreasing gift quantity updates selected gift count",
    {
      tag: ["@greenpan", "@regression"],
    },
    async ({ page }) => {
      const po = new PoManager(page);
      await goToGiftsStep(po, testdata.phones.validUser, testdata.quantities.large);
      const gifts = po.getGreenpanGiftsPage();
      await gifts.addGift(3);
      await gifts.increaseGiftQuantity(1);
      await expect.poll(async () => gifts.getSelectedGiftQuantity()).toBe(2);
      await gifts.decreaseGiftQuantity(1);
      await expect.poll(async () => gifts.getSelectedGiftQuantity()).toBe(1);
    },
  );

  test(
    "insufficient points button appears when points are exhausted",
    {
      tag: ["@greenpan", "@regression"],
    },
    async ({ page }) => {
      const po = new PoManager(page);
      await goToGiftsStep(po, testdata.phones.validUser, 6);
      const gifts = po.getGreenpanGiftsPage();
      await gifts.addGift(3);
      await gifts.increaseGiftQuantity(3);
      const lockButton = gifts.insufficientPointsButtonAt(2);
      await expect(lockButton).toBeVisible();
      await expect(lockButton).toBeDisabled();
    },
  );
});
