import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";

import { URLs } from "../../config/urls";
import { fillAddressLatLong } from "../../utils/fillAddressLatLong";
import { fillCountryCode as selectCountryCode } from "../../utils/fillCountryCode";
import { images } from "../../utils/images";
import { testdata } from "../../utils/testdata";

export type B2BNewBranchFlowData = {
  branchName: string;
  phone: string;
  address: string;
};

export type B2BWasteTypeOptions = {
  freshProduct?: boolean;
  usedOil?: boolean;
  fattyAcids?: boolean;
  usedOilPricePerKilo?: string;
};

export class branchFormPage {
  readonly stepLabel: Locator;
  readonly phoneInput: Locator;
  readonly countryCodeInput: Locator;
  readonly addressInput: Locator;
  readonly paymentMethod: Locator;
  readonly preferredTime: Locator;
  readonly addBranchButton: Locator;
  readonly preferredDay: Locator;
  readonly phoneErrorMessage: Locator;
  readonly countryCodeErrorMessage: Locator;
  readonly addressErrorMessage: Locator;
  readonly collectablesTypeErrorMessage: Locator;
  readonly paymentMethodErrorMessage: Locator;
  readonly photoErrorMessage: Locator;
  readonly wasteTypesHeading: Locator;

  constructor(private page: Page) {
    this.stepLabel = page.getByText("خطوه 2 / 2");
    this.phoneInput = page.locator("#primaryPhoneNumber");
    this.countryCodeInput = page.locator("#primaryCountryCode");
    this.addressInput = page.locator("#address");
    this.paymentMethod = page.locator("#paymentMethod");
    this.preferredTime = page
      .locator(".ant-radio-button-wrapper")
      .filter({ hasText: testdata.b2b.preferredTime });
    this.addBranchButton = page.getByRole("button", { name: "إضافة فرع" });
    this.preferredDay = page.getByText(testdata.b2b.preferredDay, { exact: true });
    this.phoneErrorMessage = page.locator(
      ".ant-form-item:has(#primaryPhoneNumber) .ant-form-item-explain-error",
    );
    this.countryCodeErrorMessage = page.locator(
      ".ant-form-item:has(#primaryCountryCode) .ant-form-item-explain-error",
    );
    this.addressErrorMessage = page.locator(
      ".ant-form-item:has(#address) .ant-form-item-explain-error",
    );
    this.collectablesTypeErrorMessage = page.getByText(testdata.b2b.errors.collectablesRequired);
    this.paymentMethodErrorMessage = page.locator(
      ".ant-form-item:has(#paymentMethod) .ant-form-item-explain-error",
    );
    this.photoErrorMessage = page.locator(
      ".ant-form-item:has(#bannerImage) .ant-form-item-explain-error",
    );
    this.wasteTypesHeading = page.getByText("اختار نوع المخلفات المتاحة");
  }

  wasteTypeCheckbox(label: string): Locator {
    return this.page.locator(".ant-checkbox-wrapper").filter({ hasText: label });
  }

  freshProductCheckbox(): Locator {
    return this.wasteTypeCheckbox(testdata.b2b.wasteTypes.freshProduct);
  }

  usedOilCheckbox(): Locator {
    return this.wasteTypeCheckbox(testdata.b2b.wasteTypes.usedOil);
  }

  async assertPageVisible() {
    await expect(this.phoneInput).toBeVisible({ timeout: 30_000 });
    await expect(this.addressInput).toBeVisible();
    await expect(this.wasteTypesHeading).toBeVisible();
    await expect(this.addBranchButton).toBeVisible();
  }

  async fillPhoneNumber(phoneNumber: string) {
    await this.phoneInput.fill(phoneNumber);
  }

  getClientIdFromUrl() {
    return this.page.url().match(/\/client\/(\d+)/)?.[1];
  }

  async navigateToNewBranchForClient(clientId: string) {
    await this.page.goto(`${URLs.b2b.base}/client/${clientId}/branch/new`, {
      waitUntil: "domcontentloaded",
    });
  }

  async openForClient(clientId: string) {
    await this.navigateToNewBranchForClient(clientId);
    await this.assertPageVisible();
  }

  async fillBranchName(branchName: string) {
    const branchNameInput = this.page
      .locator("#branchName")
      .or(this.page.locator(".ant-form-item").filter({ hasText: "اسم الفرع" }).locator("input"))
      .first();
    if (!(await branchNameInput.isVisible({ timeout: 2_000 }).catch(() => false))) {
      return;
    }
    if (await branchNameInput.isDisabled()) {
      return;
    }
    await branchNameInput.fill(branchName);
  }

