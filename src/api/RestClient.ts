import type { APIRequestContext } from "@playwright/test";
import { request } from "@playwright/test";

import { ENV } from "../config/env";

export type RestResponse<T = unknown> = {
  status: number;
  body: T;
  ok: boolean;
};

type RestExchange = {
  method: string;
  url: string;
  payload: unknown;
  status: number;
  body: unknown;
  ok: boolean;
  headerNames: string[];
};

/**
 * REST client (Playwright APIRequestContext).
 * Callers supply headers — GraphQL JWT and sibling-server-api-key stay out of this class.
 */
export class RestClient {
  private static lastExchange: RestExchange | null = null;

  private constructor(
    private readonly context: APIRequestContext,
    private readonly headers: Record<string, string>,
  ) {}

  /** Redact secrets from logged JSON/text. */
  private static redact(value: unknown): string {
    const text = typeof value === "string" ? value : JSON.stringify(value, null, 2);
    const apiKey = ENV.SIBLING_SERVER_API_KEY;
    if (!apiKey || !text.includes(apiKey)) {
      return text;
    }
    return text.split(apiKey).join("[REDACTED]");
  }

  private static formatFailure(exchange: RestExchange): string {
    return `
====================================================
REST request failed

HTTP method:
${exchange.method}

Endpoint:
${exchange.url}

Request headers:
${exchange.headerNames.join(", ") || "(none)"}

Request payload:
${RestClient.redact(exchange.payload)}

Response status:
${exchange.status}

Response body:
${RestClient.redact(exchange.body)}
====================================================
`.trim();
  }

  private static rememberExchange(exchange: RestExchange): void {
    RestClient.lastExchange = exchange;
    if (!exchange.ok) {
      console.error(RestClient.formatFailure(exchange));
    }
  }

  /** Last REST failure details (API key redacted). Undefined when last request succeeded. */
  static getLastFailureMessage(): string | undefined {
    if (!RestClient.lastExchange || RestClient.lastExchange.ok) {
      return undefined;
    }
    return RestClient.formatFailure(RestClient.lastExchange);
  }

  static async create(headers: Record<string, string> = {}): Promise<RestClient> {
    const context = await request.newContext({
      timeout: 60_000,
      extraHTTPHeaders: headers,
    });
    return new RestClient(context, headers);
  }

  async post<T = unknown>(url: string, data: unknown): Promise<RestResponse<T>> {
    const response = await this.context.post(url, {
      headers: this.headers,
      data,
    });
    const status = response.status();
    const ok = response.ok();
    const text = await response.text();

    let body: T;
    try {
      body = JSON.parse(text) as T;
    } catch {
      body = text as T;
    }

    RestClient.rememberExchange({
      method: "POST",
      url,
      payload: data,
      status,
      body,
      ok,
      headerNames: Object.keys(this.headers),
    });

    return { status, body, ok };
  }

  async dispose(): Promise<void> {
    await this.context.dispose();
  }
}
