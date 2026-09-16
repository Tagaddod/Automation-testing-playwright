import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";

import { testdata } from "../../utils/testdata";

export class requestSuccessPage {
  readonly successHeading: Locator;
  readonly followUpMessage: Locator;
  readonly homeButton: Locator;
  readonly customerDataHeading: Locator;
  readonly clientNameInput: Locator;
  readonly primaryPhoneText: Locator;
  readonly additionalPhoneInput: Locator;
  readonly birthDateButton: Locator;
  readonly genderLabel: Locator;
  readonly maleRadio: Locator;
  readonly femaleRadio: Locator;
  readonly howDidYouKnowLabel: Locator;
  readonly howDidYouKnowCombobox: Locator;
  readonly saveCustomerDataButton: Locator;

  constructor(private page: Page) {
    const copy = testdata.greenpan.confirmation;
    this.successHeading = page.getByRole("heading", { name: copy.successHeading });
    this.followUpMessage = page.getByText(copy.followUpMessage);
    this.homeButton = page.getByRole("button", { name: copy.homeButton });
    this.customerDataHeading = page.getByRole("heading", { name: copy.customerDataHeading });
    this.clientNameInput = page.getByRole("textbox", { name: copy.clientName });
    this.primaryPhoneText = page.getByText(new RegExp(copy.primaryPhone));
    this.additionalPhoneInput = page.getByRole("textbox", { name: copy.additionalPhone });
    this.birthDateButton = page.getByRole("button", { name: copy.birthDate });
    this.genderLabel = page.getByText(copy.gender, { exact: true });
    this.maleRadio = page.getByRole("radio", { name: copy.male });
    this.femaleRadio = page.getByRole("radio", { name: copy.female });
    this.howDidYouKnowLabel = page.getByText(copy.howDidYouKnow).or(page.getByText(/كيف عرفت عن/));
    this.howDidYouKnowCombobox = page.getByRole("combobox");
    this.saveCustomerDataButton = page.getByRole("button", { name: copy.saveCustomerData });
  }

  async assertPageVisible() {
    await expect(this.successHeading).toBeVisible({ timeout: 60_000 });
    await expect(this.followUpMessage).toBeVisible();
    await expect(this.homeButton).toBeVisible();
    await expect(this.customerDataHeading).toBeVisible();
    await expect(this.saveCustomerDataButton).toBeVisible();
    await expect(this.page).not.toHaveURL(/\/new\/order/);
  }

  async assertCustomerFormVisible() {
    await expect(this.clientNameInput).toBeVisible();
    await expect(this.primaryPhoneText).toBeVisible();
    await expect(this.additionalPhoneInput).toBeVisible();
    await expect(this.birthDateButton).toBeVisible();
    await expect(this.genderLabel).toBeVisible();
    await expect(this.maleRadio).toBeVisible();
    await expect(this.femaleRadio).toBeVisible();
    await expect(this.howDidYouKnowLabel).toBeVisible();
    await expect(this.howDidYouKnowCombobox).toBeVisible();
  }

  async assertClientName(name: string) {
    await expect(this.clientNameInput).toHaveValue(name);
    await expect(this.clientNameInput).toBeDisabled();
  }

  async assertPrimaryPhone(phone: string) {
    await expect(this.page.getByText(phone, { exact: false })).toBeVisible();
  }

  async fillAdditionalPhone(phone: string) {
    await this.additionalPhoneInput.fill(phone);
    await expect(this.additionalPhoneInput).toHaveValue(phone);
  }

  async selectGender(gender: "male" | "female") {
    const radio = gender === "male" ? this.maleRadio : this.femaleRadio;
    const label = radio.locator("xpath=ancestor::label[1]");
    if ((await label.count()) > 0) {
      await label.click();
    } else {
      await radio.click({ force: true });
    }
    await expect(radio).toBeChecked();
  }

  async openBirthDatePicker() {
    await this.birthDateButton.click();
    const picker = this.page
      .locator(".ant-picker-dropdown:not(.ant-picker-dropdown-hidden)")
      .or(this.page.getByRole("dialog"))
      .or(this.page.getByRole("grid"));
    await expect(picker.first()).toBeVisible({ timeout: 10_000 });
  }

  async selectHowDidYouKnow(optionIndex = 0) {
    await this.howDidYouKnowCombobox.click();
    const option = this.page.getByRole("option").nth(optionIndex);
    await expect(option).toBeVisible({ timeout: 10_000 });
    await option.click();
  }

  async saveCustomerData() {
    await this.saveCustomerDataButton.click();
  }

  async goHome() {
    await this.homeButton.click();
    await expect(this.page).toHaveURL(/\/agent\/?(\?|$)/, { timeout: 20_000 });
  }
}
