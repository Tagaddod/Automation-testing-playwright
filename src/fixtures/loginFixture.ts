import { test as base } from "@playwright/test";

import { apiLogin } from "../utils/authApi";

type MyFixtures = {
  token: string;
};

export const test = base.extend<MyFixtures>({
  // ✅ token fixture
  token: async ({}, use) => {
    // B2B/B2X UI is the Sales Agent app. Staging rejects ADMIN_EMAIL (433),
    // so setup uses the working Sales Egypt phone login.
    const { token } = await apiLogin("sales-app-egypt");
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
