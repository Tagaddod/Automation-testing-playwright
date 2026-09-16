import { B2bService } from "./b2b/B2bService";
import { CollectorService } from "./collector/CollectorService";
import type { GraphQLClient } from "./GraphQLClient";
import { SalesService } from "./sales/SalesService";
import { TripService } from "./trips/TripService";

/** Facade for API modules — same idea as PoManager. */
export class ApiManager {
  readonly b2b: B2bService;
  readonly sales: SalesService;
  readonly trips: TripService;
  readonly collector: CollectorService;

  constructor(private readonly client: GraphQLClient) {
    this.b2b = new B2bService(client);
    this.sales = new SalesService(client);
    this.trips = new TripService();
    this.collector = new CollectorService(client);
  }

  async dispose(): Promise<void> {
    await this.trips.dispose();
    await this.client.dispose();
  }
}
