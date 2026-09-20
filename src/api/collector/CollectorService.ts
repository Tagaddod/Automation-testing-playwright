import type { GraphQLClient } from "../GraphQLClient";
import {
  END_COLLECTOR_TRIP,
  START_TRIP,
  UPDATE_COLLECTOR,
  UPDATE_REQUEST_CART,
  UPDATE_REQUEST_COMPENSATION,
  UPDATE_REQUEST_STATUS,
} from "./graphql/mutations";
import {
  GET_COLLECTOR_ACTIVE_TRIP,
  GET_REQUEST_AVAILABLE_COLLECTABLES,
  GET_REQUEST_COMPENSATIONS,
} from "./graphql/queries";
import {
  buildRequestCollectablesPayload,
  COLLECTOR_REQUEST_FULFILLED_STATUS,
  graphqlFailureMessage,
  isHomeRequest,
  selectedGiftsFromCompensation,
  tripIdFromCreateTripsResponse,
} from "./testData";

export type TripCollectable = {
  id: string;
  name: string | null;
  flow: string | null;
  is_primary: boolean | null;
};

export type TripMeasure = {
  id: string;
  name: string | null;
  unit: string | null;
  image: string | null;
  quantity_step: number | null;
};

export type TripRequestCollectable = {
  id: string;
  collectable: TripCollectable;
  measure: TripMeasure;
  quantity: number | null;
  cash: number | null;
  points: number | null;
};

export type ActiveTripRequest = {
  id: string;
  type: string | null;
  status: string | null;
  requestCollectables: TripRequestCollectable[] | null;
};

export type CollectorActiveTrip = {
  id: string;
  status?: string | null;
  distance?: number | null;
  duration?: number | null;
  type?: string | null;
  collection_date?: string | null;
  total_uco?: number | null;
  created_at?: string | null;
  total_requests?: number | null;
  funnels?: unknown;
  containers?: unknown;
  scale_amount_difference?: number | null;
  total_received_oil_amount?: number | null;
  total_collected_cash?: number | null;
  total_cash?: number | null;
  channel_types?: unknown;
  quality_status?: string | null;
  requests: ActiveTripRequest[] | null;
};

export type AvailableCollectable = {
  id: string;
  name: string | null;
  name_ar: string | null;
  name_en: string | null;
  name_de: string | null;
  image: string | null;
  seller_extra_data: unknown;
  flow: string | null;
  is_primary: boolean | null;
  total_count: number | null;
  remaining_count: number | null;
  consumed_count: number | null;
};

export type RequestCompensation = {
  request_points: number | null;
  total_points: number | null;
  cash: number | null;
  available_gifts: Array<{
    campaign: { id: string; points: number | null } | null;
  }> | null;
};

export type RequestCollectableInput = {
  collectable_id: string | number;
  measure_id: string | number;
  quantity: number;
  ffa?: number;
  mai?: number;
  empty_beaker_weight?: number;
  beaker_with_sample_before_boiling_weight?: number;
  beaker_with_sample_after_boiling_weight?: number;
  sediments_weight?: number;
  koh?: number;
  deduction_percentage?: number;
  deducted_quantity?: number;
};

export type SelectedGiftInput = {
  campaign_id: string | number;
};

export type ProcessedCollectorRequest = {
  requestId: string;
  requestType: string | null;
  collectablesUpdated: boolean;
  compensation: RequestCompensation | null;
  giftsUpdated: boolean;
  fulfilledId: string | null;
  status: string | null;
};

export type UpdateCollectorResult = {
  id: string;
  name: string | null;
  identification_card: string | null;
  phone: string | null;
  country_code: string | null;
  locale: string | null;
  active: boolean | null;
  access_multiple_requests: boolean | null;
  collector_node_id: string | null;
  can_manage_trips: boolean | null;
};

export type EndedCollectorTrip = {
  id: string;
  status: string | null;
  distance: number | null;
  duration: number | null;
  type: string | null;
  collection_date: string | null;
  total_uco: number | null;
  created_at: string | null;
  total_requests: number | null;
  funnels: unknown;
  containers: unknown;
  scale_amount_difference: number | null;
  total_received_oil_amount: number | null;
  total_collected_cash: number | null;
  total_cash: number | null;
  channel_types: unknown;
  quality_status: string | null;
};

