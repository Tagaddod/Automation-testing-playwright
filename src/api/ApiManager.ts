import { B2bService } from "./b2b/B2bService";
import { B2cService } from "./b2c/B2cService";
import { B2xService } from "./b2x/B2xService";
import { CollectorService } from "./collector/CollectorService";
import type { GraphQLClient } from "./GraphQLClient";
import { SalesService } from "./sales/SalesService";
import { TripService } from "./trip/TripService";
import { WarehouseService } from "./warehouse/WarehouseService";

/** Facade for API modules — same idea as PoManager. */
export class ApiManager {
  readonly b2b: B2bService;
  readonly b2x: B2xService;
  readonly b2c: B2cService;
  readonly sales: SalesService;
  readonly trip: TripService;
  readonly collector: CollectorService;
  readonly warehouse: WarehouseService;

  constructor(private readonly client: GraphQLClient) {
    this.b2b = new B2bService(client);
    this.b2x = new B2xService(client);
    this.b2c = new B2cService(client);
    this.sales = new SalesService(client);
    this.trip = new TripService(client);
    this.collector = new CollectorService(client);
    this.warehouse = new WarehouseService(client);
  }

  async dispose(): Promise<void> {
    await this.client.dispose();
  }
}
