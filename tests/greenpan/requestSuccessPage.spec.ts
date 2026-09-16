import { expect, test } from "@playwright/test";

import { PoManager } from "../../src/core/PoManager";
import { randomPhoneNumber, testdata } from "../../src/utils/testdata";
import { completeGreenpanRequest } from "./greenpanFlows";

test.describe("GreenPan request success page", () => {
  test.describe.configure({ timeout: 300_000 });

  let po: PoManager;
  let usedPhone: string;
  const address = testdata.greenpan.address;

  test.beforeEach(async ({ page }) => {
    po = new PoManager(page);
    usedPhone = await completeGreenpanRequest(po, address);
  });

  test(
    "confirmation screen fields are visible",
    {
      tag: ["@all-regression", "@greenpan-regression-UI"],
    },
    async () => {
      const success = po.getGreenpanRequestSuccessPage();
      await success.assertPageVisible();
      await success.assertCustomerFormVisible();
    },
  );

  test(
    "client name is prefilled from the address and cannot be edited",
    {
      tag: ["@all-regression", "@greenpan-regression-UI"],
    },
    async () => {
      await po.getGreenpanRequestSuccessPage().assertClientName(address.clientName);
    },
  );

  test(
    "primary phone from the request is shown",
    {
      tag: ["@all-regression", "@greenpan-regression-UI"],
    },
    async () => {
      await po.getGreenpanRequestSuccessPage().assertPrimaryPhone(usedPhone);
    },
  );

  test(
    "additional phone can be filled",
    {
      tag: ["@all-regression", "@greenpan-regression-UI"],
    },
    async () => {
      await po.getGreenpanRequestSuccessPage().fillAdditionalPhone(randomPhoneNumber());
    },
  );

  test(
    "gender can be selected",
    {
      tag: ["@all-regression", "@greenpan-regression-UI"],
    },
    async () => {
      const success = po.getGreenpanRequestSuccessPage();
      await success.selectGender("male");
      await success.selectGender("female");
    },
  );

  test(
    "birth date picker opens",
    {
      tag: ["@all-regression", "@greenpan-regression-UI"],
    },
    async () => {
      await po.getGreenpanRequestSuccessPage().openBirthDatePicker();
    },
  );

  test(
    "how did you know source can be selected",
    {
      tag: ["@all-regression", "@greenpan-regression-UI"],
    },
    async () => {
      await po.getGreenpanRequestSuccessPage().selectHowDidYouKnow();
    },
  );

  test(
    "save without extra customer data keeps the confirmation visible",
    {
      tag: ["@all-regression", "@greenpan-regression-UI"],
    },
    async () => {
      const success = po.getGreenpanRequestSuccessPage();
      await success.saveCustomerData();
      await expect(success.successHeading).toBeVisible();
      await expect(success.customerDataHeading).toBeVisible();
    },
  );

  test(
    "save customer data keeps the confirmation visible",
    {
      tag: ["@all-regression", "@greenpan-regression-UI"],
    },
    async () => {
      const success = po.getGreenpanRequestSuccessPage();
      await success.fillAdditionalPhone(randomPhoneNumber());
      await success.selectGender("male");
      await success.saveCustomerData();
      await expect(success.successHeading).toBeVisible();
      await expect(success.customerDataHeading).toBeVisible();
    },
  );

  test(
    "home button returns to the agent phone step",
    {
      tag: ["@all-regression", "@greenpan-regression-UI"],
    },
    async () => {
      await po.getGreenpanRequestSuccessPage().goHome();
      await po.getGreenpanHomePage().assertPageVisible();
    },
  );
});
