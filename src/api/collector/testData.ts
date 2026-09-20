import { DEFAULT_COLLECTOR_ID, validCreateTripsPayload } from "../trips/testData";
import type { CreateTripsPayload } from "../trips/TripService";
import type {
  AvailableCollectable,
  RequestCollectableInput,
  SelectedGiftInput,
  TripRequestCollectable,
} from "./CollectorService";

export const COLLECTOR_TRIP_STARTED_STATUS = "STARTED";
export const COLLECTOR_REQUEST_FULFILLED_STATUS = "FULFILLED";
export const COLLECTOR_HOME_REQUEST_TYPE = "HOME";
export const COLLECTOR_OIL_FLOW = "oil";

/** Fixed collector id for updateCollector. Do not generate this dynamically. */
export const UPDATE_COLLECTOR_ID = 916;

export const COLLECTOR_TRACKING_DEVICE_ID = "QKQ1.191224.003";

export const COLLECTOR_END_TRIP_LATITUDE = "30.0444";
export const COLLECTOR_END_TRIP_LONGITUDE = "31.2357";

/** Simple valid oil-calculator values for GAP updateRequestCollectables. */
export const OIL_CALCULATOR_VALUES = {
  ffa: 1,
  mai: 1,
  empty_beaker_weight: 1,
  beaker_with_sample_before_boiling_weight: 1,
  beaker_with_sample_after_boiling_weight: 1,
  sediments_weight: 1,
  koh: 1,
  deduction_percentage: 1,
  deducted_quantity: 1,
} as const;

export function graphqlFailureMessage(operation: string, backendError: string): string {
  return `${operation} failed.

Backend Error:

${backendError}`;
}

export function isOilFlow(flow: string | null | undefined): boolean {
  return (flow ?? "").trim().toLowerCase() === COLLECTOR_OIL_FLOW;
}

export function isHomeRequest(type: string | null | undefined): boolean {
  return (type ?? "").trim().toUpperCase() === COLLECTOR_HOME_REQUEST_TYPE;
}

export function isFulfilledRequest(status: string | null | undefined): boolean {
  return (status ?? "").trim().toUpperCase() === COLLECTOR_REQUEST_FULFILLED_STATUS;
}

/** Quantity that respects measure.quantity_step (defaults to 1). */
export function quantityForStep(
  quantity: number | null | undefined,
  quantityStep: number | null | undefined,
): number {
  const step = quantityStep && quantityStep > 0 ? quantityStep : 1;
  const current = quantity && quantity > 0 ? quantity : step;
  return Math.max(step, Math.round(current / step) * step);
}

function flowFromAvailable(
  collectableId: string,
  available: AvailableCollectable[],
): string | null | undefined {
  return available.find((item) => String(item.id) === String(collectableId))?.flow;
}

/**
 * Build the full request_collectables list from the active-trip request.
 * Preserves existing collectables/measures; adds oil calculator fields only for oil flow.
 */
export function buildRequestCollectablesPayload(
  requestCollectables: TripRequestCollectable[],
  available: AvailableCollectable[] = [],
): RequestCollectableInput[] {
  return requestCollectables.map((item) => {
    const collectableId = String(item.collectable.id);
    const measureId = String(item.measure.id);
    const quantity = quantityForStep(item.quantity, item.measure?.quantity_step);
    const flow = item.collectable.flow ?? flowFromAvailable(collectableId, available);

    const payload: RequestCollectableInput = {
      collectable_id: collectableId,
      measure_id: measureId,
      quantity,
    };

    if (isOilFlow(flow)) {
      return { ...payload, ...OIL_CALCULATOR_VALUES };
    }

    return payload;
  });
}

/** First available campaign gift, or empty when none are returned. */
export function selectedGiftsFromCompensation(
  availableGifts: Array<{ campaign?: { id?: string | number } | null }> | null | undefined,
): SelectedGiftInput[] {
  const campaignId = availableGifts?.find((gift) => gift.campaign?.id)?.campaign?.id;
  if (campaignId === undefined || campaignId === null || campaignId === "") {
    return [];
  }
  return [{ campaign_id: campaignId }];
}

/** Create-trips payload for the collector GAP flow (assigned to collector 916). */
export function validCollectorGapCreateTripsPayload(
  requestId: number,
  collectionDate?: string,
): CreateTripsPayload {
  return validCreateTripsPayload({
    requests: [{ id: requestId, order: 1 }],
    num_points: 1,
    collector_id: DEFAULT_COLLECTOR_ID,
    ...(collectionDate ? { collection_date: collectionDate } : {}),
  });
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return undefined;
}

function firstNonEmptyId(...values: unknown[]): string | undefined {
  for (const value of values) {
    if (value === undefined || value === null || value === "") {
      continue;
    }
    const id = String(value).trim();
    if (id && id.toLowerCase() !== "success") {
      return id;
    }
  }
  return undefined;
}

/** Trip ID from create-trips REST body (dynamic — never hardcoded). */
export function tripIdFromCreateTripsResponse(body: unknown): string | undefined {
  const root = asRecord(body);
  if (!root) {
    return undefined;
  }

  const data = asRecord(root.data);
  const fromRoot = firstNonEmptyId(root.id, root.trip_id, root.tripId);
  if (fromRoot) {
    return fromRoot;
  }
  const fromData = firstNonEmptyId(data?.id, data?.trip_id, data?.tripId);
  if (fromData) {
    return fromData;
  }

  const trips = [root.trips, data?.trips, root.data].find((item) => Array.isArray(item)) as
    unknown[] | undefined;
  const firstTrip = asRecord(trips?.[0]);
  return firstNonEmptyId(firstTrip?.id, firstTrip?.trip_id, firstTrip?.tripId);
}
