import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";

import { testdata } from "../../utils/testdata";

export class createBusinessClientPage {
  readonly stepLabel: Locator;
  readonly pageHeading: Locator;
  readonly clientSearchInput: Locator;
  readonly englishNameInput: Locator;
  readonly businessTypeSelector: Locator;
  readonly nextButton: Locator;
  readonly clientNameErrorMessage: Locator;
  readonly englishNameErrorMessage: Locator;
  readonly businessTypeErrorMessage: Locator;
  readonly businessTypeSelection: Locator;

  constructor(private page: Page) {
    this.stepLabel = page.getByText("خطوه 1 / 2");
    this.pageHeading = page.getByRole("heading", { name: "اختر العميل" });
    this.clientSearchInput = page.locator("#nameAR");
    this.englishNameInput = page.locator("#nameEN");
    this.businessTypeSelector = page.locator(
      ".ant-form-item:has(#brandTypeId) .ant-select-selector",
    );
    this.nextButton = page.locator('[tag-test-id="business-client-form-submit-button"]');
    this.clientNameErrorMessage = page.locator(
      ".ant-form-item:has(#nameAR) .ant-form-item-explain-error",
    );
    this.englishNameErrorMessage = page.locator(
      ".ant-form-item:has(#nameEN) .ant-form-item-explain-error",
    );
    this.businessTypeErrorMessage = page
      .locator(".ant-form-item")
      .filter({ hasText: "نوع البيزنس" })
      .locator(".ant-form-item-explain-error");
    this.businessTypeSelection = page.locator(
      ".ant-form-item:has(#brandTypeId) .ant-select-selection-item",
    );
  }

  async assertPageVisible() {
    await expect(this.stepLabel).toBeVisible();
    await expect(this.pageHeading).toBeVisible();
    await expect(this.clientSearchInput).toBeVisible();
    await expect(this.nextButton).toBeVisible();
  }

  async assertNewClientFieldsVisible() {
    await expect(this.englishNameInput).toBeVisible();
    await expect(this.businessTypeSelector).toBeVisible();
  }

  private clientSearchDropdown(): Locator {
    return this.page.locator("div.ant-select-dropdown:not(.ant-select-dropdown-hidden)").last();
  }

  async addNewClient(branchName: string) {
    const dropdown = this.clientSearchDropdown();
    const addOption = dropdown.getByText("إضافة عميل جديد", { exact: true });
    const spinner = dropdown.locator(".ant-spin-spinning, .ant-select-item-option-loading");

    for (let attempt = 0; attempt < 3; attempt++) {
      await this.clientSearchInput.click();
      await this.clientSearchInput.fill("");
      await this.clientSearchInput.pressSequentially(branchName, { delay: 30 });
      await expect(dropdown).toBeVisible({ timeout: 15_000 });
      await expect(spinner)
        .toHaveCount(0, { timeout: 20_000 })
        .catch(() => undefined);

      if (await addOption.isVisible().catch(() => false)) {
        await addOption.click();
        await expect(this.englishNameInput).toBeVisible({ timeout: 15_000 });
        await this.englishNameInput.click();
        return;
      }
    }

    await expect(addOption).toBeVisible({ timeout: 15_000 });
    await addOption.click();
    await expect(this.englishNameInput).toBeVisible({ timeout: 15_000 });
    await this.englishNameInput.click();
  }

  async fillEnglishName(englishName: string) {
    await this.englishNameInput.fill(englishName);
  }

