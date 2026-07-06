import { expect, Locator, Page } from "@playwright/test";

const DEFAULT_COUNTRY_FILTER = /Egypt|مصر|\+20/;

export type FillCountryCodeOptions = {
  countryFilter?: RegExp;
  /** Locator that should become enabled after country code is selected (e.g. address field). */
  waitForEnabledAfter?: Locator;
};

/**
 * Selects Egypt (+20) from an Ant Design country code dropdown.
 */
export async function fillCountryCode(
  page: Page,
  countryCodeInput: Locator,
  options: FillCountryCodeOptions = {}
) {
  const { countryFilter = DEFAULT_COUNTRY_FILTER, waitForEnabledAfter } = options;

  await countryCodeInput.click();
  const option = page
    .locator("div.ant-select-dropdown")
    .last()
    .locator(".ant-select-item-option, [role='option']")
    .filter({ hasText: countryFilter })
    .first();
  await option.waitFor({ state: "visible", timeout: 15_000 });
  await option.click();

  if (waitForEnabledAfter) {
    await expect(waitForEnabledAfter).toBeEnabled({ timeout: 15_000 });
  }
}
