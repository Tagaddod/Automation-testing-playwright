import { test } from "@playwright/test";

import { PoManager } from "../../src/core/PoManager";
import { randomPhoneNumber } from "../../src/utils/testdata";
import testdata from "../../src/utils/testdata.json";
import {
  completeGreenpanRequestForExistingUser,
  completeGreenpanRequestForNewUser,
  openGreenpanHome,
} from "./greenpanFlows";

test.describe("GreenPan request success page", () => {
  test.describe.configure({ timeout: 300_000 });

  let po: PoManager;

  test.beforeEach(async ({ page }) => {
    po = new PoManager(page);
    await openGreenpanHome(po);
  });

  test(
    "success page is shown after existing user completes request",
    {
      tag: ["@greenpan", "@create-request", "@regression"],
    },
    async () => {
      await completeGreenpanRequestForExistingUser(
        po,
        testdata.phones.validUser,
        testdata.quantities.medium,
      );
      await po.getGreenpanRequestSuccessPage().assertPageVisible();
    },
  );

  test(
    "success page is shown after new user completes request with address",
    {
      tag: ["@greenpan", "@create-request", "@regression"],
    },
    async () => {
      await completeGreenpanRequestForNewUser(
        po,
        testdata.addresses.cairo,
        randomPhoneNumber(),
        testdata.quantities.medium,
      );
      await po.getGreenpanRequestSuccessPage().assertPageVisible();
    },
  );
});
