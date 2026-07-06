import { expect, Locator, Page } from "@playwright/test";
import { fillAddressLatLong } from "../../utils/fillAddressLatLong";
import { fillCountryCode as selectCountryCode } from "../../utils/fillCountryCode";
import { images } from "../../utils/images";

export type B2XTraderFormData = {
  phone: string;
  address: string;
  warehouseAddress?: string;
};

export class formPage {
  readonly phoneNumber: Locator;
  readonly countryCode: Locator;
  readonly traderType: Locator;
  readonly nationalIDimg: Locator;
  readonly personalImg: Locator;
  readonly vehicleType: Locator;
  readonly pickupAddress: Locator;
  readonly warehouseAddress: Locator;
  readonly hasWarehouseYes: Locator;
  readonly hasWarehouseNo: Locator;
  readonly nextButton: Locator;
  readonly phoneErrorMessage: Locator;
  readonly countryCodeErrorMessage: Locator;
  readonly traderTypeErrorMessage: Locator;
  readonly nationalIdErrorMessage: Locator;
  readonly personalImageErrorMessage: Locator;
  readonly vehicleTypeErrorMessage: Locator;
  readonly pickupAddressErrorMessage: Locator;
  readonly warehouseAddressErrorMessage: Locator;

  constructor(private page: Page) {
    this.phoneNumber = page.locator("#phoneNumber");
    this.countryCode = page.locator("#countryCode");
    this.traderType = page.locator("#traderType");
    this.nationalIDimg = page.locator("#nationalIdImage");
    this.personalImg = page.locator("#personalImage");
    this.vehicleType = page.locator("#vehicleType");
    this.pickupAddress = page.locator("#pickupAddress");
    this.warehouseAddress = page.locator("#warehouseAddress");
    this.hasWarehouseYes = page.locator(
      '.ant-radio-button-wrapper:has(input[name="warehouseAvailability"][value="true"])'
    );
    this.hasWarehouseNo = page.locator(
      '.ant-radio-button-wrapper:has(input[name="warehouseAvailability"][value="false"])'
    );
    this.nextButton = page.getByRole("button", { name: "التالي" }).last();
    this.phoneErrorMessage = page.locator(
      ".ant-form-item:has(#phoneNumber) .ant-form-item-explain-error"
    );
    this.countryCodeErrorMessage = page.locator(
      ".ant-form-item:has(#countryCode) .ant-form-item-explain-error"
    );
    this.traderTypeErrorMessage = page.locator(
      ".ant-form-item:has(#traderType) .ant-form-item-explain-error"
    );
    this.nationalIdErrorMessage = page.locator(
      ".ant-form-item:has(#nationalIdImage) .ant-form-item-explain-error"
    );
    this.personalImageErrorMessage = page.locator(
      ".ant-form-item:has(#personalImage) .ant-form-item-explain-error"
    );
    this.vehicleTypeErrorMessage = page.locator(
      ".ant-form-item:has(#vehicleType) .ant-form-item-explain-error"
    );
    this.pickupAddressErrorMessage = page.locator(
      ".ant-form-item:has(#pickupAddress) .ant-form-item-explain-error"
    );
    this.warehouseAddressErrorMessage = page.locator(
      ".ant-form-item:has(#warehouseAddress) .ant-form-item-explain-error"
    );
  }

  async fillPhoneNumber(phoneNumber: string) {
    await this.phoneNumber.fill(phoneNumber);
  }

  async fillCountryCode() {
    await selectCountryCode(this.page, this.countryCode, {
      waitForEnabledAfter: this.pickupAddress,
    });
  }

  private async selectAntDropdown(fieldId: string, optionIndex = 0) {
    const selector = this.page.locator(
      `.ant-form-item:has(#${fieldId}) .ant-select-selector`
    );
    await selector.scrollIntoViewIfNeeded();
    await selector.click();

    const dropdown = this.page.locator("div.ant-select-dropdown:not(.ant-select-dropdown-hidden)");
    await expect(dropdown.last()).toBeVisible({ timeout: 15_000 });

    const option = dropdown
      .last()
      .locator(".ant-select-item-option, [role='option']")
      .nth(optionIndex);

    try {
      await option.waitFor({ state: "attached", timeout: 15_000 });
      await option.click({ force: true });
    } catch (err) {
      if (this.page.isClosed()) throw err;
      await selector.focus();
      await this.page.keyboard.press("ArrowDown");
      await this.page.keyboard.press("Enter");
    }
  }

  async fillTraderType(_traderType?: string) {
    await this.selectAntDropdown("traderType");
  }

  async fillNationalIDimg(nationalIDimg: string) {
    await this.nationalIDimg.setInputFiles(nationalIDimg);
  }

  async fillPersonalImg(personalImg: string) {
    await this.personalImg.setInputFiles(personalImg);
  }

  async fillVehicleType(_vehicleType?: string) {
    await this.selectAntDropdown("vehicleType");
  }

  async fillPickupAddress(latLong: string) {
    await fillAddressLatLong(this.page, this.pickupAddress, latLong);
  }

  async fillWarehouseAddress(latLong: string) {
    await fillAddressLatLong(this.page, this.warehouseAddress, latLong, { blockIndex: 1 });
  }

  async selectHasWarehouseNo() {
    await this.hasWarehouseNo.scrollIntoViewIfNeeded();
    await this.hasWarehouseNo.click();
  }

  async selectHasWarehouseYes() {
    await this.hasWarehouseYes.scrollIntoViewIfNeeded();
    await this.hasWarehouseYes.click();
  }

  async selectWasteType(wasteType = "زيت مستعمل") {
    const checkbox = this.page.getByRole("checkbox", { name: wasteType });
    if (!(await checkbox.isChecked())) {
      await checkbox.check();
    }
  }

  async clickNext() {
    await this.nextButton.click();
  }

  async submitTraderForm() {
    await this.clickNext();
  }

  async fillTraderFormBasics(data: B2XTraderFormData) {
    await this.fillPhoneNumber(data.phone);
    await this.fillCountryCode();
    await this.fillTraderType();
    await this.fillNationalIDimg(images.banner);
    await this.fillPersonalImg(images.banner);
    await this.fillVehicleType();
  }

  async completeTraderForm(data: B2XTraderFormData, wasteTypes = ["زيت مستعمل"]) {
    await this.fillTraderFormBasics(data);
    await this.selectHasWarehouseNo();
    for (const wasteType of wasteTypes) {
      await this.selectWasteType(wasteType);
    }
    await this.fillPickupAddress(data.address);
  }

  async completeTraderFormWithWarehouse(data: B2XTraderFormData, wasteTypes = ["زيت مستعمل"]) {
    await this.fillTraderFormBasics(data);
    await this.selectHasWarehouseYes();
    for (const wasteType of wasteTypes) {
      await this.selectWasteType(wasteType);
    }
    await this.fillPickupAddress(data.address);
    await this.fillWarehouseAddress(data.warehouseAddress ?? data.address);
  }

  async assertAllRequiredFieldsVisible() {
    await expect(this.phoneNumber).toBeVisible();
    await expect(this.countryCode).toBeVisible();
    await expect(this.traderType).toBeVisible();
    await expect(this.nationalIDimg).toBeAttached();
    await expect(this.personalImg).toBeAttached();
    await expect(this.vehicleType).toBeVisible();
    await expect(this.hasWarehouseNo).toBeVisible();
    await expect(this.hasWarehouseYes).toBeVisible();
    await expect(this.nextButton).toBeVisible();
  }
}
