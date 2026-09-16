import type { Locator, Page, Route } from "@playwright/test";
import { expect } from "@playwright/test";

import { signBranchServiceContract } from "../../utils/signBranchServiceContract";
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
    this.submitButton = page.getByRole("button", { name: /إرسال الطلب|جاري الإرسال/ });
    this.dawnPickupTime = page.getByRole("radio", { name: /الفجر/ });
    this.totalPriceHeading = page.getByText(testdata.b2b.priceLabels.totalPrice);
    this.payToCustomerLabel = page.getByText(testdata.b2b.priceLabels.payToCustomer, {
      exact: true,
    });
    this.clientWillPayLabel = page.getByText(testdata.b2b.priceLabels.clientWillPay, {
      exact: true,
    });
    this.totalLabel = page.getByText(testdata.b2b.priceLabels.total, { exact: true });
    this.successHeading = page
      .getByRole("heading", { name: /تم تسجيل الطلب|تم إرسال الطلب/ })
      .or(page.getByText(testdata.b2b.confirmation.requestSuccessHeading, { exact: true }));
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
    await expect(this.submitButton.last()).toBeVisible();
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
    const tagged = this.page
      .locator('[tag-test-id="create-new-request-form-submit-button"]')
      .filter({ visible: true });
    const button = (await tagged.count())
      ? tagged.first()
      : this.page.getByRole("button", { name: "إرسال الطلب" }).filter({ visible: true }).first();
    await button.scrollIntoViewIfNeeded();
    await button.click({ force: true });
  }

  async waitForSubmitToFinish() {
    await expect(this.page.getByRole("button", { name: /جاري الإرسال/ }))
      .toBeHidden({
        timeout: 90_000,
      })
      .catch(() => undefined);
  }

  async dismissNetworkError() {
    const toast = this.page.getByText("Network Error");
    if (
      await toast
        .first()
        .isVisible()
        .catch(() => false)
    ) {
      await this.page
        .getByRole("img", { name: "close-circle" })
        .first()
        .click({ force: true })
        .catch(() => undefined);
      await expect(toast.first())
        .toBeHidden({ timeout: 5_000 })
        .catch(() => undefined);
    }
  }

  async selectPickupTime() {
    await this.page
      .locator(".ant-picker-dropdown:not(.ant-picker-dropdown-hidden)")
      .waitFor({ state: "hidden", timeout: 3_000 })
      .catch(() => undefined);

    const morning = this.page.getByRole("radio", { name: /صباحاً ٦/ });
    const label = morning.locator("xpath=ancestor::label[1]");
    if ((await label.count()) > 0) {
      await label.click();
    } else {
      await this.page.getByText("صباحاً", { exact: true }).click();
    }
    await expect(morning).toBeChecked({ timeout: 10_000 });
  }

  /** Picks a future day: today combined with the dawn slot is already in the past and is rejected. */
  async fillPickupDate(daysFromToday = 1) {
    const pickerInput = this.pickupDateInput;
    await pickerInput.scrollIntoViewIfNeeded();
    await pickerInput.click({ force: true });

    const target = new Date();
    target.setDate(target.getDate() + daysFromToday);
    const isoDate = `${target.getFullYear()}-${String(target.getMonth() + 1).padStart(2, "0")}-${String(target.getDate()).padStart(2, "0")}`;

    const picker = this.page.locator(".ant-picker-dropdown:not(.ant-picker-dropdown-hidden)");
    await expect(picker)
      .toBeVisible({ timeout: 10_000 })
      .catch(() => undefined);

    const dayCell = picker.locator(`td[title="${isoDate}"]:not(.ant-picker-cell-disabled)`).first();
    if (await dayCell.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await dayCell.click();
    } else {
      await pickerInput.fill(isoDate);
      await pickerInput.press("Enter");
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
    let lastGraphqlBody = "";
    let lastRequestPayload = "";

    const relayCreateRequest = async (route: Route) => {
      const postData = route.request().postData() ?? "";
      if (route.request().method() !== "POST" || !/createBusinessRequest/i.test(postData)) {
        await route.continue();
        return;
      }

      lastRequestPayload = postData.slice(0, 2000);
      try {
        const response = await route.fetch({ timeout: 90_000 });
        const body = await response.text();
        lastGraphqlBody = body.slice(0, 2000);
        requestId = requestId ?? extractCreatedRequestId(body);
        await route.fulfill({
          status: response.status(),
          contentType: response.headers()["content-type"] ?? "application/json",
          body,
        });
      } catch (error) {
        lastGraphqlBody = `relay failed: ${String(error)}`;
        await route.continue();
      }
    };

    await this.page.route("**/graphql", relayCreateRequest);
    try {
      for (let attempt = 0; attempt < 3; attempt++) {
        await this.dismissNetworkError();
        await this.submit();
        await this.waitForSubmitToFinish();

        if (await this.successHeading.isVisible().catch(() => false)) {
          break;
        }

        if (/CONTRACT_MISSING/i.test(lastGraphqlBody)) {
          const branchId = this.page.url().match(/\/branch\/(\d+)/)?.[1];
          if (!branchId) {
            throw new Error(`CONTRACT_MISSING and no branch id in URL=${this.page.url()}`);
          }
          await signBranchServiceContract(branchId);
          await this.dismissNetworkError();
          continue;
        }

        if (
          await this.page
            .getByText("Network Error")
            .first()
            .isVisible()
            .catch(() => false)
        ) {
          await this.dismissNetworkError();
          continue;
        }

        break;
      }

      await expect(this.successHeading).toBeVisible({ timeout: 90_000 });
    } catch (error) {
      throw new Error(
        `Submit did not show success. URL=${this.page.url()} payload=${lastRequestPayload || "(none)"} GraphQL=${lastGraphqlBody || "(none)"} Original=${String(error)}`,
        { cause: error },
      );
    } finally {
      await this.page.unroute("**/graphql", relayCreateRequest);
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
