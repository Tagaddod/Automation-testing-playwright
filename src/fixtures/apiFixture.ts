import { expect, test as base } from "@playwright/test";

import { ApiManager } from "../api/ApiManager";
import { GraphQLClient } from "../api/GraphQLClient";
import { getAuthToken } from "../utils/authApi";

type ApiFixtures = {
  /** Admin JWT (default) — same path as UI setup token.json */
  token: string;
  /** Admin API client (default) */
  api: ApiManager;

  customerAppToken: string;
  customerAppApi: ApiManager;

  salesAppEgyptApi: ApiManager;

  salesAppSaudiToken: string;
  salesAppSaudiApi: ApiManager;

  salesAppJordanToken: string;
  salesAppJordanApi: ApiManager;

  salesAppViennaToken: string;
  salesAppViennaApi: ApiManager;

  collectorAppToken: string;
  collectorAppApi: ApiManager;

  /**
   * Auto-attaches the last GraphQL request/response to the HTML report.
   * Keeps Sales tests free of GraphQLClient.attachLastExchange / test.info() calls.
   */
  attachGraphqlExchange: undefined;
};

type ApiWorkerFixtures = {
  /** One Sales Egypt login per worker (single-session JWT). */
  salesAppEgyptToken: string;
};

/**
 * API fixtures:
 * - `api` / `token` → admin EMAIL (backward compatible)
 * - `customerAppApi` → B2C Customer App phone login
 * - `salesAppEgyptApi` / `salesAppSaudiApi` / `salesAppJordanApi` / `salesAppViennaApi` → Sales App phone login
 * - `collectorAppApi` → Collector App phone login
 *
 * Sales Egypt token is worker-scoped so login runs once per worker
 * (Sales Egypt JWT is single-session — a second login invalidates the first).
 */
export const test = base.extend<ApiFixtures, ApiWorkerFixtures>({
  attachGraphqlExchange: [
    async ({}, use, testInfo) => {
      await use(undefined);
      await GraphQLClient.attachLastExchange(testInfo);
    },
    { auto: true },
  ],

  token: async ({}, use) => {
    await use(await getAuthToken("admin"));
  },

  api: async ({ token }, use) => {
    const client = await GraphQLClient.create(token);
    const api = new ApiManager(client);
    await use(api);
    await api.dispose();
  },

  customerAppToken: async ({}, use) => {
    await use(await getAuthToken("customer-app"));
  },

  customerAppApi: async ({ customerAppToken }, use) => {
    const client = await GraphQLClient.create(customerAppToken);
    const api = new ApiManager(client);
    await use(api);
    await api.dispose();
  },

  salesAppEgyptToken: [
    async ({}, use) => {
      await use(await getAuthToken("sales-app-egypt"));
    },
    { scope: "worker" },
  ],

  salesAppEgyptApi: async ({ salesAppEgyptToken }, use) => {
    const client = await GraphQLClient.create(salesAppEgyptToken);
    const api = new ApiManager(client);
    await use(api);
    await api.dispose();
  },

  salesAppSaudiToken: async ({}, use) => {
    await use(await getAuthToken("sales-app-saudi"));
  },

  salesAppSaudiApi: async ({ salesAppSaudiToken }, use) => {
    const client = await GraphQLClient.create(salesAppSaudiToken);
    const api = new ApiManager(client);
    await use(api);
    await api.dispose();
  },

  salesAppJordanToken: async ({}, use) => {
    await use(await getAuthToken("sales-app-jordan"));
  },

  salesAppJordanApi: async ({ salesAppJordanToken }, use) => {
    const client = await GraphQLClient.create(salesAppJordanToken);
    const api = new ApiManager(client);
    await use(api);
    await api.dispose();
  },

  salesAppViennaToken: async ({}, use) => {
    await use(await getAuthToken("sales-app-vienna"));
  },

  salesAppViennaApi: async ({ salesAppViennaToken }, use) => {
    const client = await GraphQLClient.create(salesAppViennaToken);
    const api = new ApiManager(client);
    await use(api);
    await api.dispose();
  },

  collectorAppToken: async ({}, use) => {
    await use(await getAuthToken("collector-app"));
  },

  collectorAppApi: async ({ collectorAppToken }, use) => {
    const client = await GraphQLClient.create(collectorAppToken);
    const api = new ApiManager(client);
    await use(api);
    await api.dispose();
  },
});

export { expect };
