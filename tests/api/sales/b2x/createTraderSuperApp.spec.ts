import { Channel, CountryCode } from "../../../../src/api/enums";
import {
  normalizePhone,
  SALES_EGYPT_COUNTRY_CODE,
  SALES_JORDAN_COUNTRY_CODE,
  SALES_SAUDI_COUNTRY_CODE,
  validJordanTraderVariables,
  validSaudiTraderVariables,
  validTraderVariables,
} from "../../../../src/api/sales/testData";
import { saveApiResponse } from "../../../../src/api/saveApiResponse";
import { expect, test } from "../../../../src/fixtures/apiFixture";
import { getFirstCollectableWithMeasure } from "../helpers";

test.describe("CreateTraderSuperApp", { tag: ["@sales-app-regression"] }, () => {
  test.describe.configure({ timeout: 180_000 });

  test(
    "CreateTraderSuperApp - Valid",
    { tag: ["@all-regression", "@sales-app-regression"] },
    async ({ api, salesAppEgyptApi }) => {
      const { collectableId } = await getFirstCollectableWithMeasure(
        api,
        Channel.B2X,
        CountryCode.EG,
      );
      const variables = validTraderVariables({ collectable_id: collectableId });

      const response = await test.step("Create Trader", async () =>
        salesAppEgyptApi.sales.createTraderSuperApp(variables));

      await test.step("Verify Trader", async () => {
        expect(response.status ?? 200, "Successful create-trader should return HTTP 200.").toBe(
          200,
        );
        expect(
          response.errors,
          "createTraderSuperApp should not return GraphQL errors.",
        ).toBeUndefined();

        const created = response.data?.createTraderSuperApp;
        expect(created, "The API should create a trader successfully.").toBeDefined();
        expect(created?.id, "A valid Trader ID should be returned.").toBeTruthy();
        expect(created?.name, "The created trader should include a trader name.").toBeTruthy();
        expect(created?.phone, "The created trader should include a phone number.").toBeTruthy();
        expect(created?.country_code, "The trader country code should be +20.").toBe(
          SALES_EGYPT_COUNTRY_CODE,
        );
        expect(
          normalizePhone(created!.phone),
          "The returned phone number should match the generated phone number.",
        ).toBe(normalizePhone(variables.phone));
      });

      await test.step("Extract and Save Trader ID and phone", async () => {
        const traderId = response.data?.createTraderSuperApp?.id;
        expect(traderId, "A valid Trader ID should be returned.").toBeTruthy();

        saveApiResponse("traderId", {
          traderId: traderId!,
          phone: variables.phone,
        });
      });
    },
  );

  test(
    "Create Trader SuperApp with Valid Saudi data",
    { tag: ["@all-regression", "@sales-app-regression"] },
    async ({ api, salesAppSaudiApi }) => {
      const { collectableId } = await getFirstCollectableWithMeasure(
        api,
        Channel.B2X,
        CountryCode.SA,
      );
      const variables = validSaudiTraderVariables({ collectable_id: collectableId });

      const response = await test.step("Create Trader Saudi", async () =>
        salesAppSaudiApi.sales.createTraderSuperApp(variables));

      await test.step("Verify Trader Saudi", async () => {
        expect(response.status ?? 200, "Successful create-trader should return HTTP 200.").toBe(
          200,
        );
        expect(
          response.errors,
          "createTraderSuperApp should not return GraphQL errors.",
        ).toBeUndefined();

        const created = response.data?.createTraderSuperApp;
        expect(created, "The API should create a trader successfully.").toBeDefined();
        expect(created?.id, "A valid Trader ID should be returned.").toBeTruthy();
        expect(created?.name, "The created trader should include a trader name.").toBeTruthy();
        expect(created?.phone, "The created trader should include a phone number.").toBeTruthy();
        expect(created?.country_code, "The trader country code should be +966.").toBe(
          SALES_SAUDI_COUNTRY_CODE,
        );
        expect(
          normalizePhone(created!.phone),
          "The returned phone number should match the generated phone number.",
        ).toBe(normalizePhone(variables.phone));
      });

      await test.step("Extract and Save Saudi Trader ID and phone", async () => {
        const traderId = response.data?.createTraderSuperApp?.id;
        expect(traderId, "A valid Trader ID should be returned.").toBeTruthy();

        saveApiResponse("traderIdSaudi", {
          traderId: traderId!,
          phone: variables.phone,
        });
      });
    },
  );

  test(
    "Create Trader SuperApp with valid data withValid Jordan data",
    { tag: ["@all-regression", "@sales-app-regression"] },
    async ({ api, salesAppJordanApi }) => {
      const { collectableId } = await getFirstCollectableWithMeasure(
        api,
        Channel.B2X,
        CountryCode.JO,
      );
      const variables = validJordanTraderVariables({ collectable_id: collectableId });

      const response = await test.step("Create Trader Jordan", async () =>
        salesAppJordanApi.sales.createTraderSuperApp(variables));

      await test.step("Verify Trader Jordan", async () => {
        expect(response.status ?? 200, "Successful create-trader should return HTTP 200.").toBe(
          200,
        );
        expect(
          response.errors,
          "createTraderSuperApp should not return GraphQL errors.",
        ).toBeUndefined();

        const created = response.data?.createTraderSuperApp;
        expect(created, "The API should create a trader successfully.").toBeDefined();
        expect(created?.id, "A valid Trader ID should be returned.").toBeTruthy();
        expect(created?.name, "The created trader should include a trader name.").toBeTruthy();
        expect(created?.phone, "The created trader should include a phone number.").toBeTruthy();
        expect(created?.country_code, "The trader country code should be +962.").toBe(
          SALES_JORDAN_COUNTRY_CODE,
        );
        expect(
          normalizePhone(created!.phone),
          "The returned phone number should match the generated phone number.",
        ).toBe(normalizePhone(variables.phone));
      });

      await test.step("Extract and Save Jordan Trader ID and phone", async () => {
        const traderId = response.data?.createTraderSuperApp?.id;
        expect(traderId, "A valid Trader ID should be returned.").toBeTruthy();

        saveApiResponse("traderIdJordan", {
          traderId: traderId!,
        });
      });
    },
  );
});
