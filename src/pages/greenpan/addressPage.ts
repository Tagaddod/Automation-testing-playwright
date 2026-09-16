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

/** Agent address form: native `city` / `region` / `zone` selects behind the combobox UI. */
export class addressPage {
  readonly citySelect: Locator;
  readonly regionSelect: Locator;
  readonly zoneSelect: Locator;
  readonly streetNameInput: Locator;
  readonly buildingInput: Locator;
  readonly apartmentInput: Locator;
  readonly floorInput: Locator;
  readonly clientNameInput: Locator;
  readonly landmarkInput: Locator;
  readonly addAddressButton: Locator;

  constructor(private page: Page) {
    this.citySelect = page.locator('select[name="city"]');
    this.regionSelect = page.locator('select[name="region"]');
    this.zoneSelect = page.locator('select[name="zone"]');
    this.streetNameInput = page.locator("#addAddressForm-street");
    this.buildingInput = page.locator("#addAddressForm-building");
    this.apartmentInput = page.locator("#addAddressForm-apartment");
    this.floorInput = page.locator("#addAddressForm-floor");
    this.clientNameInput = page.locator("#addAddressForm-customerName");
    this.landmarkInput = page.getByText("أقرب علامة مميزة");
    this.addAddressButton = page.getByRole("button", { name: /إضافة عنوان/ });
  }

  async assertPageVisible() {
    await expect(this.page.getByRole("heading", { name: "إضافة عنوان" })).toBeVisible({
      timeout: 45_000,
    });
    await expect(this.streetNameInput).toBeVisible();
    await expect(this.buildingInput).toBeVisible();
    await expect(this.apartmentInput).toBeVisible();
    await expect(this.floorInput).toBeVisible();
    await expect(this.clientNameInput).toBeVisible();
    await expect(this.landmarkInput).toBeVisible();
    await expect(this.citySelect).toBeAttached();
  }

  private async selectByLabel(select: Locator, label: string) {
    await expect(select).toBeEnabled({ timeout: 20_000 });
    await expect
      .poll(async () => select.locator("option").count(), { timeout: 20_000 })
      .toBeGreaterThan(1);

    const labels = (await select.locator("option").allTextContents()).map((text) => text.trim());
    const match = labels.find((text) => text === label || text.includes(label));
    if (!match) {
      throw new Error(
        `Address option "${label}" was not found. Available: ${labels.filter(Boolean).join(", ")}`,
      );
    }
    await select.selectOption({ label: match });
  }

  async selectGovernorate(name: string) {
    await this.selectByLabel(this.citySelect, name);
  }

  async selectArea(name: string) {
    await this.selectByLabel(this.regionSelect, name);
  }

  async selectDistrict(name: string) {
    await this.selectByLabel(this.zoneSelect, name);
  }

  async fillAddress(data: GreenpanAddressData) {
    await this.selectGovernorate(data.governorate);
    await this.selectArea(data.area);
    await this.selectDistrict(data.district);
    await this.streetNameInput.fill(data.street);
    await this.buildingInput.fill(data.building);
    await this.apartmentInput.fill(data.apartment);
    await this.floorInput.fill(data.floor);
    await this.clientNameInput.fill(data.clientName);
  }

  async fillAddressWithoutStreet(data: GreenpanAddressData) {
    await this.selectGovernorate(data.governorate);
    await this.selectArea(data.area);
    await this.selectDistrict(data.district);
    await this.buildingInput.fill(data.building);
    await this.apartmentInput.fill(data.apartment);
    await this.floorInput.fill(data.floor);
    await this.clientNameInput.fill(data.clientName);
  }

  async fillAddressWithoutClientName(data: GreenpanAddressData) {
    await this.selectGovernorate(data.governorate);
    await this.selectArea(data.area);
    await this.selectDistrict(data.district);
    await this.streetNameInput.fill(data.street);
    await this.buildingInput.fill(data.building);
    await this.apartmentInput.fill(data.apartment);
    await this.floorInput.fill(data.floor);
  }

  async completeAddressStep(data: GreenpanAddressData) {
    await this.assertPageVisible();
    await this.fillAddress(data);
    await this.addAddressButton.click();

    await expect(
      this.page
        .getByRole("button", { name: /إرسال الطلب/ })
        .or(this.page.getByRole("heading", { name: /حدث خطأ/ })),
    ).toBeVisible({ timeout: 30_000 });

    if (
      await this.page
        .getByRole("heading", { name: /حدث خطأ/ })
        .isVisible()
        .catch(() => false)
    ) {
      throw new Error("Address submit failed");
    }
  }
}
