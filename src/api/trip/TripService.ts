import type { GraphQLClient } from "../GraphQLClient";
import { CREATE_TRIP, START_TRIP } from "./graphql/mutations";
import { GET_TRIP } from "./graphql/queries";

export type TripRequest = {
  id: string;
  status: string;
  type: string | null;
  collection_date?: string | null;
};

export type Trip = {
  id: string;
  status: string | null;
  collection_date: string | null;
  type?: string | null;
  total_requests?: number | null;
  collector: {
    id: string;
    name?: string | null;
  } | null;
  warehouse?: {
    id: string;
    name: string | null;
  } | null;
  warehouseType?: {
    id: string;
    name: string | null;
  } | null;
  requests: TripRequest[] | null;
};

export type CreateTripData = {
  warehouse_type_id: string | number;
  warehouse_id: string | number;
  collector_id?: string | number;
  collection_date: string;
  requests_ids: Array<string | number>;
};

export class TripService {
  constructor(private readonly client: GraphQLClient) {}

  createTrip(data: CreateTripData) {
    return this.client.execute<{ createTripTest: Trip }>(CREATE_TRIP, data);
  }

  getTrip(tripId: string | number) {
    return this.client.execute<{ warehouse_trip: Trip }>(GET_TRIP, { id: tripId });
  }

  startTrip(tripId: string | number) {
    return this.client.execute<{ startTrip: Trip }>(START_TRIP, { trip_id: tripId });
  }
}
