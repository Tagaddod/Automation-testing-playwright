import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";

import { testdata } from "../../utils/testdata";

export type B2BPriceSummaryExpectation = {
  payToCustomer?: number;
  clientWillPay?: number;
  total: number;
};

export class requestDetailsPage {
  readonly stepLabel: Locator;
  readonly pageHeading: Locator;
  readonly pickupDateInput: Locator;
  readonly notesInput: Locator;
  readonly submitButton: Locator;
  readonly dawnPickupTime: Locator;
  readonly totalPriceHeading: Locator;
  readonly payToCustomerLabel: Locator;
  readonly clientWillPayLabel: Locator;
  readonly totalLabel: Locator;
  readonly successHeading: Locator;

  constructor(private page: Page) {
    this.stepLabel = page.getByText("خطوه 2 / 2");
    this.pageHeading = page.getByText("تفاصيل التجميع");
    this.pickupDateInput = page.locator('input[id="pickupDate"]');
    this.notesInput = page.locator("#notes");
    this.submitButton = page.getByRole("button", { name: "إرسال الطلب" });
    this.dawnPickupTime = page.getByText("الفجر");
    this.totalPriceHeading = page.getByText(testdata.b2b.priceLabels.totalPrice);
    this.payToCustomerLabel = page.getByText(testdata.b2b.priceLabels.payToCustomer, {
      exact: true,
    });
    this.clientWillPayLabel = page.getByText(testdata.b2b.priceLabels.clientWillPay, {
      exact: true,
    });
    this.totalLabel = page.getByText(testdata.b2b.priceLabels.total, { exact: true });
    this.successHeading = page.getByRole("heading", {
      name: testdata.b2b.confirmation.requestSuccessHeading,
    });
  }

  amountNearLabel(label: string): Locator {
    return this.page
      .getByText(label, { exact: true })
      .locator("xpath=following::*[contains(normalize-space(.), 'جنيه')][1]");
  }

  formatAmount(amount: number) {
    return `${amount} جنيه`;
  }

  async assertPageVisible() {
    await expect(this.pageHeading).toBeVisible({ timeout: 15_000 });
    await expect(this.pickupDateInput).toBeVisible();
    await expect(this.submitButton).toBeVisible();
    await expect(this.totalPriceHeading).toBeVisible();
  }

  async assertPriceSummary(expected: B2BPriceSummaryExpectation) {
    await expect(this.totalPriceHeading).toBeVisible({ timeout: 15_000 });

    if (expected.payToCustomer !== undefined) {
      await expect(this.amountNearLabel(testdata.b2b.priceLabels.payToCustomer)).toContainText(
        this.formatAmount(expected.payToCustomer),
      );
    } else {
      await expect(this.payToCustomerLabel).toBeHidden();
    }

    if (expected.clientWillPay !== undefined) {
      await expect(this.amountNearLabel(testdata.b2b.priceLabels.clientWillPay)).toContainText(
        this.formatAmount(expected.clientWillPay),
      );
    } else {
      await expect(this.clientWillPayLabel).toBeHidden();
    }

    if (expected.total !== undefined) {
      const totalAmount = this.amountNearLabel(testdata.b2b.priceLabels.total);
      const hasNetTotalRow =
        (await this.totalLabel.isVisible({ timeout: 2_000 }).catch(() => false)) &&
        (await totalAmount.isVisible({ timeout: 1_000 }).catch(() => false));

      if (hasNetTotalRow) {
        await expect(totalAmount).toContainText(this.formatAmount(expected.total));
      } else if (expected.clientWillPay === undefined && expected.payToCustomer !== undefined) {
        await expect(this.amountNearLabel(testdata.b2b.priceLabels.payToCustomer)).toContainText(
          this.formatAmount(expected.total),
        );
      } else if (expected.payToCustomer === undefined && expected.clientWillPay !== undefined) {
        await expect(this.amountNearLabel(testdata.b2b.priceLabels.clientWillPay)).toContainText(
          this.formatAmount(expected.total),
        );
      }
    }
  }

  async fillNotes(notes: string) {
    await this.notesInput.fill(notes);
  }

  async submit() {
    await this.submitButton.click();
  }

  async selectPickupTime() {
    await this.page.keyboard.press("Escape");
    await this.dawnPickupTime.click({ force: true });
  }

  async fillPickupDate() {
    await this.pickupDateInput.click();
    const picker = this.page.locator(".ant-picker-dropdown:not(.ant-picker-dropdown-hidden)");
    const todayButton = picker.getByText("اليوم");
    if (await todayButton.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await todayButton.click();
    } else if (await picker.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await picker
        .locator(
          "td.ant-picker-cell-today, td.ant-picker-cell-in-view:not(.ant-picker-cell-disabled)",
        )
        .first()
        .click();
    } else {
      const today = new Date();
      const day = String(today.getDate()).padStart(2, "0");
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const year = today.getFullYear();
      await this.pickupDateInput.fill(`${day}/${month}/${year}`);
    }
    await expect(this.pickupDateInput).not.toHaveValue("");
  }

  async completeRequestDetailsStep() {
    await this.fillPickupDate();
    await this.selectPickupTime();
    await this.submit();
    await expect(this.successHeading).toBeVisible({ timeout: 90_000 });
  }
}
