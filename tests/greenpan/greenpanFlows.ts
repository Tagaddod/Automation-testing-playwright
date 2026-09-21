import { expect } from "@playwright/test";

import type { PoManager } from "../../src/core/PoManager";
import type { GreenpanAddressData } from "../../src/pages/greenpan/addressPage";
import { randomPhoneNumber, testdata } from "../../src/utils/testdata";

/**
 * Agent webform after `/auth?token=`:
 * /agent (phone) → quantity → address → /agent/:id/request/:id/new/order → success
 */
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

export async function goToQuantityStep(po: PoManager, phone = randomPhoneNumber()) {
  let currentPhone = phone;

  for (let attempt = 0; attempt < 5; attempt++) {
    await openGreenpanHome(po);
    await po.getGreenpanHomePage().completePhoneStep(currentPhone);

    const quantityInput = po.getGreenpanQuantityPage().quantityInput;
    const activeHeading = po.getPage().getByRole("heading", { name: /الطلبات النشطة/ });
    await expect(quantityInput.or(activeHeading).first())
      .toBeVisible({ timeout: 20_000 })
      .catch(() => undefined);

    if (await activeHeading.isVisible().catch(() => false)) {
      currentPhone = randomPhoneNumber();
      continue;
    }

    if (await quantityInput.isVisible().catch(() => false)) {
      await po.getGreenpanQuantityPage().assertPageVisible();
      return currentPhone;
    }

    if (await recoverFromOops(po)) {
      currentPhone = randomPhoneNumber();
      continue;
    }

    currentPhone = randomPhoneNumber();
  }

  await po.getGreenpanQuantityPage().assertPageVisible();
  return currentPhone;
}

export async function goToAddressStep(
  po: PoManager,
  quantity = testdata.greenpan.quantities.valid,
) {
  const usedPhone = await goToQuantityStep(po);
  await po.getGreenpanQuantityPage().completeQuantityStep(quantity);
  await po.getGreenpanAddressPage().assertPageVisible();
  return usedPhone;
}

export async function goToSendRequestStep(
  po: PoManager,
  address: GreenpanAddressData = testdata.greenpan.address,
  quantity = testdata.greenpan.quantities.valid,
) {
  const usedPhone = await goToAddressStep(po, quantity);
  await po.getGreenpanAddressPage().completeAddressStep(address);
  await po.getGreenpanSendRequestPage().assertPageVisible();
  return usedPhone;
}

export async function completeGreenpanRequest(
  po: PoManager,
  address: GreenpanAddressData = testdata.greenpan.address,
  quantity = testdata.greenpan.quantities.valid,
) {
  const usedPhone = await goToSendRequestStep(po, address, quantity);
  await po.getGreenpanSendRequestPage().completeSendRequestStep();
  await po.getGreenpanRequestSuccessPage().assertPageVisible();
  return usedPhone;
}
