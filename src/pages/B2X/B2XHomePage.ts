import { expect, Locator, Page } from "@playwright/test";
import { URLs } from "../../config/urls";

export class B2XHomePage {
  readonly searchTraderInput: Locator;
  readonly addNewTraderBTN: Locator;
  readonly nextBTN: Locator;

  constructor(private page: Page) {
    this.searchTraderInput = page.getByRole("combobox", { name: "ابحث بإسم التاجر" });
    this.addNewTraderBTN = page.getByText("إضافة تاجر جديد", { exact: true });
    this.nextBTN = page.getByRole("button", { name: "التالي" });
  }

  async open() {
    await this.page.goto(URLs.b2x.base, { waitUntil: "domcontentloaded" });
    await expect(this.searchTraderInput).toBeVisible({ timeout: 30_000 });
  }

  async searchExistTrader(traderName: string) {
    await this.searchTraderInput.click();
    await this.searchTraderInput.fill(traderName);

    const option = this.page
      .locator(".ant-select-dropdown:not(.ant-select-dropdown-hidden)")
      .last()
      .locator(".ant-select-item-option")
      .filter({ hasText: traderName })
      .first();

    await expect(option).toBeVisible({ timeout: 15_000 });
    await option.click({ force: true });
    await expect(this.nextBTN).toBeEnabled({ timeout: 15_000 });
    await this.nextBTN.click();
  }

  private traderSearchDropdown(): Locator {
    return this.page.locator(".ant-select-dropdown:not(.ant-select-dropdown-hidden)").last();
  }

  async addNewTrader(traderName: string) {
    await this.searchTraderInput.click();
    await this.searchTraderInput.fill(traderName);

    const dropdown = this.traderSearchDropdown();
    await expect(dropdown).toBeVisible({ timeout: 15_000 });

    const addBtn = dropdown.getByText("إضافة تاجر جديد", { exact: true });
    await expect(addBtn).toBeVisible({ timeout: 15_000 });
    await addBtn.click();
  }

  async searchTraderWithNoResults(traderName: string) {
    await this.searchTraderInput.click();
    await this.searchTraderInput.fill(traderName);
  }

  traderDropdownEmptyState() {
    return this.page.getByRole("listbox").getByText("لا يوجد عملاء بهذا الإسم");
  }
}
