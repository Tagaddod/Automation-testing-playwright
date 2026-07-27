import { expect } from "@playwright/test";

import type { PoManager } from "../../src/core/PoManager";
import type { B2BNewBranchFlowData, B2BWasteTypeOptions } from "../../src/pages/b2b/branchFormPage";
import { getB2bTestData, testdata } from "../../src/utils/testdata";

export async function openB2BHome(po: PoManager) {
  await po.getB2BHomePage().open();
}

export async function goToCreateBusinessClientStep(po: PoManager) {
  await po.getB2BHomePage().clickCreateNewBranch();
  await po.getB2BCreateBusinessClientPage().assertPageVisible();
}

export async function goToBranchFormStep(po: PoManager, branchName: string) {
  await goToCreateBusinessClientStep(po);
  await po.getB2BCreateBusinessClientPage().completeNewClientStep(branchName);
  await po.getB2BBranchFormPage().assertPageVisible();
}

export async function completeB2BCreateNewBranchFlow(
  po: PoManager,
  data: B2BNewBranchFlowData,
  wasteOptions?: B2BWasteTypeOptions,
) {
  await goToCreateBusinessClientStep(po);

  const page = po.getPage();
  let clientId: string | undefined;

  const captureClientIdFromResponse = async (response: import("@playwright/test").Response) => {
    if (!response.url().includes("graphql") || response.request().method() !== "POST") {
      return;
    }
    const body = await response.text().catch(() => "");
    const match =
      body.match(/"clientId"\s*:\s*"?(\d+)"?/i) ??
      body.match(/createBusinessClientB2bForm[^}]*"id"\s*:\s*"(\d+)"/i);
    if (match?.[1]) {
      clientId = match[1];
    }
  };

  page.on("response", captureClientIdFromResponse);
  try {
    await po.getB2BCreateBusinessClientPage().completeNewClientStep(data.branchName);
  } finally {
    page.off("response", captureClientIdFromResponse);
  }

  await page.waitForURL(/\/client\/\d+\/branch\/new/, { timeout: 30_000 }).catch(() => {});
  clientId = po.getB2BBranchFormPage().getClientIdFromUrl() ?? clientId;

  await po.getB2BBranchFormPage().assertPageVisible();
  await po
    .getB2BBranchFormPage()
    .fillForm(data, wasteOptions ?? { freshProduct: true, usedOil: true });

  page.on("response", captureClientIdFromResponse);
  try {
    await po.getB2BBranchFormPage().submit({ waitForSuccess: true });
  } finally {
    page.off("response", captureClientIdFromResponse);
  }

  await po.getB2BBranchConfirmationPage().assertPageVisible();
  clientId =
    clientId ??
    po.getB2BBranchFormPage().getClientIdFromUrl() ??
    page.url().match(/\/client\/(\d+)/)?.[1];

  return { ...data, clientId };
}

export type ExistingClientSetup = {
  clientName: string;
  clientId?: string;
};

/** Creates a new client with a first branch so the client exists for later branch flows. */
export async function setupExistingClientWithFirstBranch(
  po: PoManager,
  wasteOptions?: B2BWasteTypeOptions,
): Promise<ExistingClientSetup> {
  const firstBranchData = getB2bTestData();
  const result = await completeB2BCreateNewBranchFlow(po, firstBranchData, wasteOptions);
  return { clientName: firstBranchData.branchName, clientId: result.clientId };
}

export async function goToBranchFormForExistingClient(
  po: PoManager,
  clientName: string,
  clientId?: string,
) {
  const branchForm = po.getB2BBranchFormPage();

  if (clientId) {
    await branchForm.navigateToNewBranchForClient(clientId);
    if (await branchForm.phoneInput.isVisible({ timeout: 30_000 }).catch(() => false)) {
      await branchForm.assertPageVisible();
      return;
    }
  }

  await openB2BHome(po);
  await goToCreateBusinessClientStep(po);
  await po.getB2BCreateBusinessClientPage().completeExistingClientStep(clientName);
  await branchForm.assertPageVisible();
}

export async function createBranchForExistingClient(
  po: PoManager,
  wasteOptions: B2BWasteTypeOptions,
  setupWasteOptions: B2BWasteTypeOptions = { freshProduct: true, usedOil: true },
) {
  const { clientName, clientId } = await setupExistingClientWithFirstBranch(po, setupWasteOptions);
  const branchData = getB2bTestData();

  await goToBranchFormForExistingClient(po, clientName, clientId);
  await po.getB2BBranchFormPage().fillForm(branchData, wasteOptions);
  await po.getB2BBranchFormPage().submit({ waitForSuccess: true });
  await po.getB2BBranchConfirmationPage().assertPageVisible();
  return branchData;
}

