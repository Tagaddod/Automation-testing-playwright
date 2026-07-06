import { expect, Locator, Page } from "@playwright/test";

export class requestDetailsPage {
  readonly pickupDateInput: Locator;
  readonly dawnTime: Locator;
  readonly morningTime: Locator;
  readonly afternoonTime: Locator;
  readonly eveningTime: Locator;
  readonly greenPanRepDelivery: Locator;
  readonly deliverToWarehouse: Locator;
  readonly warehouseTypeCombobox: Locator;
  readonly notesInput: Locator;
  readonly usedOilItem: Locator;
  readonly pricePerKiloBadge: Locator;
  readonly quantityDisplay: Locator;
  readonly itemTotal: Locator;
  readonly totalSummary: Locator;
  readonly submitButton: Locator;
  readonly successHeading: Locator;
  readonly collectionDetailsHeading: Locator;

  constructor(private page: Page) {
    this.pickupDateInput = page
      .locator("#pickupDate")
      .or(page.getByPlaceholder("اختر تاريخ الاستلام"));
    this.dawnTime = page.getByRole("radio", { name: /الفجر/ });
    this.morningTime = page.getByRole("radio", { name: /صباحاً ٦/ });
    this.afternoonTime = page.getByRole("radio", { name: /بعد الظهر/ });
    this.eveningTime = page.getByRole("radio", { name: /مساءً ٦/ });
    this.greenPanRepDelivery = page.getByRole("radio", { name: /مندوب جرين بان/ });
    this.deliverToWarehouse = page.getByRole("radio", { name: /توصيل الزيت/ });
    this.warehouseTypeCombobox = page
      .getByRole("combobox", { name: /نوع المخزن/ })
      .or(page.locator(".ant-select").filter({ hasText: "اختر نوع المخزن" }).locator(".ant-select-selector"));
    this.notesInput = page.locator("#notes").or(page.getByPlaceholder("ملاحظات"));
    this.usedOilItem = page.locator("article").getByRole("heading", { name: "زيت مستعمل" });
    this.pricePerKiloBadge = page.locator("article").getByText(/سعر الكيلو/);
    this.quantityDisplay = page.locator("article p");
    this.itemTotal = page.getByText(/جنيه/).first();
    this.totalSummary = page.getByText("المجموع");
    this.submitButton = page.getByRole("button", { name: "إرسال الطلب" });
    this.successHeading = page.getByRole("heading", { name: "تم إرسال الطلب" });
    this.collectionDetailsHeading = page.getByText("تفاصيل التجميع");
  }

  async assertAllFieldsVisible() {
    await expect(this.pickupDateInput).toBeVisible();
    await expect(this.page.getByText("موعد الاستلام")).toBeVisible();
    await this.fillPickupDate();
    await expect(this.dawnTime).toBeAttached();
    await expect(this.morningTime).toBeAttached();
    await expect(this.afternoonTime).toBeAttached();
    await expect(this.eveningTime).toBeAttached();
    await expect(this.page.getByText("مندوب جرين بان", { exact: true })).toBeVisible();
    await expect(this.page.getByText(/توصيل الزيت لأقرب مخزن/)).toBeVisible();
    await expect(this.notesInput).toBeVisible();
    await expect(this.submitButton).toBeVisible();
  }

  async fillPickupDate(date?: string) {
    await this.pickupDateInput.click();
    const picker = this.page.locator(".ant-picker-dropdown:not(.ant-picker-dropdown-hidden)");
    await expect(picker).toBeVisible({ timeout: 10_000 });

    if (date) {
      await this.pickupDateInput.fill(date);
      await this.pickupDateInput.press("Enter");
    } else {
      const todayButton = picker.getByText("اليوم");
      if (await todayButton.isVisible({ timeout: 2_000 }).catch(() => false)) {
        await todayButton.click();
      } else {
        await picker
          .locator("td.ant-picker-cell-today, td.ant-picker-cell-in-view:not(.ant-picker-cell-disabled)")
          .first()
          .click();
      }
    }

    await expect(this.pickupDateInput).not.toHaveValue("");
    await expect(this.page.getByText("يجب اختيار تاريخ الاستلام")).toBeHidden({ timeout: 10_000 });
  }

  async selectPickupTime(time: Locator = this.morningTime) {
    await this.page.keyboard.press("Escape");
    const label = time.locator("xpath=ancestor::label[1]");
    if (await label.count()) {
      await label.click();
      return;
    }
    await time.click({ force: true });
  }

  async selectWarehouseType(optionIndex = 0) {
    const selector = this.warehouseTypeCombobox.first();
    await selector.scrollIntoViewIfNeeded();
    await selector.click({ force: true });
    const dropdown = this.page.locator(".ant-select-dropdown:not(.ant-select-dropdown-hidden)");
    await expect(dropdown.last()).toBeVisible({ timeout: 10_000 });
    await dropdown.last().locator(".ant-select-item-option").nth(optionIndex).click();
  }

  async selectDeliveryMethod(method: Locator = this.greenPanRepDelivery) {
    const label = method.locator("xpath=ancestor::label[1]");
    if (await label.count()) {
      await label.click();
      return;
    }
    await method.click({ force: true });
  }

  async fillNotes(notes: string) {
    await this.notesInput.fill(notes);
  }

  async clickSubmit() {
    await this.submitButton.click();
  }

  async completeRequestDetailsStep() {
    await this.fillPickupDate();
    await this.selectPickupTime();
    await this.selectDeliveryMethod();
    await this.clickSubmit();
    await expect(this.successHeading).toBeVisible({ timeout: 90_000 });
  }
}
