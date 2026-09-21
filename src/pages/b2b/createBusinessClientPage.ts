import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";

import { testdata } from "../../utils/testdata";

export class createBusinessClientPage {
  readonly stepLabel: Locator;
  readonly pageHeading: Locator;
  readonly clientSearchInput: Locator;
  readonly addNewClientButton: Locator;
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
    this.addNewClientButton = page.locator('span:has-text("إضافة عميل جديد")');
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

  async addNewClient(branchName: string) {
    await this.clientSearchInput.fill(branchName);
    await this.addNewClientButton.click();
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
    await this.clientSearchInput.click();
    await this.clientSearchInput.fill("");
    await this.clientSearchInput.pressSequentially(businessName, { delay: 40 });
    await expect(this.clientSearchInput).toHaveValue(businessName, { timeout: 10_000 });

    const option = this.page
      .locator("div.ant-select-dropdown:not(.ant-select-dropdown-hidden)")
      .last()
      .locator(".ant-select-item-option")
      .filter({ hasText: businessName })
      .first();
    await expect(option).toBeVisible({ timeout: 20_000 });
    await option.click({ force: true });
    await expect(this.clientSearchInput).toHaveValue(businessName, { timeout: 10_000 });
    await expect(this.clientNameErrorMessage).toBeHidden({ timeout: 10_000 });
  }

  async clickNext() {
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
    await expect(this.page.locator("#primaryPhoneNumber")).toBeVisible({ timeout: 30_000 });
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
    await expect(this.page.locator("#primaryPhoneNumber")).toBeVisible({ timeout: 30_000 });
  }
}
