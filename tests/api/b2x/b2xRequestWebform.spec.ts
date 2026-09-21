import type { ApiManager } from "../../../src/api/ApiManager";
import {
  buildJordanTraderData,
  buildSaudiTraderData,
  buildTraderData,
  buildTraderRequestData,
} from "../../../src/api/b2x/testData";
import { Channel, CountryCode } from "../../../src/api/enums";
import { saveApiResponse } from "../../../src/api/saveApiResponse";
import { expect, test } from "../../../src/fixtures/apiFixture";

async function getFirstCollectable(
  api: ApiManager,
  countryCode: CountryCode = CountryCode.EG,
): Promise<{ collectableId: string; measureId: string }> {
  const response = await api.b2x.getCollectables([Channel.B2X], countryCode);
  expect(
    response.errors,
    `getCollectables (${countryCode}) returned errors: ${JSON.stringify(response.errors)}`,
  ).toBeUndefined();

  const first = response.data?.getCollectables?.[0];
  const collectableId = first?.id;
  const measureId = first?.measures?.[0]?.id;
  expect(
    collectableId,
    `No ${countryCode} collectables returned from getCollectables`,
  ).toBeTruthy();
  expect(measureId, `First ${countryCode} collectable has no measures`).toBeTruthy();

  return { collectableId: collectableId!, measureId: measureId! };
}

