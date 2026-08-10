import { test } from "@playwright/test";

import { PoManager } from "../../src/core/PoManager";
import testdata from "../../src/utils/testdata.json";
import { openGreenpanHome } from "./greenpanFlows";

test.describe("GreenPan bundle package page", () => {
  let po: PoManager;

  test.beforeEach(async ({ page }) => {
    po = new PoManager(page);
    await openGreenpanHome(po);
  });

  test(
    "bundle package sheet opens from package card",
    {
      tag: ["@greenpan", "@smoke", "@regression"],
    },
    async () => {
      const bundle = po.getGreenpanBundlePackagePage();
      await bundle.openPackageCard();
      await bundle.assertSheetVisible();
    },
  );

  test(
    "valid phone in bundle sheet proceeds to quantity step",
    {
      tag: ["@greenpan", "@regression", "@e2e"],
    },
    async () => {
      await po.getGreenpanBundlePackagePage().completeBundlePhoneStep(testdata.phones.validUser);
      await po.getGreenpanQuantityPage().assertPageVisible();
    },
  );
});
