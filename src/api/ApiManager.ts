import { B2bService } from "./b2b/B2bService";
import type { GraphQLClient } from "./GraphQLClient";
import { SalesService } from "./sales/SalesService";

/** Facade for API modules — same idea as PoManager. */
export class ApiManager {
  readonly b2b: B2bService;
  readonly sales: SalesService;

  constructor(private readonly client: GraphQLClient) {
    this.b2b = new B2bService(client);
    this.sales = new SalesService(client);
  }

  async dispose(): Promise<void> {
    await this.client.dispose();
  }
}
