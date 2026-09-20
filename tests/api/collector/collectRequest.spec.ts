import { ApiManager } from "../../../src/api/ApiManager";
import {
  expectCollectorUpdated,
  expectEndTripCoordinates,
  expectFulfilledRequestIdMatchesSaved,
  expectNoGraphqlErrors,
  expectTripEnded,
} from "../../../src/api/collector/assertions";
import {
  COLLECTOR_END_TRIP_LATITUDE,
  COLLECTOR_END_TRIP_LONGITUDE,
  COLLECTOR_REQUEST_FULFILLED_STATUS,
  UPDATE_COLLECTOR_ID,
  validCollectorGapCreateTripsPayload,
} from "../../../src/api/collector/testData";
import { GraphQLClient } from "../../../src/api/GraphQLClient";
import {
  nowCollectionDateTime,
  validTraderRequestVariables,
  validTraderVariables,
} from "../../../src/api/sales/testData";
import { saveApiResponse } from "../../../src/api/saveApiResponse";
import { DEFAULT_COLLECTOR_ID } from "../../../src/api/trips/testData";
import { hasSiblingServerApiKey } from "../../../src/config/env";
import { expect, test } from "../../../src/fixtures/apiFixture";
import { getAuthToken } from "../../../src/utils/authApi";

test.describe(
  "Collector GAP Collect Request",
  { tag: ["@api", "@collector", "@gap", "@valid", "@b2x"] },
  () => {
    test.describe.configure({ mode: "serial", timeout: 300_000 });

    test(
      "Create trader request, trip, fulfill request, and end collector trip - Valid",
      { tag: ["@collector collect request"] },
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

          return String(id);
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

          const id = String(createdRequest!.id);
          saveApiResponse("requestId", {
            requestId: id,
            traderId,
          });

          return { requestId: id, collectionDate: collectionDateValue };
        });

        expect(requestId, "Create Trader Request failed: requestId was not returned.").toBeTruthy();

        const collectorToken = await test.step("Login Collector", async () => {
          const token = await getAuthToken("collector-app");
          expect(
            token,
            "Login Collector failed: collector authentication was not returned.",
          ).toBeTruthy();
          return token;
        });

        expect(
          collectorToken,
          "Login Collector failed: collectorToken was not returned.",
        ).toBeTruthy();
        const client = await GraphQLClient.create(collectorToken);
        const collectorAppApi = new ApiManager(client);

        try {
          await test.step("Prepare collector (clear blocking active trip)", async () => {
            await collectorAppApi.collector.clearActiveTripIfPresent();
          });

          const createTripsBody = await test.step("Create Trip using Request ID", async () => {
            const numericRequestId = Number(requestId);
            expect(
              numericRequestId,
              "Create Trip failed: requestId must be numeric.",
            ).toBeGreaterThan(0);

            const tripVariables = validCollectorGapCreateTripsPayload(
              numericRequestId,
              collectionDate,
            );
            expect(
              tripVariables.trips[0]?.requests?.[0]?.id,
              "Create Trip failed: payload must use the Trader Request ID from this run.",
            ).toBe(numericRequestId);
            expect(
              tripVariables.trips[0]?.collector_id,
              "Create Trip failed: collector_id must be 916.",
            ).toBe(DEFAULT_COLLECTOR_ID);

            const tripResponse = await tripsApi.createTrips(tripVariables);

            expect(
              tripResponse.ok,
              "Create Trip failed: trip creation should succeed.",
            ).toBeTruthy();
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
            });

            return tripResponse.body;
          });

          const tripId = await test.step("Get Trip ID", async () => {
            const id = await collectorAppApi.collector.resolveActiveTripIdForRequest(
              requestId,
              createTripsBody,
            );

            expect(id?.trim(), "Get Trip ID failed: tripId was not returned.").toBeTruthy();

            saveApiResponse("tripId", { tripId: id });
            expect(id, "Get Trip ID failed: tripId must not equal requestId.").not.toBe(requestId);

            return id;
          });

          expect(tripId, "Get Trip ID failed: tripId was not returned.").toBeTruthy();
          console.warn(
            [
              `Trader ID: ${traderId ?? "(missing)"}`,
              `Request ID: ${requestId ?? "(missing)"}`,
              `Trip ID: ${tripId ?? "(missing)"}`,
            ].join("\n"),
          );

          await test.step("UpdateCollector (FULFILLED)", async () => {
            console.warn(
              [
                `UpdateCollector Request ID: ${requestId}`,
                `Expected Request ID: ${requestId}`,
                `Status: ${COLLECTOR_REQUEST_FULFILLED_STATUS}`,
              ].join("\n"),
            );

            expect(UPDATE_COLLECTOR_ID, "UpdateCollector failed: collector id must be 916.").toBe(
              916,
            );

            const response = await collectorAppApi.collector.updateCollector(requestId);
            expectNoGraphqlErrors("updateCollector", response.errors);
            expectCollectorUpdated(response.data?.updateCollector);
            expectFulfilledRequestIdMatchesSaved(
              requestId,
              String(response.requestBody.variables.requestId),
            );

            saveApiResponse("collectorFulfilledRequests", {
              collectorId: UPDATE_COLLECTOR_ID,
              requestId,
              status: COLLECTOR_REQUEST_FULFILLED_STATUS,
              collector: response.data?.updateCollector,
            });
          });

          await test.step("EndCollectorTrip", async () => {
            console.warn(
              [`EndCollectorTrip Trip ID: ${tripId}`, `Expected Trip ID: ${tripId}`].join("\n"),
            );

            expectEndTripCoordinates(COLLECTOR_END_TRIP_LATITUDE, COLLECTOR_END_TRIP_LONGITUDE);

            const response = await collectorAppApi.collector.endCollectorTrip(tripId);
            expectNoGraphqlErrors("endCollectorTrip", response.errors);
            expect(
              String(response.requestBody.variables.tripId),
              "EndCollectorTrip failed: mutation must use the Trip ID from this run.",
            ).toBe(tripId);
            expectTripEnded(tripId, response.data?.endCollectorTrip);

            saveApiResponse("collectorEndTrip", {
              tripId,
              latitude: COLLECTOR_END_TRIP_LATITUDE,
              longitude: COLLECTOR_END_TRIP_LONGITUDE,
              trip: response.data?.endCollectorTrip,
            });
          });
        } finally {
          await collectorAppApi.dispose();
        }
      },
    );
  },
);
