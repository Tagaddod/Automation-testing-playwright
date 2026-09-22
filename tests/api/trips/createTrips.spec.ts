import {
  nowCollectionDateTime,
  validTraderRequestVariables,
  validTraderVariables,
} from "../../../src/api/sales/testData";
import { saveApiResponse } from "../../../src/api/saveApiResponse";
import {
  DEFAULT_COLLECTOR_ID,
  validCreateTripsWithRequestId,
} from "../../../src/api/trips/testData";
import { hasSiblingServerApiKey } from "../../../src/config/env";
import { expect, test } from "../../../src/fixtures/apiFixture";

test.describe("Create Trips", { tag: ["@api", "@trips", "@create-trips", "@valid"] }, () => {
  test.describe.configure({ mode: "serial", timeout: 180_000 });

  test(
    "Create Trader, Trader Request, and Trip - Valid",
    { tag: ["@valid", "@b2x"] },
    async ({ salesAppEgyptApi, tripsApi }) => {
      expect(hasSiblingServerApiKey(), "Set SIBLING_SERVER_API_KEY in .env / .env.staging").toBe(
        true,
      );

      const traderId = await test.step("Create Trader", async () => {
        const traderResponse =
          await salesAppEgyptApi.sales.createTraderSuperApp(validTraderVariables());

        expect(
          traderResponse.errors,
          "Create Trader failed: createTraderSuperApp returned GraphQL errors.",
        ).toBeUndefined();

        const id = traderResponse.data?.createTraderSuperApp?.id;
        expect(id, "Create Trader failed: a valid trader ID should be returned.").toBeTruthy();

        const traderIdValue = String(id);
        saveApiResponse("traderId", { traderId: traderIdValue });

        return traderIdValue;
      });

      const { requestId, collectionDate } = await test.step("Create Trader Request", async () => {
        const collectionDateValue = nowCollectionDateTime();
        const traderRequestVariables = validTraderRequestVariables(traderId, {
          collection_date: collectionDateValue,
        });
        expect(
          traderRequestVariables.trader_id,
          "Create Trader Request failed: trader_id must match the created Trader ID.",
        ).toBe(traderId);

        const traderRequestResponse =
          await salesAppEgyptApi.sales.createTraderRequestSalesAgent(traderRequestVariables);

        expect(
          traderRequestResponse.errors,
          "Create Trader Request failed: createTraderRequestSalesAgent returned GraphQL errors.",
        ).toBeUndefined();

        const createdRequest = traderRequestResponse.data?.createTraderRequestSalesAgent;
        expect(
          createdRequest,
          "Create Trader Request failed: the API should return a trader request.",
        ).toBeDefined();
        expect(
          createdRequest?.id,
          "Create Trader Request failed: requestId was not returned.",
        ).toBeTruthy();

        const requestIdValue = String(createdRequest!.id);
        saveApiResponse("requestId", {
          requestId: requestIdValue,
          traderId,
        });

        return { requestId: requestIdValue, collectionDate: collectionDateValue };
      });

      await test.step("Create Trip", async () => {
        const numericRequestId = Number(requestId);
        expect(numericRequestId, "Create Trip failed: requestId must be numeric.").toBeGreaterThan(
          0,
        );

        const tripVariables = validCreateTripsWithRequestId(numericRequestId);
        tripVariables.trips[0] = {
          ...tripVariables.trips[0],
          collection_date: collectionDate,
        };

        expect(
          tripVariables.trips[0]?.requests?.[0]?.id,
          "Create Trip failed: payload must use the Trader Request ID from this run.",
        ).toBe(numericRequestId);
        expect(
          tripVariables.trips[0]?.collector_id,
          "Create Trip failed: collector_id must be 916.",
        ).toBe(DEFAULT_COLLECTOR_ID);

        const tripResponse = await tripsApi.createTrips(tripVariables);

        expect(tripResponse.ok, "Create Trip failed: trip creation should succeed.").toBeTruthy();
        expect(
          tripResponse.status,
          "Create Trip failed: successful create-trips should return HTTP 2xx.",
        ).toBeGreaterThanOrEqual(200);
        expect(
          tripResponse.status,
          "Create Trip failed: successful create-trips should return HTTP 2xx.",
        ).toBeLessThan(300);

        saveApiResponse("createTripsTrader", {
          status: tripResponse.status,
          ok: tripResponse.ok,
          body: tripResponse.body,
          requestId,
          traderId,
        });
      });

      console.warn(
        [`Trader ID: ${traderId}`, `Request ID: ${requestId}`, `Create Trip: success`].join("\n"),
      );
    },
  );
});
