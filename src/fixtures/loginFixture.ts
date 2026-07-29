import { test as base } from "@playwright/test";

import { apiLogin } from "../utils/authApi";

type MyFixtures = {
  token: string;
};

export const test = base.extend<MyFixtures>({
  // ✅ token fixture
  token: async ({}, use) => {
    // Admin EMAIL login for B2B/B2X UI auth.setup only
    const { token } = await apiLogin("admin");
    await use(token);
  },
});

// 👇 نعمل override للـ context
test.beforeEach(async ({ context }) => {
  await context.grantPermissions([], {
    origin: "https://dev-greenpan.tagaddod.com",
  });
});

export const expect = test.expect;
