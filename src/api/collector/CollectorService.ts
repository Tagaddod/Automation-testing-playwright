import type { GraphQLClient } from "../GraphQLClient";
import type { Trip, TripRequest } from "../trip/TripService";
import {
  END_COLLECTOR_TRIP,
  UPDATE_REQUEST_CART,
  UPDATE_REQUEST_COMPENSATION,
  UPDATE_REQUEST_STATUS,
  VALIDATE_COLLECTION_LOCATION,
} from "./graphql/mutations";
import { GET_COLLECTOR_ACTIVE_TRIP, GET_COLLECTOR_PROFILE } from "./graphql/queries";

export type Collector = {
  id: string;
  name: string | null;
  phone: string | null;
  country_code: string | null;
  active: boolean | null;
};

export type RequestCollectableInput = {
  collectable_id: string | number;
  measure_id: string | number;
  quantity?: number;
  ffa?: number;
  mai?: number;
  empty_beaker_weight?: number;
  beaker_with_sample_before_boiling_weight?: number;
  beaker_with_sample_after_boiling_weight?: number;
  sediments_weight?: number;
  koh?: number;
  deduction_percentage?: number;
  deducted_quantity?: number;
  expected_deduction?: number;
};

export type FreshProductInput = {
  fresh_product_id: string | number;
  quantity: number;
};

export type SelectedGiftInput = {
  id: string | number;
  count: number;
};

export type CollectorTripRequest = TripRequest & {
  address?: {
    id: string;
    latitude: string | null;
    longitude: string | null;
  } | null;
  requestCollectables?: Array<{
    collectable: { id: string } | null;
    measure: { id: string } | null;
    quantity: number | null;
  }> | null;
};

export type CollectorActiveTrip = Omit<Trip, "requests"> & {
  requests: CollectorTripRequest[] | null;
};

export type UpdateRequestStatus = "FULFILLED" | "SCHEDULED" | "DISPATCHED" | "INCOMPLETED_INFO";

export class CollectorService {
  constructor(private readonly client: GraphQLClient) {}

  getProfile() {
    return this.client.execute<{ myCollector: Collector }>(GET_COLLECTOR_PROFILE);
  }

  getActiveTrip() {
    return this.client.execute<{ getCollectorActiveTrip: CollectorActiveTrip | null }>(
      GET_COLLECTOR_ACTIVE_TRIP,
    );
  }

  validateCollectionLocation(requestId: string | number, latitude: string, longitude: string) {
    return this.client.execute<{ validateCollectionLocation: boolean }>(
      VALIDATE_COLLECTION_LOCATION,
      {
        request_id: requestId,
        latitude,
        longitude,
      },
    );
  }

  updateRequestCart(
    requestId: string | number,
    requestCollectables: RequestCollectableInput[] = [],
    freshProducts: FreshProductInput[] = [],
  ) {
    return this.client.execute<{ updateRequestCart: boolean }>(UPDATE_REQUEST_CART, {
      request_id: requestId,
      request_collectables: requestCollectables,
      fresh_products: freshProducts,
    });
  }

  updateRequestCompensation(requestId: string | number, selectedGifts: SelectedGiftInput[]) {
    return this.client.execute<{ updateRequestCompensation: boolean }>(
      UPDATE_REQUEST_COMPENSATION,
      {
        request_id: requestId,
        selectedGifts,
      },
    );
  }

  updateRequestStatus(requestId: string | number, status: UpdateRequestStatus) {
    return this.client.execute<{
      updateRequestStatus: {
        id: string;
        status: string;
        type: string | null;
        collection_date: string | null;
        net_uco_quantity: number | null;
      };
    }>(UPDATE_REQUEST_STATUS, { request_id: requestId, status });
  }

  fulfillRequest(requestId: string | number) {
    return this.updateRequestStatus(requestId, "FULFILLED");
  }

  endTrip(tripId: string | number, latitude: string, longitude: string) {
    return this.client.execute<{ endCollectorTrip: Trip }>(END_COLLECTOR_TRIP, {
      trip_id: tripId,
      latitude,
      longitude,
    });
  }
}
