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
    const pickerInput = this.pickupDateInput;
    await pickerInput.scrollIntoViewIfNeeded();
    await pickerInput.click({ force: true });

    const picker = this.page.locator(".ant-picker-dropdown:not(.ant-picker-dropdown-hidden)");
    await expect(picker)
      .toBeVisible({ timeout: 10_000 })
      .catch(() => undefined);

    const todayButton = picker.getByText("اليوم");
    if (await todayButton.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await todayButton.click();
    } else {
      const todayCell = picker
        .locator(
          "td.ant-picker-cell-today, td.ant-picker-cell-in-view:not(.ant-picker-cell-disabled)",
        )
        .first();
      if (await todayCell.isVisible({ timeout: 2_000 }).catch(() => false)) {
        await todayCell.click();
      } else {
        const today = new Date();
        const day = String(today.getDate()).padStart(2, "0");
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const year = today.getFullYear();
        await pickerInput.fill(`${day}/${month}/${year}`);
        await pickerInput.press("Enter");
      }
    }

    await expect(pickerInput).not.toHaveValue("", { timeout: 10_000 });
  }

  async completeRequestDetailsStep(): Promise<{ requestId?: string }> {
    await this.fillPickupDate();
    await this.selectPickupTime();
    if ((await this.pickupDateInput.inputValue()) === "") {
      await this.fillPickupDate();
    }

    let requestId: string | undefined;
    const captureRequestId = async (response: import("@playwright/test").Response) => {
      if (!response.url().includes("graphql") || response.request().method() !== "POST") {
        return;
      }
      const body = await response.text().catch(() => "");
      const captured = extractCreatedRequestId(body);
      if (captured) requestId = captured;
    };

    this.page.on("response", captureRequestId);
    try {
      await this.submit();
      await expect(this.successHeading).toBeVisible({ timeout: 90_000 });
    } finally {
      this.page.off("response", captureRequestId);
    }

    requestId =
      requestId ??
      this.page.url().match(/\/(?:requests?|request)\/(\d+)/i)?.[1] ??
      (
        await this.page
          .locator("body")
          .innerText()
          .catch(() => "")
      ).match(/(?:طلب|request)\s*[#:]?\s*(\d{3,})/i)?.[1];

    return { requestId };
  }
}

function extractCreatedRequestId(body: string): string | undefined {
  try {
    const json = JSON.parse(body) as { data?: Record<string, { id?: string | number } | null> };
    const data = json.data;
    if (!data) return undefined;

    for (const [key, value] of Object.entries(data)) {
      if (/request/i.test(key) && value?.id != null) {
        return String(value.id);
      }
    }

    return undefined;
  } catch {
    const match =
      body.match(/create\w*Request\w*[^}]*"id"\s*:\s*"?(\d+)"?/i) ??
      body.match(/"id"\s*:\s*"?(\d+)"?/);
    return match?.[1];
  }
  return undefined;
}
