import { requireSavedBusinessRequestId, requireSavedRequestId } from "../saveApiResponse";
import type { CreateTripData, CreateTripRequestItem, CreateTripsPayload } from "./TripService";

/** Known contracted branch used by create-trips B2B flow. */
export const TRIPS_BUSINESS_BRANCH_ID = "387923998";

/** Contract defaults from the create-trips payload (not invented). */
export const DEFAULT_WAREHOUSE_ID = 1;
export const DEFAULT_WAREHOUSE_TYPE_ID = 1;
export const DEFAULT_COLLECTOR_ID = 916;

function nowDateTime(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
}

function envNumber(name: string): number | undefined {
  const raw = process.env[name]?.trim();
  if (!raw) {
    return undefined;
  }
  const value = Number(raw);
  if (!Number.isFinite(value)) {
    throw new Error(`${name} must be a number.`);
  }
  return value;
}

function requireNumericId(raw: string, label: string): number {
  const value = Number(raw);
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${label} must be a numeric id. Received: ${raw}`);
  }
  return value;
}

/** warehouse_id: env override, otherwise the known create-trips warehouse. */
export function resolveWarehouseId(override?: number): number {
  return override ?? envNumber("TRIPS_WAREHOUSE_ID") ?? DEFAULT_WAREHOUSE_ID;
}

/** warehouse_type_id: env override, otherwise the known create-trips warehouse type. */
export function resolveWarehouseTypeId(override?: number): number {
  return override ?? envNumber("TRIPS_WAREHOUSE_TYPE_ID") ?? DEFAULT_WAREHOUSE_TYPE_ID;
}

/** collector_id: env override, otherwise the known create-trips collector. */
export function resolveCollectorId(override?: number): number {
  return override ?? envNumber("TRIPS_COLLECTOR_ID") ?? DEFAULT_COLLECTOR_ID;
}

/** Business Request ID saved by createBusinessRequestSuperApp. */
export function resolveBusinessRequestId(): number {
  return requireNumericId(requireSavedBusinessRequestId(), "Business Request ID");
}

/** Trader Request ID saved by createTraderRequestSalesAgent. */
export function resolveTraderRequestId(): number {
  return requireNumericId(requireSavedRequestId(), "Trader Request ID");
}

/**
 * Trip requests: createBusinessRequest first, then createTraderRequest.
 * Both IDs must already exist from those GraphQL tests.
 */
export function resolveTripRequestItems(
  overrides?: CreateTripRequestItem[],
): CreateTripRequestItem[] {
  if (overrides?.length) {
    return overrides;
  }

  return [
    { id: resolveBusinessRequestId(), order: 1 },
    { id: resolveTraderRequestId(), order: 2 },
  ];
}

/** Valid create-trips trip defaults (override one field per scenario). */
export function validTripVariables(overrides: Partial<CreateTripData> = {}): CreateTripData {
  return {
    warehouse_id: resolveWarehouseId(),
    warehouse_type_id: resolveWarehouseTypeId(),
    collection_date: nowDateTime(),
    duration: 120.5,
    latitude: 30.0444,
    longitude: 31.2357,
    q_km: 15,
    quantity: 10,
    num_points: 1,
    collector_id: DEFAULT_COLLECTOR_ID,
    ...overrides,
  };
}

/** Valid create-trips payload. collection_date is today's date and current run time unless overridden. */
export function validCreateTripsPayload(
  overrides: Partial<CreateTripData> = {},
): CreateTripsPayload {
  return {
    trips: [validTripVariables(overrides)],
  };
}

/** Two valid trips in one create-trips request, each with its own request id. */
export function validMultipleCreateTripsPayload(
  firstRequestId: number,
  secondRequestId: number,
): CreateTripsPayload {
  return {
    trips: [
      validTripVariables({
        requests: [{ id: firstRequestId, order: 1 }],
        num_points: 1,
      }),
      validTripVariables({
        latitude: 30.05,
        longitude: 31.24,
        requests: [{ id: secondRequestId, order: 1 }],
        num_points: 1,
      }),
    ],
  };
}

/** Valid create-trips payload that attaches a GraphQL request id. */
export function validCreateTripsWithRequestId(requestId: number): CreateTripsPayload {
  return validCreateTripsPayload({
    requests: [{ id: requestId, order: 1 }],
    num_points: 1,
    collector_id: DEFAULT_COLLECTOR_ID,
  });
}

/** Valid payload using a Business Request ID or Trader Request ID already saved by GraphQL tests. */
export function validCreateTripsFromSavedRequest(): CreateTripsPayload {
  let requestId: number;
  try {
    requestId = resolveBusinessRequestId();
  } catch {
    requestId = resolveTraderRequestId();
  }
  return validCreateTripsWithRequestId(requestId);
}