function firstErrorMessage(errors?: Array<{ message: string }>): string {
  return errors?.[0]?.message ?? "(empty — no GraphQL error message was returned)";
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function requestIdsOnTrip(trip: CollectorActiveTrip | null | undefined): string[] {
  return (trip?.requests ?? []).map((request) => String(request.id));
}

/** Collector GAP GraphQL operations (collector-app phone JWT). */
export class CollectorService {
  constructor(private readonly client: GraphQLClient) {}

  getCollectorActiveTrip() {
    return this.client.execute<{
      getCollectorActiveTrip: CollectorActiveTrip | null;
    }>(GET_COLLECTOR_ACTIVE_TRIP);
  }

  startTrip(tripId: string) {
    return this.client.execute<{
      startTrip: { id: string; status: string | null } | null;
    }>(START_TRIP, { tripId });
  }

  getRequestAvailableCollectables(requestId: string) {
    return this.client.execute<{
      getRequestAvailableCollectables: AvailableCollectable[] | null;
    }>(GET_REQUEST_AVAILABLE_COLLECTABLES, { requestId });
  }

  updateRequestCollectables(requestId: string, requestCollectables: RequestCollectableInput[]) {
    return this.client.execute<{
      updateRequestCart: unknown;
    }>(UPDATE_REQUEST_CART, { requestId, requestCollectables });
  }

  getRequestCompensations(requestId: string) {
    return this.client.execute<{
      getRequestCompensations: RequestCompensation | null;
    }>(GET_REQUEST_COMPENSATIONS, { requestId });
  }

  updateRequestCompensation(requestId: string, selectedGifts: SelectedGiftInput[]) {
    return this.client.execute<{
      updateRequestCompensation: unknown;
    }>(UPDATE_REQUEST_COMPENSATION, { requestId, selectedGifts });
  }

  updateRequestStatus(requestId: string, status: string) {
    return this.client.execute<{
      updateRequestStatus: { id: string; status: string | null } | null;
    }>(UPDATE_REQUEST_STATUS, { requestId, status });
  }

  /** Fulfill a saved request on collector 916. Request ID must be dynamic. */
  updateCollector(requestId: string) {
    return this.client.execute<{
      updateCollector: UpdateCollectorResult | null;
    }>(UPDATE_COLLECTOR, { requestId });
  }

  /** End the collector trip using the saved Trip ID. Coordinates are 30.0444, 31.2357. */
  endCollectorTrip(tripId: string) {
    return this.client.execute<{
      endCollectorTrip: EndedCollectorTrip | null;
    }>(END_COLLECTOR_TRIP, { tripId });
  }

  /**
   * Trip ID from create-trips body. If REST omits it, use the collector active trip
   * created for this collector so trip.spec can save a dynamic ID.
   */
  async resolveCreatedTripId(createTripsBody: unknown): Promise<string> {
    const fromCreateResponse = tripIdFromCreateTripsResponse(createTripsBody);
    if (fromCreateResponse) {
      return fromCreateResponse;
    }

    const activeResponse = await this.getCollectorActiveTrip();
    if (activeResponse.errors) {
      throw new Error(
        graphqlFailureMessage("getCollectorActiveTrip", firstErrorMessage(activeResponse.errors)),
      );
    }

    const activeTripId = activeResponse.data?.getCollectorActiveTrip?.id;
    if (!activeTripId) {
      throw new Error("Create Trip did not return a trip ID.");
    }
    return String(activeTripId);
  }

  /**
   * Fulfill requests on a blocking active trip and end it so a newly created trip
   * for `expectedRequestId` can surface on getCollectorActiveTrip.
   */
  async clearBlockingActiveTrip(activeTrip: CollectorActiveTrip): Promise<void> {
    const tripId = String(activeTrip.id);
    for (const request of activeTrip.requests ?? []) {
      const collectables = request.requestCollectables ?? [];
      if (collectables.length > 0) {
        await this.processRequest(request);
        continue;
      }

      const requestId = String(request.id);
      const updateResponse = await this.updateCollector(requestId);
      if (updateResponse.errors?.length) {
        throw new Error(
          graphqlFailureMessage(
            "updateCollector (clear blocking active trip)",
            firstErrorMessage(updateResponse.errors),
          ),
        );
      }
    }

    const endResponse = await this.endCollectorTrip(tripId);
    if (endResponse.errors?.length) {
      throw new Error(
        graphqlFailureMessage(
          "endCollectorTrip (clear blocking active trip)",
          firstErrorMessage(endResponse.errors),
        ),
      );
    }
  }

  /** End the current active trip when it would block assigning a new create-trips request. */
  async clearActiveTripIfPresent(): Promise<void> {
    const tripResponse = await this.getCollectorActiveTrip();
    if (tripResponse.errors?.length) {
      throw new Error(
        graphqlFailureMessage("getCollectorActiveTrip", firstErrorMessage(tripResponse.errors)),
      );
    }

    const activeTrip = tripResponse.data?.getCollectorActiveTrip;
    if (!activeTrip?.id) {
      return;
    }

    await this.clearBlockingActiveTrip(activeTrip);
  }

  /**
   * Resolve the trip ID for a request created in this run. REST create-trips often
   * omits the trip id; poll getCollectorActiveTrip until the active trip includes
   * `expectedRequestId`. Clears one stale active trip when it blocks the new request.
   */
  async resolveActiveTripIdForRequest(
    expectedRequestId: string,
    createTripsBody?: unknown,
    options?: { timeoutMs?: number; intervalMs?: number },
  ): Promise<string> {
    const fromCreateResponse = createTripsBody
      ? tripIdFromCreateTripsResponse(createTripsBody)
      : undefined;
    if (fromCreateResponse && fromCreateResponse !== String(expectedRequestId)) {
      return fromCreateResponse;
    }

    const timeoutMs = options?.timeoutMs ?? 120_000;
    const intervalMs = options?.intervalMs ?? 3_000;
    const deadline = Date.now() + timeoutMs;
    let lastActiveTrip: CollectorActiveTrip | null | undefined;

    while (Date.now() < deadline) {
      const tripResponse = await this.getCollectorActiveTrip();
      if (tripResponse.errors?.length) {
        throw new Error(
          graphqlFailureMessage("getCollectorActiveTrip", firstErrorMessage(tripResponse.errors)),
        );
      }

      lastActiveTrip = tripResponse.data?.getCollectorActiveTrip;
      if (lastActiveTrip?.id) {
        const idsOnTrip = requestIdsOnTrip(lastActiveTrip);
        if (idsOnTrip.includes(String(expectedRequestId))) {
          return String(lastActiveTrip.id);
        }

        await this.clearBlockingActiveTrip(lastActiveTrip);
        continue;
      }

      await delay(intervalMs);
    }

    const blockingTripId = lastActiveTrip?.id ? String(lastActiveTrip.id) : "(none)";
    const blockingRequestIds = requestIdsOnTrip(lastActiveTrip).join(", ") || "(none)";
    throw new Error(
      `Get Trip ID failed: getCollectorActiveTrip did not return a trip containing Request ID ${expectedRequestId} within ${timeoutMs}ms. Last active trip id: ${blockingTripId}. Request ids on that trip: ${blockingRequestIds}.`,
    );
  }

  /**
   * One request: available collectables → update ALL collectables → compensation
   * → HOME gifts when present → status FULFILLED.
   */
  async processRequest(request: ActiveTripRequest): Promise<ProcessedCollectorRequest> {
    const requestId = String(request.id);
    const existingCollectables = request.requestCollectables ?? [];

    const availableResponse = await this.getRequestAvailableCollectables(requestId);
    if (availableResponse.errors) {
      throw new Error(
        graphqlFailureMessage(
          "getRequestAvailableCollectables",
          firstErrorMessage(availableResponse.errors),
        ),
      );
    }

    const availableCollectables = availableResponse.data?.getRequestAvailableCollectables;
    if (!Array.isArray(availableCollectables)) {
      throw new Error(
        graphqlFailureMessage(
          "getRequestAvailableCollectables",
          "Expected an array of available collectables.",
        ),
      );
    }

    const payload = buildRequestCollectablesPayload(existingCollectables, availableCollectables);
    if (payload.length !== existingCollectables.length) {
      throw new Error(
        graphqlFailureMessage(
          "updateRequestCollectables",
          "All request collectables must be included in one update.",
        ),
      );
    }

    const updateCollectablesResponse = await this.updateRequestCollectables(requestId, payload);
    if (updateCollectablesResponse.errors) {
      throw new Error(
        graphqlFailureMessage(
          "updateRequestCollectables",
          firstErrorMessage(updateCollectablesResponse.errors),
        ),
      );
    }

    const compensationResponse = await this.getRequestCompensations(requestId);
    if (compensationResponse.errors) {
      throw new Error(
        graphqlFailureMessage(
          "getRequestCompensations",
          firstErrorMessage(compensationResponse.errors),
        ),
      );
    }

    const compensation = compensationResponse.data?.getRequestCompensations ?? null;
    let giftsUpdated = false;

    if (isHomeRequest(request.type)) {
      const selectedGifts = selectedGiftsFromCompensation(compensation?.available_gifts);
      if (selectedGifts.length > 0) {
        const giftResponse = await this.updateRequestCompensation(requestId, selectedGifts);
        if (giftResponse.errors) {
          throw new Error(
            graphqlFailureMessage(
              "updateRequestCompensation",
              firstErrorMessage(giftResponse.errors),
            ),
          );
        }
        giftsUpdated = true;
      }
    }

    const statusResponse = await this.updateRequestStatus(
      requestId,
      COLLECTOR_REQUEST_FULFILLED_STATUS,
    );
    if (statusResponse.errors) {
      throw new Error(
        graphqlFailureMessage("updateRequestStatus", firstErrorMessage(statusResponse.errors)),
      );
    }

    const fulfilled = statusResponse.data?.updateRequestStatus;
    return {
      requestId,
      requestType: request.type,
      collectablesUpdated: true,
      compensation,
      giftsUpdated,
      fulfilledId: fulfilled?.id ?? null,
      status: fulfilled?.status ?? null,
    };
  }
}
