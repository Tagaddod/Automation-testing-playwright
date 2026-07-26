import { GraphQLClient } from "./GraphQLClient";
import { B2bService } from "./b2b/B2bService";

/** Facade for API modules — same idea as PoManager. */
export class ApiManager {
  readonly b2b: B2bService;

  constructor(private readonly client: GraphQLClient) {
    this.b2b = new B2bService(client);
  }

  async graphql(query: string, variables: Record<string, any>): Promise<any> {
    return this.client.request(query, variables);
  }

  async dispose(): Promise<void> {
    await this.client.dispose();
  }
}
