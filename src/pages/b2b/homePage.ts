import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";

import { URLs } from "../../config/urls";

export class B2BHomePage {
  readonly branchCombobox: Locator;
  readonly createNewBranchButton: Locator;
  readonly proceedToBranchButton: Locator;

  constructor(private page: Page) {
    this.branchCombobox = page
      .locator(".ant-form-item")
      .filter({ hasText: "الفرع" })
      .first()
      .getByRole("combobox");
    this.createNewBranchButton = page.getByRole("button", { name: "إضافة فرع جديد" });
    this.proceedToBranchButton = page.locator('[tag-test-id="existing_branch__proceed_button"]');
  }

  async open() {
    await this.page.goto(URLs.b2b.base, { waitUntil: "domcontentloaded" });
  }

  async openBranchNewRequest(branchId: string) {
    await this.page.goto(`${URLs.b2b.base}/branch/${branchId}/requests/new`, {
      waitUntil: "domcontentloaded",
    });
  }

  async assertHomePageVisible() {
    await expect(this.branchCombobox).toBeVisible();
    await expect(this.createNewBranchButton).toBeVisible();
  }

  async clickSearch() {
    await this.branchCombobox.click();
  }

  async assertBranchExistsInSearch(branchName: string) {
    await this.clickSearch();
    await this.branchCombobox.fill(branchName);

    const option = this.page
      .locator("div.ant-select-dropdown:not(.ant-select-dropdown-hidden)")
      .last()
      .locator(".ant-select-item-option")
      .filter({ hasText: branchName })
      .first();

    await expect(option).toBeVisible({ timeout: 20_000 });
  }

  async selectBranch(branchName: string) {
    await this.clickSearch();
    await this.branchCombobox.fill(branchName);

    const dropdown = this.page.locator("div.ant-select-dropdown:not(.ant-select-dropdown-hidden)");
    const firstOption = dropdown
      .last()
      .locator(".ant-select-item-option")
      .filter({ hasText: branchName })
      .first()
      .or(dropdown.last().locator(".ant-select-item-option").first());

    await expect(firstOption).toBeVisible({ timeout: 20_000 });
    await firstOption.click();
    await this.proceedToBranchButton.click();
  }

  async clickCreateNewBranch() {
    await this.createNewBranchButton.click();
  }
}
