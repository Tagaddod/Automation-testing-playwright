import { test, expect } from "../../../src/fixtures/apiFixture";
import { saveApiResponse } from "../../../src/api/saveApiResponse";
import {
  buildTraderData,
  buildTraderRequestData,
} from "../../../src/api/b2x/testData_b2x";

test.describe(
  "B2X GraphQL API",
  { tag: ["@api", "@b2x", "@regression"] },
  () => {
    test("create trader", async ({ api }) => {
      const data = buildTraderData();
      const response = await api.b2x.createTrader(data);

      // Surface the real server error (data is null whenever errors exist).
      expect(
        response.errors,
        `createTrader returned errors: ${JSON.stringify(response.errors)}` ).toBeUndefined();

      const trader = response.data?.createTrader;
      const traderId = trader?.id;
      expect(traderId, "No trader id returned from createTrader").toBeTruthy();

      // Persist the trader id so the upcoming B2X endpoints can reuse it.
      const filePath = saveApiResponse("createTrader", response);
      console.log(`Saved create trader response to ${filePath}`);
      console.log(`Trader id: ${traderId}`);
    });

    test("get collectables", async ({ api }) => {
      const response = await api.b2x.getCollectables();

      // Surface the real server error (data is null whenever errors exist).
      expect(
        response.errors,
        `getCollectables returned errors: ${JSON.stringify(response.errors)}`
      ).toBeUndefined();

      const collectables = response.data?.getCollectables;
      expect(
        collectables?.length,
        "No collectables returned from getCollectables"
      ).toBeTruthy();

      const first = collectables![0];
      const collectableId = first.id;
      const measureId = first.measures?.[0]?.id;
      expect(collectableId, "First collectable has no id").toBeTruthy();
      expect(measureId, "First collectable has no measures").toBeTruthy();

      // Persist the first collectable id and measure id for further endpoints.
      const filePath = saveApiResponse("b2xGetCollectables", response);
      console.log(`Saved get collectables response to ${filePath}`);
      console.log(`Collectable id: ${collectableId}, Measure id: ${measureId}`);
    });

    test("create trader request", async ({ api }) => {
      // Provision prerequisites so this test stays independent.
      const traderResponse = await api.b2x.createTrader(buildTraderData());
      expect(
        traderResponse.errors,
        `createTrader returned errors: ${JSON.stringify(traderResponse.errors)}`
      ).toBeUndefined();
      const traderId = traderResponse.data?.createTrader?.id;
      expect(traderId, "No trader id returned from createTrader").toBeTruthy();

      const collectablesResponse = await api.b2x.getCollectables();
      expect(
        collectablesResponse.errors,
        `getCollectables returned errors: ${JSON.stringify(collectablesResponse.errors)}`
      ).toBeUndefined();
      const firstCollectable = collectablesResponse.data?.getCollectables?.[0];
      const collectableId = firstCollectable?.id;
      const measureId = firstCollectable?.measures?.[0]?.id;
      expect(collectableId, "No collectables returned from getCollectables").toBeTruthy();
      expect(measureId, "First collectable has no measures").toBeTruthy();

      const data = buildTraderRequestData({
        trader_id: traderId!,
        collectable_id: collectableId!,
        measure_id: measureId!,
        count: 2,
      });

      const response = await api.b2x.createTraderRequest(data);

      // Surface the real server error (data is null whenever errors exist).
      expect(
        response.errors,
        `createTraderRequestV2 returned errors: ${JSON.stringify(response.errors)}`
      ).toBeUndefined();

      const traderRequest = response.data?.createTraderRequestV2;
      expect(traderRequest?.id, "No trader request id returned").toBeTruthy();

      const filePath = saveApiResponse("createTraderRequest", response);
      console.log(`Saved create trader request response to ${filePath}`);
      console.log(`Trader request id: ${traderRequest?.id}`);
    });
  }
);