export async function selectBranchForExistingClientRequest(po: PoManager, branchName: string) {
  const page = po.getPage();
  await expect(page.getByRole("heading", { name: "إضافة طلب لعميل حالي" })).toBeVisible({
    timeout: 30_000,
  });

  const branchCombobox = page
    .locator(".ant-form-item")
    .filter({ hasText: "الفرع" })
    .getByRole("combobox");
  await branchCombobox.click();
  await branchCombobox.fill(branchName);

  const option = page
    .locator("div.ant-select-dropdown:not(.ant-select-dropdown-hidden)")
    .last()
    .locator(".ant-select-item-option")
    .filter({ hasText: branchName })
    .first()
    .or(
      page
        .locator("div.ant-select-dropdown:not(.ant-select-dropdown-hidden)")
        .last()
        .locator(".ant-select-item-option")
        .first(),
    );

  await expect(option).toBeVisible({ timeout: 20_000 });
  await option.click();
  await page.getByRole("button", { name: "التالي" }).click();
}

export const branchWithCollectablesAndFreshProduct: B2BWasteTypeOptions = {
  freshProduct: true,
  usedOil: true,
};

export async function createBranchThenOpenRequest(
  po: PoManager,
  wasteOptions: B2BWasteTypeOptions = branchWithCollectablesAndFreshProduct,
) {
  const branchData = getB2bTestData();
  await completeB2BCreateNewBranchFlow(po, branchData, wasteOptions);
  await po.getB2BBranchConfirmationPage().clickRegisterBusinessRequest();
  await selectBranchForExistingClientRequest(po, branchData.branchName);
  await po.getB2BRequestMaterialsPage().waitForMaterialsLoaded();
}

export async function openRequestMaterialsForBranch(po: PoManager, branchName: string) {
  const home = po.getB2BHomePage();
  const materials = po.getB2BRequestMaterialsPage();

  await home.open();
  await home.selectBranch(branchName);

  if (await materials.createRequestButton.isVisible({ timeout: 3_000 }).catch(() => false)) {
    await materials.clickCreateRequestButton();
  }

  await materials.waitForMaterialsLoaded();
}

export async function openRequestForBranchWithFp(po: PoManager) {
  await po.getB2BHomePage().openBranchNewRequest(testdata.b2b.existingBranchWithFpId);
  await po.getB2BRequestMaterialsPage().waitForMaterialsLoaded();
}

export async function goToRequestDetailsStep(
  po: PoManager,
  branchId: string,
  mode: "oil" | "fresh" | "both",
  quantity = testdata.b2b.requestQuantity,
) {
  await po.getB2BHomePage().openBranchNewRequest(branchId);
  const materials = po.getB2BRequestMaterialsPage();
  await materials.waitForMaterialsLoaded();

  if (mode === "oil") {
    await materials.completeUsedOilOnlyStep(quantity);
  } else if (mode === "fresh") {
    await materials.completeFreshProductOnlyStep(quantity);
  } else {
    await materials.completeBothMaterialsStep(quantity);
  }

  await expect(po.getB2BRequestDetailsPage().totalPriceHeading).toBeVisible({ timeout: 30_000 });
}

export async function readFreshProductUnitPrice(po: PoManager): Promise<number> {
  await po.getB2BRequestMaterialsPage().waitForMaterialsLoaded();
  const priceHeading = po
    .getB2BRequestMaterialsPage()
    .freshProductsGroup.getByRole("heading")
    .filter({ hasText: /جنيه/ })
    .first();
  await expect(priceHeading).toBeVisible({ timeout: 15_000 });
  const text = (await priceHeading.textContent()) ?? "0";
  return Number(text.replace(/[^\d.]/g, ""));
}

export function calculateUsedOilTotal(
  quantity: number,
  pricePerKilo = Number(testdata.b2b.usedOilPricePerKilo),
) {
  return quantity * pricePerKilo;
}

export function calculateFreshProductTotal(quantity: number, unitPrice: number) {
  return quantity * unitPrice;
}

export function calculateNetTotal(payToCustomer: number, clientWillPay: number) {
  return payToCustomer - clientWillPay;
}