  async selectBusinessType(businessType = testdata.b2b.defaultBusinessType) {
    const dropdown = this.page.locator("div.ant-select-dropdown:not(.ant-select-dropdown-hidden)");
    const loadingArrow = this.page.locator(
      ".ant-form-item:has(#brandTypeId) .ant-select-arrow-loading",
    );

    for (let attempt = 0; attempt < 3; attempt++) {
      await this.businessTypeSelector.scrollIntoViewIfNeeded();
      await this.businessTypeSelector.click();

      await expect(dropdown.last()).toBeVisible({ timeout: 15_000 });
      await expect(loadingArrow)
        .toHaveCount(0, { timeout: 20_000 })
        .catch(() => undefined);
      await expect(dropdown.last().locator(".ant-select-item-option").first()).toBeVisible({
        timeout: 20_000,
      });

      const search = this.page.locator(".ant-form-item:has(#brandTypeId) #brandTypeId");
      await expect(search).toBeVisible({ timeout: 10_000 });
      await search.fill("");
      await search.pressSequentially(businessType, { delay: 60 });
      await expect(loadingArrow)
        .toHaveCount(0, { timeout: 20_000 })
        .catch(() => undefined);

      const option = dropdown
        .last()
        .locator(".ant-select-item-option")
        .filter({ hasText: businessType })
        .first();
      await expect(option).toBeVisible({ timeout: 15_000 });
      await option.click();

      if (
        await this.businessTypeSelection
          .getByText(businessType, { exact: true })
          .isVisible({ timeout: 5_000 })
          .catch(() => false)
      ) {
        return;
      }
    }

    await expect(this.businessTypeSelection).toHaveText(businessType, { timeout: 10_000 });
  }

  async selectExistingClient(businessName: string) {
    const dropdown = this.page
      .locator("div.ant-select-dropdown:not(.ant-select-dropdown-hidden)")
      .last();

    for (let attempt = 0; attempt < 3; attempt++) {
      await this.clientSearchInput.click();
      await this.clientSearchInput.fill("");
      await this.clientSearchInput.pressSequentially(businessName, { delay: 40 });

      const option = dropdown
        .locator(".ant-select-item-option")
        .filter({ hasText: businessName })
        .first();
      await expect(option).toBeVisible({ timeout: 20_000 });
      await option.dispatchEvent("mousedown");
      await option.click({ force: true });

      const closed = await expect(dropdown)
        .toBeHidden({ timeout: 5_000 })
        .then(() => true)
        .catch(() => false);
      if (!closed) continue;

      await expect(this.clientSearchInput).toHaveValue(businessName, { timeout: 5_000 });
      await expect(this.clientNameErrorMessage).toBeHidden({ timeout: 5_000 });
      return;
    }

    await expect(this.clientNameErrorMessage).toBeHidden({ timeout: 10_000 });
    await expect(this.clientSearchInput).toHaveValue(businessName);
  }

  async clickNext() {
    const phone = this.page.locator("#primaryPhoneNumber");
    if (await phone.isVisible().catch(() => false)) return;

    const submitNext = this.page.locator('[tag-test-id="business-client-form-submit-button"]');
    await expect(submitNext).toBeEnabled({ timeout: 15_000 });
    await submitNext.click();
  }

  async completeNewClientStep(branchName: string) {
    await this.addNewClient(branchName);
    await this.assertNewClientFieldsVisible();
    await this.fillEnglishName(branchName);
    await this.selectBusinessType();
    await expect(this.clientNameErrorMessage).toBeHidden({ timeout: 5_000 });
    await this.clickNext();
    const phone = this.page.locator("#primaryPhoneNumber");
    if (!(await phone.isVisible({ timeout: 15_000 }).catch(() => false))) {
      await this.clickNext();
    }
    await expect(phone).toBeVisible({ timeout: 30_000 });
  }

  async assertEnglishNameRequired() {
    await expect(this.englishNameErrorMessage).toBeVisible();
    await expect(this.stepLabel).toBeVisible();
    await expect(this.pageHeading).toBeVisible();
  }

  async completeExistingClientStep(clientName: string) {
    await this.assertPageVisible();
    await this.selectExistingClient(clientName);
    await this.clickNext();
    const phone = this.page.locator("#primaryPhoneNumber");
    const reachedBranchForm = await expect(phone)
      .toBeVisible({ timeout: 15_000 })
      .then(() => true)
      .catch(() => false);
    if (!reachedBranchForm && (await this.clientNameErrorMessage.isVisible().catch(() => false))) {
      await this.selectExistingClient(clientName);
      await this.clickNext();
    }
    await expect(phone).toBeVisible({ timeout: 30_000 });
  }
}
