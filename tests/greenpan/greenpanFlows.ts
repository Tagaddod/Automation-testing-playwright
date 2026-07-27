import { expect } from "@playwright/test";

import type { PoManager } from "../../src/core/PoManager";
import type { GreenpanAddressData } from "../../src/pages/greenpan/addressPage";
import { randomPhoneNumber } from "../../src/utils/testdata";
import testdata from "../../src/utils/testdata.json";

async function recoverFromOops(po: PoManager) {
  const page = po.getPage();
  const oops = page.getByRole("heading", { name: "Oops!" });
  if (await oops.isVisible({ timeout: 1_000 }).catch(() => false)) {
    await page.getByRole("link", { name: "Go back home" }).click();
    await po.getGreenpanHomePage().assertPageVisible();
    return true;
  }
  return false;
}

export async function openGreenpanHome(po: PoManager) {
  await po.getGreenpanHomePage().open();
  await po.getGreenpanHomePage().assertPageVisible();
}

export async function goToQuantityStep(po: PoManager, phone: string) {
  for (let attempt = 0; attempt < 3; attempt++) {
    await openGreenpanHome(po);
    await po.getGreenpanHomePage().completePhoneStep(phone);

    if (
      await po
        .getGreenpanQuantityPage()
        .quantityInput.isVisible({ timeout: 20_000 })
        .catch(() => false)
    ) {
      await po.getGreenpanQuantityPage().assertPageVisible();
      return;
    }

    if (await recoverFromOops(po)) {
      continue;
    }
  }

  await po.getGreenpanQuantityPage().assertPageVisible();
}

export async function goToGiftsStep(
  po: PoManager,
  phone = testdata.phones.validUser,
  quantity = testdata.quantities.medium,
) {
  await goToQuantityStep(po, phone);
  await po.getGreenpanQuantityPage().completeQuantityStep(quantity);
  await expect(po.getGreenpanQuantityPage().rewardsText).toBeVisible({ timeout: 20_000 });
  await po.getGreenpanGiftsPage().assertPageVisible();
}

export async function goToAddressStep(
  po: PoManager,
  phone = randomPhoneNumber(),
  quantity = testdata.quantities.medium,
) {
  await goToGiftsStep(po, phone, quantity);
  await po.getGreenpanGiftsPage().completeGiftsStep(0);

  const page = po.getPage();
  const addressHeading = page.getByRole("heading", { name: "إضافة عنوان" });
  const send = po.getGreenpanSendRequestPage();

  await expect(addressHeading.or(send.sendRequestButton).first()).toBeVisible({
    timeout: 45_000,
  });

  if (await send.sendRequestButton.isVisible().catch(() => false)) {
    throw new Error(
      `Expected address step for new phone ${phone}, but reached send-request step (phone may already exist).`,
    );
  }

  await po.getGreenpanAddressPage().assertPageVisible();
}

export async function goToSendRequestStepForExistingUser(
  po: PoManager,
  phone = testdata.phones.validUser,
  quantity = testdata.quantities.medium,
) {
  await goToGiftsStep(po, phone, quantity);
  await po.getGreenpanGiftsPage().completeGiftsStep(0);
  await po.getGreenpanSendRequestPage().assertPageVisible();
}

export async function goToSendRequestStepForNewUser(
  po: PoManager,
  address: GreenpanAddressData = testdata.addresses.cairo,
  phone = randomPhoneNumber(),
  quantity = testdata.quantities.medium,
) {
  await goToAddressStep(po, phone, quantity);
  await po.getGreenpanAddressPage().completeAddressStep(address);
  await po.getGreenpanSendRequestPage().assertPageVisible();
}

export async function completeGreenpanRequestForExistingUser(
  po: PoManager,
  phone = testdata.phones.validUser,
  quantity = testdata.quantities.medium,
) {
  await goToSendRequestStepForExistingUser(po, phone, quantity);
  await po.getGreenpanSendRequestPage().completeSendRequestStep();
  await po.getGreenpanRequestSuccessPage().assertPageVisible();
}

export async function completeGreenpanRequestForNewUser(
  po: PoManager,
  address: GreenpanAddressData = testdata.addresses.cairo,
  phone = randomPhoneNumber(),
  quantity = testdata.quantities.medium,
) {
  await goToSendRequestStepForNewUser(po, address, phone, quantity);
  await po.getGreenpanSendRequestPage().completeSendRequestStep();
  await po.getGreenpanRequestSuccessPage().assertPageVisible();
}