  async fillForm(
    data: { phone: string; address: string; branchName?: string },
    wasteOptions: B2BWasteTypeOptions = { usedOil: true },
  ) {
    await this.fillPhoneNumber(data.phone);
    await this.fillCountryCode();
    await this.fillAddress(data.address);
    if (data.branchName) {
      await this.fillBranchName(data.branchName);
    }
    await this.configureWasteTypes(wasteOptions);
    await this.selectPaymentMethod();
    await this.selectPreferredDay();
    await this.selectPreferredTime();
    await this.uploadImage();
  }

  async selectAntDropdownOption(fieldId: string, optionIndex = 0) {
    await this.page.locator(`#${fieldId}`).click();
    const option = this.page
      .locator("div.ant-select-dropdown")
      .last()
      .locator(".ant-select-item-option, [role='option']")
      .nth(optionIndex);
    try {
      await option.waitFor({ state: "attached", timeout: 15_000 });
      await option.click({ force: true });
    } catch (err) {
      if (this.page.isClosed()) throw err;
      await this.page.locator(`#${fieldId}`).focus();
      await this.page.keyboard.press("ArrowDown");
      await this.page.keyboard.press("Enter");
    }
  }

  async fillCountryCode() {
    await selectCountryCode(this.page, this.countryCodeInput, {
      waitForEnabledAfter: this.addressInput,
    });
  }

  async fillAddress(latLong: string) {
    await fillAddressLatLong(this.page, this.addressInput, latLong);
  }

  async selectPaymentMethod() {
    await this.selectAntDropdownOption("paymentMethod");
  }

  async selectPreferredTime() {
    await this.preferredTime.click();
  }

  async selectPreferredDay() {
    await this.preferredDay.click();
  }

  async setWasteTypeChecked(label: string, checked: boolean) {
    const wrapper = this.wasteTypeCheckbox(label);
    await wrapper.scrollIntoViewIfNeeded();
    const checkbox = wrapper.locator('input[type="checkbox"]');
    const isChecked = await checkbox.isChecked();
    if (isChecked !== checked) {
      await wrapper.click();
    }
    if (checked) {
      await expect(checkbox).toBeChecked();
    } else {
      await expect(checkbox).not.toBeChecked();
    }
  }

  async assertFreshProductSelectedByDefault() {
    await this.wasteTypesHeading.scrollIntoViewIfNeeded();
    await expect(this.freshProductCheckbox().locator('input[type="checkbox"]')).toBeChecked();
    await expect(this.usedOilCheckbox().locator('input[type="checkbox"]')).not.toBeChecked();
  }

  async configureWasteTypes(options: B2BWasteTypeOptions = {}) {
    const {
      freshProduct = true,
      usedOil = false,
      fattyAcids = false,
      usedOilPricePerKilo = testdata.b2b.usedOilPricePerKilo,
    } = options;

    await this.wasteTypesHeading.scrollIntoViewIfNeeded();
    await this.setWasteTypeChecked(testdata.b2b.wasteTypes.freshProduct, freshProduct);
    await this.setWasteTypeChecked(testdata.b2b.wasteTypes.usedOil, usedOil);
    await this.setWasteTypeChecked(testdata.b2b.wasteTypes.fattyAcids, fattyAcids);

    if (usedOil) {
      const oilPriceInput = this.page.getByPlaceholder("أدخل سعر الكيلو");
      if (await oilPriceInput.isVisible({ timeout: 5_000 }).catch(() => false)) {
        await oilPriceInput.fill(usedOilPricePerKilo);
      }
    }

    const anySelected = freshProduct || usedOil || fattyAcids;
    if (anySelected) {
      await expect(this.collectablesTypeErrorMessage).toBeHidden({ timeout: 5_000 });
    }
  }

  async uploadImage() {
    await this.page.getByRole("heading", { name: "الصور" }).scrollIntoViewIfNeeded();
    const bannerInput = this.page.locator("#bannerImage");
    if (await bannerInput.count()) {
      await bannerInput.setInputFiles(images.banner);
      return;
    }
    await this.page.locator('input[type="file"]').first().setInputFiles(images.banner);
  }

  async submit(options: { waitForSuccess?: boolean } = {}) {
    const { waitForSuccess = false } = options;
    await this.addBranchButton.scrollIntoViewIfNeeded();
    await this.addBranchButton.click();
    if (waitForSuccess) {
      await expect(
        this.page.getByRole("heading", { name: testdata.b2b.confirmation.successHeading }),
      ).toBeVisible({
        timeout: 60_000,
      });
    }
  }
}
