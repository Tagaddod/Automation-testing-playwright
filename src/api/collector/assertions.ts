import { expect } from "@playwright/test";

import type {
  CollectorActiveTrip,
  EndedCollectorTrip,
  ProcessedCollectorRequest,
  UpdateCollectorResult,
} from "./CollectorService";
import {
  COLLECTOR_END_TRIP_LATITUDE,
  COLLECTOR_END_TRIP_LONGITUDE,
  COLLECTOR_REQUEST_FULFILLED_STATUS,
  COLLECTOR_TRIP_STARTED_STATUS,
  graphqlFailureMessage,
  UPDATE_COLLECTOR_ID,
} from "./testData";

function firstError(errors?: Array<{ message: string }>): string {
  return errors?.[0]?.message ?? "(empty — no GraphQL error message was returned)";
}

export function expectNoGraphqlErrors(
  operation: string,
  errors?: Array<{ message: string }>,
): void {
  expect(errors, graphqlFailureMessage(operation, firstError(errors))).toBeUndefined();
}

export function expectActiveTrip(
  trip: CollectorActiveTrip | null | undefined,
): CollectorActiveTrip {
  expect(trip, "Expect active collector trip to exist").toBeTruthy();
  expect(trip?.id, "Expect Active collector trip ID to exist").toBeTruthy();

  const requests = trip?.requests ?? [];
  expect(requests.length, "Expect active trip requests to exist").toBeGreaterThan(0);

  for (const request of requests) {
    expect(request.id, "Expect request ID to exist").toBeTruthy();
    const collectables = request.requestCollectables ?? [];
    expect(
      collectables.length,
      `Expect request ${request.id} to include collectables`,
    ).toBeGreaterThan(0);

    for (const item of collectables) {
      expect(item.collectable?.id, "Expect request collectable ID to exist").toBeTruthy();
      expect(item.measure?.id, "Expect request collectable measure ID to exist").toBeTruthy();
      expect(
        item.quantity === null || item.quantity === undefined || item.quantity >= 0,
        "Expect request collectable quantity to be valid",
      ).toBeTruthy();
    }
  }

  return trip!;
}

export function expectTripStarted(
  tripId: string,
  started: { id: string; status: string | null } | null | undefined,
): void {
  expect(started, "Expect startTrip to return a trip").toBeDefined();
  expect(started?.id, "Expect Trip ID to match saved Trip ID").toBe(String(tripId));
  expect(started?.status, "Expect trip status to be STARTED").toBe(COLLECTOR_TRIP_STARTED_STATUS);
}

export function expectActiveTripMatchesSaved(
  savedTripId: string,
  activeTrip: CollectorActiveTrip,
): void {
  expect(String(activeTrip.id), "Expect Active collector trip ID to match saved trip ID").toBe(
    String(savedTripId),
  );
}

function isValidCompensationAmount(value: number | null | undefined): boolean {
  return (
    value === null || value === undefined || (typeof value === "number" && Number.isFinite(value))
  );
}

export function expectRequestFulfilled(result: ProcessedCollectorRequest): void {
  expect(result.collectablesUpdated, "Expect request collectables to be updated").toBeTruthy();
  expect(result.compensation, "Expect request compensation to be returned").toBeTruthy();
  expect(
    isValidCompensationAmount(result.compensation?.cash),
    "Expect compensation cash to be valid according to the API response",
  ).toBeTruthy();
  expect(
    isValidCompensationAmount(result.compensation?.request_points),
    "Expect compensation request points to be valid according to the API response",
  ).toBeTruthy();
  expect(
    isValidCompensationAmount(result.compensation?.total_points),
    "Expect compensation total points to be valid according to the API response",
  ).toBeTruthy();
  expect(
    Array.isArray(result.compensation?.available_gifts ?? []),
    "Expect available gifts to be an array",
  ).toBeTruthy();
  expect(result.fulfilledId, "Expect request to be moved to FULFILLED").toBe(result.requestId);
  expect(result.status, "Expect Request status to be FULFILLED").toBe(
    COLLECTOR_REQUEST_FULFILLED_STATUS,
  );
}

export function expectCollectorUpdated(collector: UpdateCollectorResult | null | undefined): void {
  expect(collector, "Expect Request to be fulfilled").toBeTruthy();
  expect(String(collector?.id), "Expect updateCollector to use collector ID 916").toBe(
    String(UPDATE_COLLECTOR_ID),
  );
}

export function expectFulfilledRequestIdMatchesSaved(
  savedRequestId: string,
  requestIdUsed: string,
): void {
  expect(String(requestIdUsed), "Expect Fulfilled request ID to match saved Request ID").toBe(
    String(savedRequestId),
  );
}

export function expectTripEnded(
  savedTripId: string,
  ended: EndedCollectorTrip | null | undefined,
): void {
  expect(ended, "Expect End Collector Trip to succeed").toBeTruthy();
  expect(ended?.id, "Expect Ended Trip ID to match saved Trip ID").toBe(String(savedTripId));
  expect(ended?.status, "Expect Trip status to be returned").toBeTruthy();
}

export function expectEndTripCoordinates(latitude: string, longitude: string): void {
  expect(latitude, "Expect End trip latitude to be 30.0444").toBe(COLLECTOR_END_TRIP_LATITUDE);
  expect(longitude, "Expect End trip longitude to be 31.2357").toBe(COLLECTOR_END_TRIP_LONGITUDE);
}
