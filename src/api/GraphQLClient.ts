import type { APIRequestContext, TestInfo } from "@playwright/test";
import { request } from "@playwright/test";

import { URLs } from "../config/urls";

export type GraphQLRequestBody = {
  query: string;
  variables: Record<string, unknown>;
};

export type GraphQLResponseBody<T> = {
  status: number;
  body: {
    data: T | null;
    errors?: Array<{ message: string }>;
  };
};

export type GraphQLResponse<T> = {
  data: T | null;
  errors?: Array<{ message: string }>;
  status?: number;
  requestBody: GraphQLRequestBody;
  responseBody: GraphQLResponseBody<T>;
};

/** Authenticated GraphQL client (Playwright APIRequestContext). */
export class GraphQLClient {
  private static lastRequestBody: GraphQLRequestBody | null = null;
  private static lastResponseBody: GraphQLResponseBody<unknown> | null = null;

  private constructor(private readonly context: APIRequestContext) {}

  /**
   * Single source of truth for authenticated GraphQL HTTP headers.
   * Do not set Authorization / Content-Type / Accept elsewhere.
   */
  private static buildHeaders(token: string): Record<string, string> {
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    };
  }

  private static rememberExchange<T>(
    requestBody: GraphQLRequestBody,
    responseBody: GraphQLResponseBody<T>,
  ): void {
    GraphQLClient.lastRequestBody = requestBody;
    GraphQLClient.lastResponseBody = responseBody as GraphQLResponseBody<unknown>;
  }

  /** Last GraphQL request body sent by {@link execute} (for HTML attachments). */
  static getLastRequestBody(): GraphQLRequestBody {
    if (!GraphQLClient.lastRequestBody) {
      throw new Error("No GraphQL request has been executed yet.");
    }
    return GraphQLClient.lastRequestBody;
  }

  /** Last GraphQL response body recorded by {@link execute} (for HTML attachments). */
  static getLastResponseBody(): GraphQLResponseBody<unknown> {
    if (!GraphQLClient.lastResponseBody) {
      throw new Error("No GraphQL response has been recorded yet.");
    }
    return GraphQLClient.lastResponseBody;
  }

  /**
   * Attach last GraphQL request/response to the Playwright HTML report.
   * Preserves existing attachment names and JSON structure.
   * No-op when no exchange has been recorded yet.
   */
  static async attachLastExchange(testInfo: Pick<TestInfo, "attach">): Promise<void> {
    if (!GraphQLClient.lastRequestBody || !GraphQLClient.lastResponseBody) {
      return;
    }
    await testInfo.attach("GraphQL Request Body", {
      body: JSON.stringify(GraphQLClient.lastRequestBody, null, 2),
      contentType: "application/json",
    });
    await testInfo.attach("GraphQL Response Body", {
      body: JSON.stringify(GraphQLClient.lastResponseBody, null, 2),
      contentType: "application/json",
    });
  }

  static async create(token: string): Promise<GraphQLClient> {
    const context = await request.newContext({
      timeout: 60_000,
      extraHTTPHeaders: GraphQLClient.buildHeaders(token),
    });
    return new GraphQLClient(context);
  }

  /**
   * Single entry point for authenticated GraphQL execution.
   * Builds the request body, posts to the GraphQL endpoint, and returns
   * data / errors / status plus attachable requestBody / responseBody.
   */
  async execute<T>(
    query: string,
    variables: Record<string, unknown> = {},
  ): Promise<GraphQLResponse<T>> {
    const requestBody: GraphQLRequestBody = { query, variables };

    const response = await this.context.post(URLs.graphql, {
      data: requestBody,
    });

    const status = response.status();
    const text = await response.text();

    let data: T | null = null;
    let errors: Array<{ message: string }> | undefined;

    try {
      const parsed = JSON.parse(text) as {
        data?: T | null;
        errors?: Array<{ message: string }>;
      };
      data = (parsed.data ?? null) as T | null;
      errors = parsed.errors;
    } catch {
      errors = [{ message: text.slice(0, 500) }];
    }

    const responseBody: GraphQLResponseBody<T> = {
      status,
      body: { data, errors },
    };

    GraphQLClient.rememberExchange(requestBody, responseBody);

    const result: GraphQLResponse<T> = {
      data,
      errors,
      status,
      requestBody,
      responseBody,
    };

    if (!response.ok()) {
      throw Object.assign(new Error(`GraphQL HTTP ${status}: ${text.slice(0, 500)}`), result);
    }

    return result;
  }

  async dispose(): Promise<void> {
    await this.context.dispose();
  }
}
