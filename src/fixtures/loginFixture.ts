import { test as base } from "@playwright/test";

import { ENVIRONMENTS } from "../config/environments";
import { apiLogin } from "../utils/authApi";

type MyFixtures = {
  token: string;
};

export const test = base.extend<MyFixtures>({
  // ✅ token fixture
  token: async ({}, use) => {
    // createBranchB2bForm is Gap-guarded and rejects the Sales Egypt phone user (427).
    // Admin email login opens the B2B/B2X webform and can create branches.
    const { token } = await apiLogin("admin");
    await use(token);
  },
});

// 👇 نعمل override للـ context
test.beforeEach(async ({ context }) => {
  const env = (process.env.ENV || "staging") as keyof typeof ENVIRONMENTS;
  await context.grantPermissions([], {
    origin: ENVIRONMENTS[env].GREENPAN_BASE_URL,
  });
});

export const expect = test.expect;
