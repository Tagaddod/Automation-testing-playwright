import { expect, test as base } from "@playwright/test";

import { ApiManager } from "../api/ApiManager";
import { GraphQLClient } from "../api/GraphQLClient";
import { type AuthProfile, getAuthToken } from "../utils/authApi";

type ApiFixtures = {
  /** Admin JWT (default) — same path as UI setup token.json */
  token: string;
  /** Admin API client (default) */
  api: ApiManager;

  salesAppEgyptToken: string;
  salesAppEgyptApi: ApiManager;

  salesAppSaudiToken: string;
  salesAppSaudiApi: ApiManager;

  collectorAppToken: string;
  collectorAppApi: ApiManager;
};

async function createApiManager(profile: AuthProfile): Promise<ApiManager> {
  const token = await getAuthToken(profile);
  const client = await GraphQLClient.create(token);
  return new ApiManager(client);
}

/**
 * API fixtures:
 * - `api` / `token` → admin EMAIL (backward compatible)
 * - `salesAppEgyptApi` / `salesAppSaudiApi` → Sales App phone login
 * - `collectorAppApi` → Collector App phone login
 */
export const test = base.extend<ApiFixtures>({
  token: async ({}, use) => {
    await use(await getAuthToken("admin"));
  },

  api: async ({ token }, use) => {
    const client = await GraphQLClient.create(token);
    const api = new ApiManager(client);
    await use(api);
    await api.dispose();
  },

  salesAppEgyptToken: async ({}, use) => {
    await use(await getAuthToken("sales-app-egypt"));
  },

  salesAppEgyptApi: async ({}, use) => {
    const api = await createApiManager("sales-app-egypt");
    await use(api);
    await api.dispose();
  },

  salesAppSaudiToken: async ({}, use) => {
    await use(await getAuthToken("sales-app-saudi"));
  },

  salesAppSaudiApi: async ({}, use) => {
    const api = await createApiManager("sales-app-saudi");
    await use(api);
    await api.dispose();
  },

  collectorAppToken: async ({}, use) => {
    await use(await getAuthToken("collector-app"));
  },

  collectorAppApi: async ({}, use) => {
    const api = await createApiManager("collector-app");
    await use(api);
    await api.dispose();
  },
});

export { expect };
