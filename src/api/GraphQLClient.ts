import type { APIRequestContext } from "@playwright/test";
import { request } from "@playwright/test";

import { URLs } from "../config/urls";

export type GraphQLResponse<T> = {
  data: T | null;
  errors?: Array<{ message: string }>;
};

/** Authenticated GraphQL client (Playwright APIRequestContext). */
export class GraphQLClient {
  private constructor(private readonly context: APIRequestContext) {}

  static async create(token: string): Promise<GraphQLClient> {
    const context = await request.newContext({
      timeout: 60_000,
      extraHTTPHeaders: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return new GraphQLClient(context);
  }

  async request<T>(
    query: string,
    variables: Record<string, unknown> = {},
  ): Promise<GraphQLResponse<T>> {
    const response = await this.context.post(URLs.graphql, {
      data: { query, variables },
    });

    const text = await response.text();
    if (!response.ok()) {
      throw new Error(`GraphQL HTTP ${response.status()}: ${text.slice(0, 500)}`);
    }

    return JSON.parse(text) as GraphQLResponse<T>;
  }

  async dispose(): Promise<void> {
    await this.context.dispose();
  }
}
