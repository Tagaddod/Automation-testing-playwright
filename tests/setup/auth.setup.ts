import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

import { URLs } from "../../src/config/urls";
import { test as setup } from "../../src/fixtures/loginFixture";
import { gotoAuthTokenPage, saveAuthToken } from "../../src/utils/authApi";

const AUTH_STATE_PATH = "playwright/.auth/user.json";

/**
 * Runs once before B2B / API tests:
 * GraphQL login (existing apiLogin) → persist JWT + browser storageState.
 * save the browser session for b2b and b2x
 */
setup("authenticate B2B and save storage state", async ({ page, token }) => {
  mkdirSync(dirname(AUTH_STATE_PATH), { recursive: true });
  saveAuthToken(token);

  await gotoAuthTokenPage(page, `${URLs.b2b.auth}${token}`);
  await gotoAuthTokenPage(page, `${URLs.greenpan.auth}${token}`);
  await page.context().storageState({ path: AUTH_STATE_PATH });
});
