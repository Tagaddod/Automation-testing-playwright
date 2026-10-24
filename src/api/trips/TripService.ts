import { ENV } from "../../config/env";
import { URLs } from "../../config/urls";
import { RestClient, type RestResponse } from "../RestClient";

export type CreateTripRequestItem = {
  id: number;
  order: number;
};

export type CreateTripData = {
  warehouse_id?: number;
  warehouse_type_id?: number;
  collection_date?: string;
  duration?: number;
  latitude?: number;
  longitude?: number;
  q_km?: number;
  num_points?: number;
  distance?: number;
  quantity?: number;
  trip_path?: string;
  collector_id?: number;
  density_score?: number;
  utilization_score?: number;
  requests?: CreateTripRequestItem[];
};

export type CreateTripsPayload = {
  trips: CreateTripData[];
};

/** REST trip operations. Uses sibling-server-api-key only — never GraphQL JWT. */
export class TripService {
  private client: RestClient | null = null;

  private static requireApiKey(): string {
    const apiKey = ENV.SIBLING_SERVER_API_KEY;
    if (!apiKey) {
      throw new Error(
        "SIBLING_SERVER_API_KEY is required for create-trips. Set it in .env / .env.staging (do not hardcode the key).",
      );
    }
    return apiKey;
  }

  private static tripHeaders(): Record<string, string> {
    return {
      Accept: "application/json",
      "Content-Type": "application/json",
      "sibling-server-api-key": TripService.requireApiKey(),
    };
  }

  private async getClient(): Promise<RestClient> {
    if (!this.client) {
      this.client = await RestClient.create(TripService.tripHeaders());
    }
    return this.client;
  }

  async createTrips(data: CreateTripsPayload): Promise<RestResponse> {
    const client = await this.getClient();
    return client.post(ENV.TRIPS_API_URL || URLs.createTrips, data);
  }

  async dispose(): Promise<void> {
    if (this.client) {
      await this.client.dispose();
      this.client = null;
    }
  }
}
