import { expect, Locator, Page } from "@playwright/test";

const DEFAULT_GOVERNORATE_ERROR = "يجب اختيار المحافظة التابع لها الفرع";
const DEFAULT_LOADING_TEXT = "جاري التحميل";
const DEFAULT_ZONE_API_MARKER = "getZoneByLatLng";

const HIERARCHY_LABELS = {
  governorate: "اسم المحافظة",
  city: "اسم المدينة",
  zone: "اسم الزون",
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
  options: FillAddressLatLongOptions = {}
) {
  const {
    governorateErrorText = DEFAULT_GOVERNORATE_ERROR,
    loadingText = DEFAULT_LOADING_TEXT,
    zoneApiMarker = DEFAULT_ZONE_API_MARKER,
  } = options;

  await expect(addressInput).toBeEnabled({ timeout: 15_000 });

  const zoneLookup = page.waitForResponse(
    (response) =>
      response.request().method() === "POST" &&
      Boolean(response.request().postData()?.includes(zoneApiMarker)) &&
      response.ok(),
    { timeout: 30_000 }
  );
  await addressInput.fill(latLong);
  await addressInput.press("Tab");
  await zoneLookup;

  const loading = page.getByText(loadingText);
  if (await loading.isVisible({ timeout: 2_000 }).catch(() => false)) {
    await expect(loading).toBeHidden({ timeout: 30_000 });
  }

  const governorateError = page.getByText(governorateErrorText);
  if (await governorateError.isVisible({ timeout: 2_000 }).catch(() => false)) {
    const blockIndex = await resolveAddressBlockIndex(addressInput, options.blockIndex);
    await selectAddressHierarchy(page, blockIndex);
  }

  await expect(governorateError).toBeHidden({ timeout: 15_000 });
}

async function resolveAddressBlockIndex(
  addressInput: Locator,
  blockIndex?: number
): Promise<number> {
  if (blockIndex !== undefined) return blockIndex;

  const id = await addressInput.getAttribute("id");
  if (id === "warehouseAddress") return 1;
  return 0;
}

async function selectAddressDropdown(
  page: Page,
  blockIndex: number,
  label: string,
  optionIndex = 0
) {
  const formItem = page
    .locator(".ant-form-item")
    .filter({ hasText: label })
    .nth(blockIndex);
  await formItem.locator(".ant-select-selector").click();
  const dropdown = page.locator("div.ant-select-dropdown:not(.ant-select-dropdown-hidden)");
  await expect(dropdown.last()).toBeVisible({ timeout: 15_000 });
  await dropdown.last().locator(".ant-select-item-option").nth(optionIndex).click();
}

async function selectAddressHierarchy(page: Page, blockIndex: number) {
  await selectAddressDropdown(page, blockIndex, HIERARCHY_LABELS.governorate);
  await selectAddressDropdown(page, blockIndex, HIERARCHY_LABELS.city);
  await selectAddressDropdown(page, blockIndex, HIERARCHY_LABELS.zone);
}
