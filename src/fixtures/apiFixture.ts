import { expect, test as base } from "@playwright/test";

import { ApiManager } from "../api/ApiManager";
import { GraphQLClient } from "../api/GraphQLClient";
import { getAuthToken } from "../utils/authApi";

type ApiFixtures = {
  token: string;
  api: ApiManager;
};

/** API tests reuse the JWT from auth.setup (same apiLogin path as UI). */
export const test = base.extend<ApiFixtures>({
  token: async ({}, use) => {
    await use(await getAuthToken());
  },

  api: async ({ token }, use) => {
    const client = await GraphQLClient.create(token);
    const api = new ApiManager(client);
    await use(api);
    await api.dispose();
  },
});

export { expect };
