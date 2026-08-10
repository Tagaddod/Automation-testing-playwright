import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";

export type GreenpanAddressData = {
  governorate: string;
  area: string;
  district: string;
  street: string;
  building: string;
  apartment: string;
  floor: string;
  clientName: string;
};

/** Address step for new GreenPan users. */
export class addressPage {
  readonly governorateDropdown: Locator;
  readonly areaDropdown: Locator;
  readonly districtDropdown: Locator;
  readonly streetNameInput: Locator;
  readonly buildingInput: Locator;
  readonly apartmentInput: Locator;
  readonly floorInput: Locator;
  readonly clientNameInput: Locator;
  readonly addAddressButton: Locator;

  constructor(private page: Page) {
    this.governorateDropdown = page
      .locator('button[role="combobox"]')
      .filter({ hasText: /المحافظة|اختر المحافظة/ })
      .first();
    this.areaDropdown = page
      .locator('button[role="combobox"]')
      .filter({ hasText: /المنطقة|اختر المنطقة/ })
      .first();
    this.districtDropdown = page
      .locator('button[role="combobox"]')
      .filter({ hasText: /الحي|اختر الحي/ })
      .first();
    this.streetNameInput = page.locator("#addAddressForm-street");
    this.buildingInput = page.locator("#addAddressForm-building");
    this.apartmentInput = page.locator("#addAddressForm-apartment");
    this.floorInput = page.locator("#addAddressForm-floor");
    this.clientNameInput = page.locator("#addAddressForm-customerName");
    this.addAddressButton = page.getByRole("button", { name: /إضافة عنوان/ });
  }

  async assertPageVisible() {
    await expect(this.page.getByRole("heading", { name: "إضافة عنوان" })).toBeVisible({
      timeout: 45_000,
    });
    await expect(this.streetNameInput.or(this.addAddressButton).first()).toBeVisible();
  }

  async selectGovernorate(name: string) {
    await this.selectComboboxOption(this.governorateDropdown, name);
  }

  async selectArea(name: string) {
    await this.selectComboboxOption(this.areaDropdown, name);
  }

  async selectDistrict(name: string) {
    await this.selectComboboxOption(this.districtDropdown, name);
  }

  private async selectComboboxOption(combobox: Locator, name: string) {
    await combobox.click();
    await this.page.getByRole("listbox").getByRole("option", { name, exact: true }).click();
  }

  async enterStreetName(streetName: string) {
    await this.streetNameInput.fill(streetName);
  }

  async enterBuilding(building: string) {
    await this.buildingInput.fill(building);
  }

  async enterApartment(apartment: string) {
    await this.apartmentInput.fill(apartment);
  }

  async enterFloor(floor: string) {
    await this.floorInput.fill(floor);
  }

  async enterClientName(clientName: string) {
    await this.clientNameInput.fill(clientName);
  }

  async submitAddress() {
    await this.addAddressButton.click();
  }

  async fillAddress(data: GreenpanAddressData) {
    await this.selectGovernorate(data.governorate);
    await this.selectArea(data.area);
    await this.selectDistrict(data.district);
    await this.enterStreetName(data.street);
    await this.enterBuilding(data.building);
    await this.enterApartment(data.apartment);
    await this.enterFloor(data.floor);
    await this.enterClientName(data.clientName);
  }

  async completeAddressStep(data: GreenpanAddressData) {
    await this.assertPageVisible();
    await this.fillAddress(data);
    await this.submitAddress();

    const addressError = this.page.getByRole("heading", { name: /حدث خطأ/ });
    if (await addressError.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await this.submitAddress();
    }

    await expect(
      this.page.getByRole("button", { name: "إرسال الطلب" }).or(addressError).first(),
    ).toBeVisible({ timeout: 30_000 });

    if (await addressError.isVisible().catch(() => false)) {
      throw new Error("Address submit failed after retry");
    }
  }
}
