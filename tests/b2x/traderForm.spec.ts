import { test, expect } from "@playwright/test";
import { PoManager } from "../../src/core/PoManager";
import { images } from "../../src/utils/images";
import { getB2xTestData, testdata } from "../../src/utils/testdata";
import { goToTraderForm, submitTraderAndProceedToCollectables } from "./b2xFlows";

test.describe("B2X trader form", () => {
  let po: PoManager;
  let data: ReturnType<typeof getB2xTestData>;

  test.beforeEach(async ({ page }) => {
    po = new PoManager(page);
    data = getB2xTestData();
    await goToTraderForm(po, data.traderName);
    await expect(page).not.toHaveURL(/\/auth/);
  });

  test("register new trader with valid data (no warehouse)", { tag: ["@b2x", "@smoke", "@regression", "@e2e"] }, async () => {
    const form = po.getB2XFormPage();

    await form.completeTraderForm(data);
    await submitTraderAndProceedToCollectables(po, data.traderName);
  });

  test("register new trader with warehouse", { tag: ["@b2x", "@regression", "@e2e"] }, async () => {
    const form = po.getB2XFormPage();

    await form.completeTraderFormWithWarehouse(data);
    await submitTraderAndProceedToCollectables(po, data.traderName);
  });

  test("registration success page shows confirmation and action buttons", { tag: ["@b2x", "@regression"] }, async () => {
    const form = po.getB2XFormPage();

    await form.completeTraderForm(data);
    await form.submitTraderForm();
    await po.getB2XTraderRegistrationSuccessPage().assertSuccessPage(data.traderName);
  });

  test("register another trader returns to trader search", { tag: ["@b2x", "@regression"] }, async () => {
    const form = po.getB2XFormPage();

    await form.completeTraderForm(data);
    await form.submitTraderForm();
    await po.getB2XTraderRegistrationSuccessPage().clickRegisterAnotherTrader();
  });

  test("create request from success page opens collectables step", { tag: ["@b2x", "@regression", "@e2e"] }, async ({ page }) => {
    const form = po.getB2XFormPage();

    await form.completeTraderForm(data);
    await form.submitTraderForm();
    await po.getB2XTraderRegistrationSuccessPage().clickCreateRequestForTrader(data.traderName);
    await expect(page.getByRole("heading", { name: "أدخل الكميات" })).toBeVisible({ timeout: 30_000 });
  });

  test("all required form fields are visible", { tag: ["@b2x", "@regression"] }, async () => {
    await po.getB2XFormPage().assertAllRequiredFieldsVisible();
  });

  test("country code enables pickup address field", { tag: ["@b2x", "@regression"] }, async () => {
    const form = po.getB2XFormPage();
    await expect(form.pickupAddress).toBeDisabled();
    await form.fillPhoneNumber(getB2xTestData().phone);
    await form.fillCountryCode();
    await expect(form.pickupAddress).toBeEnabled();
  });

  test("selecting no warehouse disables warehouse address", { tag: ["@b2x", "@regression"] }, async () => {
    const form = po.getB2XFormPage();
    await form.selectHasWarehouseNo();
    await expect(form.warehouseAddress).toBeDisabled();
  });

  test("selecting yes warehouse shows warehouse address", { tag: ["@b2x", "@regression"] }, async () => {
    const form = po.getB2XFormPage();
    await form.fillPhoneNumber(getB2xTestData().phone);
    await form.fillCountryCode();
    await form.selectHasWarehouseYes();
    await expect(form.warehouseAddress).toBeVisible();
  });

  test("show error when phone number is missing", { tag: ["@b2x", "@regression"] }, async () => {
    await po.getB2XFormPage().clickNext();
    await expect(po.getB2XFormPage().phoneErrorMessage).toBeVisible();
  });

  test("submit with short phone validates next required field", { tag: ["@b2x", "@regression"] }, async () => {
    const form = po.getB2XFormPage();
    await form.fillPhoneNumber(testdata.b2x.invalidPhone);
    await form.fillCountryCode();
    await form.clickNext();
    await expect(form.phoneErrorMessage).not.toBeVisible();
    await expect(form.traderTypeErrorMessage).toBeVisible();
  });

  test("show error when country code is missing", { tag: ["@b2x", "@regression"] }, async () => {
    const form = po.getB2XFormPage();
    await form.fillPhoneNumber(getB2xTestData().phone);
    await form.clickNext();
    await expect(form.countryCodeErrorMessage).toBeVisible();
  });

  test("show error when trader type is missing", { tag: ["@b2x", "@regression"] }, async () => {
    const form = po.getB2XFormPage();
    const data = getB2xTestData();

    await form.fillPhoneNumber(data.phone);
    await form.fillCountryCode();
    await form.clickNext();
    await expect(form.traderTypeErrorMessage).toBeVisible();
  });

  test("submit without national ID image validates next required field", { tag: ["@b2x", "@regression"] }, async () => {
    const form = po.getB2XFormPage();
    const data = getB2xTestData();

    await form.fillPhoneNumber(data.phone);
    await form.fillCountryCode();
    await form.fillTraderType();
    await form.clickNext();
    await expect(form.nationalIdErrorMessage).not.toBeVisible();
    await expect(form.vehicleTypeErrorMessage).toBeVisible();
  });

  test("submit without personal image validates next required field", { tag: ["@b2x", "@regression"] }, async () => {
    const form = po.getB2XFormPage();
    const data = getB2xTestData();

    await form.fillPhoneNumber(data.phone);
    await form.fillCountryCode();
    await form.fillTraderType();
    await form.fillNationalIDimg(images.banner);
    await form.clickNext();
    await expect(form.personalImageErrorMessage).not.toBeVisible();
    await expect(form.vehicleTypeErrorMessage).toBeVisible();
  });

  test("show error when vehicle type is missing", { tag: ["@b2x", "@regression"] }, async () => {
    const form = po.getB2XFormPage();
    const data = getB2xTestData();

    await form.fillPhoneNumber(data.phone);
    await form.fillCountryCode();
    await form.fillTraderType();
    await form.fillNationalIDimg(images.banner);
    await form.fillPersonalImg(images.banner);
    await form.clickNext();
    await expect(form.vehicleTypeErrorMessage).toBeVisible();
  });

  test("show error when pickup address is missing", { tag: ["@b2x", "@regression"] }, async () => {
    const form = po.getB2XFormPage();
    const data = getB2xTestData();

    await form.fillTraderFormBasics(data);
    await form.selectHasWarehouseNo();
    await form.clickNext();
    await expect(form.pickupAddressErrorMessage).toBeVisible();
  });

  test("show error when warehouse address is missing with warehouse yes", { tag: ["@b2x", "@regression"] }, async () => {
    const form = po.getB2XFormPage();
    const data = getB2xTestData();

    await form.fillTraderFormBasics(data);
    await form.selectHasWarehouseYes();
    await form.fillPickupAddress(data.address);
    await form.clickNext();
    await expect(form.warehouseAddressErrorMessage).toBeVisible();
  });
});