test.describe("B2X GraphQL API", { tag: ["@webform-API-regression"] }, () => {
  test(
    "create trader",
    { tag: ["@all-regression", "@webform-API-regression"] },
    async ({ api }) => {
      const data = buildTraderData();
      const response = await api.b2x.createTrader(data);

      // Surface the real server error (data is null whenever errors exist).
      expect(
        response.errors,
        `createTrader returned errors: ${JSON.stringify(response.errors)}`,
      ).toBeUndefined();

      const trader = response.data?.createTrader;
      const traderId = trader?.id;
      expect(traderId, "No trader id returned from createTrader").toBeTruthy();

      // Persist the trader id so the upcoming B2X endpoints can reuse it.
      const filePath = saveApiResponse("createTrader", response);
      console.log(`Saved create trader response to ${filePath}`);
      console.log(`Trader id: ${traderId}`);
    },
  );

  test(
    "create trader with Saudi phone and coordinates",
    { tag: ["@all-regression", "@webform-API-regression"] },
    async ({ api }) => {
      const { collectableId } = await getFirstCollectable(api, CountryCode.SA);
      const data = buildSaudiTraderData({ collectables: [collectableId] });
      const response = await api.b2x.createTrader(data);

      expect(
        response.errors,
        `createTrader (Saudi) returned errors: ${JSON.stringify(response.errors)}`,
      ).toBeUndefined();

      const trader = response.data?.createTrader;
      expect(trader?.id, "No Saudi trader id returned from createTrader").toBeTruthy();
      expect(trader?.phone?.replace(/^0/, "")).toBe(data.phone.replace(/^0/, ""));
      expect(trader?.country_code).toBe("+966");

      const filePath = saveApiResponse("createTraderSaudi", response);
      console.log(`Saved Saudi create trader response to ${filePath}`);
    },
  );

  test(
    "create trader with Jordan phone and coordinates",
    { tag: ["@all-regression", "@webform-API-regression"] },
    async ({ api }) => {
      const { collectableId } = await getFirstCollectable(api, CountryCode.JO);
      const data = buildJordanTraderData({ collectables: [collectableId] });
      const response = await api.b2x.createTrader(data);

      expect(
        response.errors,
        `createTrader (Jordan) returned errors: ${JSON.stringify(response.errors)}`,
      ).toBeUndefined();

      const trader = response.data?.createTrader;
      expect(trader?.id, "No Jordan trader id returned from createTrader").toBeTruthy();
      expect(trader?.phone?.replace(/^0/, "")).toBe(data.phone.replace(/^0/, ""));
      expect(trader?.country_code).toBe("+962");

      const filePath = saveApiResponse("createTraderJordan", response);
      console.log(`Saved Jordan create trader response to ${filePath}`);
    },
  );

  test(
    "get collectables",
    { tag: ["@all-regression", "@webform-API-regression"] },
    async ({ api }) => {
      const response = await api.b2x.getCollectables();

      // Surface the real server error (data is null whenever errors exist).
      expect(
        response.errors,
        `getCollectables returned errors: ${JSON.stringify(response.errors)}`,
      ).toBeUndefined();

      const collectables = response.data?.getCollectables;
      expect(collectables?.length, "No collectables returned from getCollectables").toBeTruthy();

      const first = collectables![0];
      const collectableId = first.id;
      const measureId = first.measures?.[0]?.id;
      expect(collectableId, "First collectable has no id").toBeTruthy();
      expect(measureId, "First collectable has no measures").toBeTruthy();

      // Persist the first collectable id and measure id for further endpoints.
      const filePath = saveApiResponse("b2xGetCollectables", response);
      console.log(`Saved get collectables response to ${filePath}`);
      console.log(`Collectable id: ${collectableId}, Measure id: ${measureId}`);
    },
  );

  test(
    "create trader request webform",
    {
      tag: [
        "@all-regression",
        "@webform-API-regression",
        "@create-b2x-request",
        "@create-b2x-request-API",
      ],
    },
    async ({ api }) => {
      // Provision prerequisites so this test stays independent.
      const traderResponse = await api.b2x.createTrader(buildTraderData());
      expect(
        traderResponse.errors,
        `createTrader returned errors: ${JSON.stringify(traderResponse.errors)}`,
      ).toBeUndefined();
      const traderId = traderResponse.data?.createTrader?.id;
      expect(traderId, "No trader id returned from createTrader").toBeTruthy();

      const collectablesResponse = await api.b2x.getCollectables();
      expect(
        collectablesResponse.errors,
        `getCollectables returned errors: ${JSON.stringify(collectablesResponse.errors)}`,
      ).toBeUndefined();
      const firstCollectable = collectablesResponse.data?.getCollectables?.[0];
      const collectableId = firstCollectable?.id;
      const measureId = firstCollectable?.measures?.[0]?.id;
      expect(collectableId, "No collectables returned from getCollectables").toBeTruthy();
      expect(measureId, "First collectable has no measures").toBeTruthy();

      const createdIds: string[] = [];
      const today = "2026-08-20 00:00:00";

      for (let i = 1; i <= 2; i++) {
        const data = buildTraderRequestData({
          trader_id: traderId!,
          collectable_id: collectableId!,
          measure_id: measureId!,
          count: 20000,
          collection_date: today,
        });

        const response = await api.b2x.createTraderRequest(data);

        expect(
          response.errors,
          `createTraderRequestV2 #${i} returned errors: ${JSON.stringify(response.errors)}`,
        ).toBeUndefined();

        const traderRequest = response.data?.createTraderRequestV2;
        expect(traderRequest?.id, `No trader request id returned for #${i}`).toBeTruthy();

        createdIds.push(traderRequest!.id);
        console.warn(
          `B2X request #${i}: id=${traderRequest!.id}, date=2026-08-20, count=20000 kg UCO`,
        );
      }

      const filePath = saveApiResponse("createTraderRequest", {
        traderId,
        requestIds: createdIds,
      });
      console.log(`Saved create trader request response to ${filePath}`);
    },
  );

  test(
    "create trader request webform with Saudi trader",
    { tag: ["@all-regression", "@webform-API-regression", "@create-b2x-request"] },
    async ({ api }) => {
      const { collectableId, measureId } = await getFirstCollectable(api, CountryCode.SA);
      const traderData = buildSaudiTraderData({ collectables: [collectableId] });
      const traderResponse = await api.b2x.createTrader(traderData);
      expect(
        traderResponse.errors,
        `createTrader (Saudi) returned errors: ${JSON.stringify(traderResponse.errors)}`,
      ).toBeUndefined();
      const traderId = traderResponse.data?.createTrader?.id;
      expect(traderId, "No Saudi trader id returned from createTrader").toBeTruthy();

      const data = buildTraderRequestData({
        trader_id: traderId!,
        collectable_id: collectableId!,
        measure_id: measureId!,
        count: 2,
      });
      const response = await api.b2x.createTraderRequest(data);
      expect(
        response.errors,
        `createTraderRequestV2 (Saudi) returned errors: ${JSON.stringify(response.errors)}`,
      ).toBeUndefined();
      expect(response.data?.createTraderRequestV2?.id).toBeTruthy();

      const filePath = saveApiResponse("createTraderRequestSaudi", response);
      console.log(`Saved Saudi create trader request response to ${filePath}`);
    },
  );

  test(
    "create trader request webform with Jordan trader",
    { tag: ["@all-regression", "@webform-API-regression", "@create-b2x-request"] },
    async ({ api }) => {
      const { collectableId, measureId } = await getFirstCollectable(api, CountryCode.JO);
      const traderData = buildJordanTraderData({ collectables: [collectableId] });
      const traderResponse = await api.b2x.createTrader(traderData);
      expect(
        traderResponse.errors,
        `createTrader (Jordan) returned errors: ${JSON.stringify(traderResponse.errors)}`,
      ).toBeUndefined();
      const traderId = traderResponse.data?.createTrader?.id;
      expect(traderId, "No Jordan trader id returned from createTrader").toBeTruthy();

      const data = buildTraderRequestData({
        trader_id: traderId!,
        collectable_id: collectableId!,
        measure_id: measureId!,
        count: 2,
      });
      const response = await api.b2x.createTraderRequest(data);
      expect(
        response.errors,
        `createTraderRequestV2 (Jordan) returned errors: ${JSON.stringify(response.errors)}`,
      ).toBeUndefined();
      expect(response.data?.createTraderRequestV2?.id).toBeTruthy();

      const filePath = saveApiResponse("createTraderRequestJordan", response);
      console.log(`Saved Jordan create trader request response to ${filePath}`);
    },
  );
});
