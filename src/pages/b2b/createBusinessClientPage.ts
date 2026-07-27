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

  constructor(private page: Page) {
    this.stepLabel = page.getByText("خطوه 1 / 2");
    this.pageHeading = page.getByRole("heading", { name: "اختر العميل" });
    this.clientSearchInput = page.getByPlaceholder("ابحث بإسم البيزنس");
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
    this.businessTypeErrorMessage = page.locator(
      ".ant-form-item:has(#brandTypeId) .ant-form-item-explain-error",
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
  }

  async fillEnglishName(englishName: string) {
    await this.englishNameInput.fill(englishName);
  }

  async selectBusinessType(businessType = testdata.b2b.defaultBusinessType) {
    await this.businessTypeSelector.scrollIntoViewIfNeeded();
    await this.businessTypeSelector.click();

    const dropdown = this.page.locator("div.ant-select-dropdown:not(.ant-select-dropdown-hidden)");
    await expect(dropdown.last()).toBeVisible({ timeout: 15_000 });

    const typedOption = dropdown
      .last()
      .locator(".ant-select-item-option")
      .filter({ hasText: businessType })
      .first();
    const fallbackOption = dropdown.last().locator(".ant-select-item-option").first();
    if (!(await fallbackOption.count())) {
      await this.businessTypeSelector.focus();
      await this.page.keyboard.press("ArrowDown");
      await this.page.keyboard.press("Enter");
      await expect(this.businessTypeErrorMessage).toBeHidden({ timeout: 15_000 });
      return;
    }

    const option = (await typedOption.count()) ? typedOption : fallbackOption;

    await option.waitFor({ state: "attached", timeout: 15_000 });
    try {
      await option.click({ force: true });
    } catch (err) {
      if (this.page.isClosed()) throw err;
      await this.businessTypeSelector.focus();
      await this.page.keyboard.press("ArrowDown");
      await this.page.keyboard.press("Enter");
    }

    await expect(this.businessTypeErrorMessage).toBeHidden({ timeout: 15_000 });
  }

  async selectExistingClient(businessName: string) {
    await this.clientSearchInput.click();
    await this.clientSearchInput.fill(businessName);

    await expect(this.page.locator('[id^="nameAR_list_"]').first()).toBeAttached({
      timeout: 15_000,
    });

    const portalOption = this.page
      .locator("div.ant-select-dropdown:not(.ant-select-dropdown-hidden)")
      .last()
      .locator(".ant-select-item-option")
      .filter({ hasText: businessName })
      .first();

    if (await portalOption.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await portalOption.click({ force: true });
    } else {
      await this.clientSearchInput.press("ArrowDown");
      await this.clientSearchInput.press("Enter");
    }

    await this.page.keyboard.press("Escape");
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
    await this.clickNext();
  }

  async assertEnglishNameRequired() {
    await expect(this.englishNameErrorMessage).toBeVisible();
    await expect(this.stepLabel).toBeVisible();
    await expect(this.pageHeading).toBeVisible();
  }

  async completeExistingClientStep(clientName: string) {
    await this.assertPageVisible();
    await this.selectExistingClient(clientName);
    await expect(this.clientNameErrorMessage).toBeHidden({ timeout: 10_000 });
    await expect(
      this.page.locator(".ant-form-item:has(#nameAR) .ant-select-selection-item"),
    ).toBeVisible({ timeout: 10_000 });
    await this.clickNext();
    await expect(this.page.locator("#primaryPhoneNumber")).toBeVisible({ timeout: 30_000 });
  }
}
