import { B2bService } from "./b2b/B2bService";
import type { GraphQLClient } from "./GraphQLClient";
import { SalesService } from "./sales/SalesService";
import { WarehouseService } from "./Warehouse/WarehouseService";

/** Facade for API modules — same idea as PoManager. */
export class ApiManager {
  readonly b2b: B2bService;
  readonly sales: SalesService;
  readonly warehouse: WarehouseService;

  constructor(private readonly client: GraphQLClient) {
    this.b2b = new B2bService(client);
    this.sales = new SalesService(client);
    this.warehouse = new WarehouseService(client);
  }

  async dispose(): Promise<void> {
    await this.client.dispose();
  }
}
