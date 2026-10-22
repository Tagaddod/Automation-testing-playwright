import { Channel, CountryCode } from "../../../../src/api/enums";
import {
  VALID_TRADER_REQUEST_COLLECTION_DATE,
  validJordanTraderRequestVariables,
  validJordanTraderVariables,
  validSaudiTraderRequestVariables,
  validSaudiTraderVariables,
  validTraderRequestVariables,
  validTraderVariables,
} from "../../../../src/api/sales/testData";
import { saveApiResponse } from "../../../../src/api/saveApiResponse";
import { expect, test } from "../../../../src/fixtures/apiFixture";
import { getFirstCollectableWithMeasure } from "../helpers";

test.describe("CreateTraderRequestSalesAgent", { tag: ["@sales-app-regression"] }, () => {
  test.describe.configure({ mode: "serial", timeout: 180_000 });

  test(
    "CreateTraderRequestSalesAgent - Valid",
    {
      tag: [
        "@all-regression",
        "@sales-app-regression",
        "@create-b2x-request",
        "@create-b2x-request-API",
      ],
    },
    async ({ api, salesAppEgyptApi }) => {
      const { collectableId, measureId } = await getFirstCollectableWithMeasure(
        api,
        Channel.B2X,
        CountryCode.EG,
      );
      const traderVariables = validTraderVariables({ collectable_id: collectableId });
      const traderResponse = await salesAppEgyptApi.sales.createTraderSuperApp(traderVariables);

      expect(
        traderResponse.errors,
        "createTraderSuperApp should not return GraphQL errors.",
      ).toBeUndefined();

      const traderId = traderResponse.data?.createTraderSuperApp?.id;
      expect(traderId, "A valid Trader ID should be returned.").toBeTruthy();

      const variables = validTraderRequestVariables(traderId!, {
        collectable_id: collectableId,
        measure_id: measureId,
        collection_date: VALID_TRADER_REQUEST_COLLECTION_DATE,
      });

      expect(variables.trader_id, "Trader request must use the created Trader ID.").toBe(traderId);

      const response = await salesAppEgyptApi.sales.createTraderRequestSalesAgent(variables);

      console.warn(
        "createTraderRequestSalesAgent response:",
        JSON.stringify(response.responseBody ?? response.data, null, 2),
      );

      const created = response.data?.createTraderRequestSalesAgent;
      expect(created, "The API should create a trader request successfully.").toBeDefined();
      expect(created?.id, "A valid Request ID should be returned.").toBeTruthy();
      expect(created?.status, "The created trader request should include a status.").toBeTruthy();

      saveApiResponse("requestId", {
        requestId: created!.id,
      });
    },
  );

  test(
    "CreateTraderRequestSalesAgent - Valid Saudi",
    { tag: ["@all-regression", "@sales-app-regression", "@create-b2x-request"] },
    async ({ api, salesAppSaudiApi }) => {
      const { collectableId, measureId } = await getFirstCollectableWithMeasure(
        api,
        Channel.B2X,
        CountryCode.SA,
      );
      const traderVariables = validSaudiTraderVariables({ collectable_id: collectableId });
      const traderResponse = await salesAppSaudiApi.sales.createTraderSuperApp(traderVariables);

      expect(
        traderResponse.errors,
        "createTraderSuperApp should not return GraphQL errors.",
      ).toBeUndefined();

      const traderId = traderResponse.data?.createTraderSuperApp?.id;
      expect(traderId, "A valid Trader ID should be returned.").toBeTruthy();

      const variables = validSaudiTraderRequestVariables(traderId!, {
        collectable_id: collectableId,
        measure_id: measureId,
        collection_date: VALID_TRADER_REQUEST_COLLECTION_DATE,
      });

      expect(variables.trader_id, "Trader request must use the created Trader ID.").toBe(traderId);

      const response = await salesAppSaudiApi.sales.createTraderRequestSalesAgent(variables);

      console.warn(
        "createTraderRequestSalesAgent Saudi response:",
        JSON.stringify(response.responseBody ?? response.data, null, 2),
      );

      const created = response.data?.createTraderRequestSalesAgent;
      expect(created, "The API should create a trader request successfully.").toBeDefined();
      expect(created?.id, "A valid Request ID should be returned.").toBeTruthy();
      expect(created?.status, "The created trader request should include a status.").toBeTruthy();

      saveApiResponse("requestIdSaudi", {
        requestId: created!.id,
      });
    },
  );

  test(
    "CreateTraderRequestSalesAgent - Valid Jordan",
    { tag: ["@all-regression", "@sales-app-regression", "@create-b2x-request"] },
    async ({ api, salesAppJordanApi }) => {
      const { collectableId, measureId } = await getFirstCollectableWithMeasure(
        api,
        Channel.B2X,
        CountryCode.JO,
      );
      const traderVariables = validJordanTraderVariables({ collectable_id: collectableId });
      const traderResponse = await salesAppJordanApi.sales.createTraderSuperApp(traderVariables);

      expect(
        traderResponse.errors,
        "createTraderSuperApp should not return GraphQL errors.",
      ).toBeUndefined();

      const traderId = traderResponse.data?.createTraderSuperApp?.id;
      expect(traderId, "A valid Trader ID should be returned.").toBeTruthy();

      const variables = validJordanTraderRequestVariables(traderId!, {
        collectable_id: collectableId,
        measure_id: measureId,
        collection_date: VALID_TRADER_REQUEST_COLLECTION_DATE,
      });

      expect(variables.trader_id, "Trader request must use the created Trader ID.").toBe(traderId);

      const response = await salesAppJordanApi.sales.createTraderRequestSalesAgent(variables);

      console.warn(
        "createTraderRequestSalesAgent Jordan response:",
        JSON.stringify(response.responseBody ?? response.data, null, 2),
      );

      const created = response.data?.createTraderRequestSalesAgent;
      expect(created, "The API should create a trader request successfully.").toBeDefined();
      expect(created?.id, "A valid Request ID should be returned.").toBeTruthy();
      expect(created?.status, "The created trader request should include a status.").toBeTruthy();

      saveApiResponse("requestIdJordan", {
        requestId: created!.id,
      });
    },
  );
});
