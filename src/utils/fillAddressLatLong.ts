import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";

const DEFAULT_GOVERNORATE_ERROR = "يجب اختيار المحافظة التابع لها الفرع";
const DEFAULT_LOADING_TEXT = "جاري التحميل";
const DEFAULT_ZONE_API_MARKER = "getZoneByLatLng";
const GOVERNORATE_PLACEHOLDER = "اختر المحافظة";

const B2B_HIERARCHY_LABELS = {
  governorate: "اسم المحافظة",
  city: "اسم المدينة",
  zone: "اسم الزون",
} as const;

const B2X_HIERARCHY_LABELS = {
  governorate: "المحافظة",
  city: "المنطقة",
  zone: "الزون",
} as const;

export type FillAddressLatLongOptions = {
  /** Which address block on the form (0 = first, 1 = second, etc.). Auto-detected from field id when omitted. */
  blockIndex?: number;
  governorateErrorText?: string;
  loadingText?: string;
  zoneApiMarker?: string;
};

/**
 * Fills an Ant Design address field with lat/long, waits for zone lookup,
 * and falls back to governorate/city/zone dropdowns when auto-lookup fails.
 */
export async function fillAddressLatLong(
  page: Page,
  addressInput: Locator,
  latLong: string,
  options: FillAddressLatLongOptions = {},
) {
  const {
    governorateErrorText = DEFAULT_GOVERNORATE_ERROR,
    loadingText = DEFAULT_LOADING_TEXT,
    zoneApiMarker = DEFAULT_ZONE_API_MARKER,
  } = options;
  const blockIndex = await resolveAddressBlockIndex(addressInput, options.blockIndex);

  await expect(addressInput).toBeEnabled({ timeout: 15_000 });

  for (let attempt = 0; attempt < 3; attempt++) {
    await dismissNetworkError(page);
    await addressInput.fill(latLong);
    await addressInput.press("Tab");
    await clickConfirmIfPresent(page, blockIndex);

    await page
      .waitForResponse(
        (response) =>
          response.request().method() === "POST" &&
          Boolean(response.request().postData()?.includes(zoneApiMarker)) &&
          response.ok(),
        { timeout: 20_000 },
      )
      .catch(() => undefined);

    await waitForLoadingToHide(page, loadingText);
    await dismissNetworkError(page);

    if (!(await needsManualHierarchy(page, governorateErrorText, blockIndex))) {
      break;
    }
  }

  if (await needsManualHierarchy(page, governorateErrorText, blockIndex)) {
    await selectAddressHierarchy(page, blockIndex);
  }

  const governorateError = page.getByText(governorateErrorText);
  await expect(governorateError).toBeHidden({ timeout: 15_000 });
  await expect(addressHierarchyPlaceholder(page, blockIndex)).toBeHidden({ timeout: 15_000 });
}

async function resolveAddressBlockIndex(
  addressInput: Locator,
  blockIndex?: number,
): Promise<number> {
  if (blockIndex !== undefined) return blockIndex;

  const id = await addressInput.getAttribute("id");
  if (id === "warehouseAddress") return 1;
  return 0;
}

async function clickConfirmIfPresent(page: Page, blockIndex: number) {
  const confirm = page.getByRole("button", { name: "تأكيد" }).nth(blockIndex);
  if (!(await confirm.isVisible().catch(() => false))) return;
  if (!(await confirm.isEnabled().catch(() => false))) return;
  await confirm.click();
}

async function dismissNetworkError(page: Page) {
  const toast = page.getByText("Network Error");
  if (
    !(await toast
      .first()
      .isVisible()
      .catch(() => false))
  )
    return;

  await page
    .getByRole("img", { name: "close-circle" })
    .first()
    .click({ force: true })
    .catch(() => undefined);
  await expect(toast.first())
    .toBeHidden({ timeout: 5_000 })
    .catch(() => undefined);
}

async function waitForLoadingToHide(page: Page, loadingText: string) {
  const loading = page.getByText(loadingText);
  if (await loading.isVisible({ timeout: 2_000 }).catch(() => false)) {
    await expect(loading).toBeHidden({ timeout: 30_000 });
  }
}

function addressFormItem(page: Page, label: string, blockIndex: number): Locator {
  return page
    .locator(".ant-form-item")
    .filter({ has: page.locator("label").filter({ hasText: label }) })
    .nth(blockIndex);
}

function addressHierarchyPlaceholder(page: Page, blockIndex: number): Locator {
  const b2x = addressFormItem(page, B2X_HIERARCHY_LABELS.governorate, blockIndex);
  const b2b = addressFormItem(page, B2B_HIERARCHY_LABELS.governorate, blockIndex);
  return b2x.or(b2b).getByText(GOVERNORATE_PLACEHOLDER, { exact: true }).first();
}

async function needsManualHierarchy(
  page: Page,
  governorateErrorText: string,
  blockIndex: number,
): Promise<boolean> {
  if (
    await page
      .getByText(governorateErrorText)
      .isVisible()
      .catch(() => false)
  ) {
    return true;
  }
  if (
    await page
      .getByText("Network Error")
      .first()
      .isVisible()
      .catch(() => false)
  ) {
    return true;
  }
  return addressHierarchyPlaceholder(page, blockIndex)
    .isVisible()
    .catch(() => false);
}

async function selectAddressDropdown(page: Page, formItem: Locator, label: string) {
  const select = formItem.locator(".ant-select").first();
  await expect(select).not.toHaveClass(/ant-select-disabled/, { timeout: 15_000 });

  const selector = formItem.locator(".ant-select-selector");
  await selector.scrollIntoViewIfNeeded();

  for (let attempt = 0; attempt < 3; attempt++) {
    await dismissNetworkError(page);
    await selector.click();

    const dropdown = page.locator("div.ant-select-dropdown:not(.ant-select-dropdown-hidden)");
    const option = dropdown.last().locator(".ant-select-item-option").nth(0);
    if (await option.isVisible({ timeout: 8_000 }).catch(() => false)) {
      await option.click();
      return;
    }

    await page.keyboard.press("Escape").catch(() => undefined);
  }

  throw new Error(`Could not select address dropdown "${label}"`);
}

async function selectLabeledHierarchy(
  page: Page,
  blockIndex: number,
  labels: { governorate: string; city: string; zone: string },
) {
  const governorate = addressFormItem(page, labels.governorate, blockIndex);
  if ((await governorate.count()) === 0) {
    throw new Error(`Address dropdown "${labels.governorate}" was not found`);
  }

  await selectAddressDropdown(page, governorate, labels.governorate);
  await selectAddressDropdown(page, addressFormItem(page, labels.city, blockIndex), labels.city);
  await selectAddressDropdown(page, addressFormItem(page, labels.zone, blockIndex), labels.zone);
}

async function selectAddressHierarchy(page: Page, blockIndex: number) {
  let lastError: unknown;
  for (const labels of [B2B_HIERARCHY_LABELS, B2X_HIERARCHY_LABELS]) {
    const formItem = addressFormItem(page, labels.governorate, blockIndex);
    if ((await formItem.count()) === 0) continue;
    try {
      await selectLabeledHierarchy(page, blockIndex, labels);
      return;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error ? lastError : new Error("No address hierarchy dropdowns found");
}
