import { test as base, expect } from "@playwright/test";
import { ApiManager } from "../api/ApiManager";
import { GraphQLClient } from "../api/GraphQLClient";
import { apiLogin } from "../utils/authApi";

type ApiFixtures = {
  api: ApiManager;
};

type ApiWorkerFixtures = {
  token: string;
};

/** Use a fresh token once per worker; persisted JWTs may be invalidated elsewhere. */
export const test = base.extend<ApiFixtures, ApiWorkerFixtures>({
  token: [
    async ({}, use) => {
      const { token } = await apiLogin();
      await use(token);
    },
    { scope: "worker" },
  ],

  api: async ({ token }, use) => {
    const client = await GraphQLClient.create(token);
    const api = new ApiManager(client);
    await use(api);
    await api.dispose();
  },
});

export { expect };
