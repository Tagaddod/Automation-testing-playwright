import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

import { request } from "@playwright/test";

import { ENV } from "../config/env";
import { URLs } from "../config/urls";

/**
 * Auth profiles:
 * - admin: EMAIL → B2B/B2X UI setup + default API
 * - customer-app: PHONE → B2C Customer App API only
 * - sales-app-*: PHONE → Sales App API only
 * - collector-app: PHONE → Collector App API only
 */
export type AuthProfile =
  | "admin"
  | "customer-app"
  | "sales-app-egypt"
  | "sales-app-saudi"
  | "sales-app-jordan"
  | "sales-app-vienna"
  | "collector-app";

const TOKEN_PATHS: Record<AuthProfile, string> = {
  admin: "playwright/.auth/token.json", // legacy path used by auth.setup
  "customer-app": "playwright/.auth/token-customer-app.json",
  "sales-app-egypt": "playwright/.auth/token-sales-app-egypt.json",
  "sales-app-saudi": "playwright/.auth/token-sales-app-saudi.json",
  "sales-app-jordan": "playwright/.auth/token-sales-app-jordan.json",
  "sales-app-vienna": "playwright/.auth/token-sales-app-vienna.json",
  "collector-app": "playwright/.auth/token-collector-app.json",
};

type PhoneCredentials = {
  phone: string;
  password: string;
  /** Optional GraphQL login country_code (required for Jordan / Vienna). */
  countryCode?: string;
};

function parseGraphqlResponse(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start === -1 || end === -1 || end <= start) {
      throw new Error(`Login API returned non-JSON: ${text.slice(0, 300)}`);
    }
    return JSON.parse(text.slice(start, end + 1));
  }
}

function requireValue(value: string, name: string): string {
  if (!value) {
    throw new Error(`Missing env var for API login: ${name}`);
  }
  return value;
}

function phoneCredentials(profile: Exclude<AuthProfile, "admin">): PhoneCredentials {
  switch (profile) {
    case "customer-app":
      return {
        phone: requireValue(ENV.CUSTOMER_APP_PHONE, "CUSTOMER_APP_PHONE"),
        password: requireValue(ENV.CUSTOMER_APP_PASSWORD, "CUSTOMER_APP_PASSWORD"),
        countryCode: ENV.CUSTOMER_APP_COUNTRY_CODE || undefined,
      };
    case "sales-app-egypt":
      // Sales Agent Egypt: phone/password from .env.
      // Do NOT send country_code on login (API rejects EG here; Postman loginGap omits it).
      return {
        phone: requireValue(ENV.SALES_APP_EG_PHONE, "SALES_APP_EG_PHONE"),
        password: requireValue(ENV.SALES_APP_EG_PASSWORD, "SALES_APP_EG_PASSWORD"),
      };
    case "sales-app-saudi":
      return {
        phone: requireValue(ENV.SALES_APP_SA_PHONE, "SALES_APP_SA_PHONE"),
        password: requireValue(ENV.SALES_APP_SA_PASSWORD, "SALES_APP_SA_PASSWORD"),
        // ISO country code for GraphQL login (not dialing code)
        countryCode: "SA",
      };
    case "sales-app-jordan":
      return {
        phone: requireValue(ENV.SALES_APP_JORDAN_PHONE, "SALES_APP_JORDAN_PHONE"),
        password: requireValue(ENV.SALES_APP_JORDAN_PASSWORD, "SALES_APP_JORDAN_PASSWORD"),
        // Postman: login sales jordan → country_code: "JO"
        countryCode: "JO",
      };
    case "sales-app-vienna":
      return {
        phone: requireValue(ENV.SALES_APP_VIENNA_PHONE, "SALES_APP_VIENNA_PHONE"),
        password: requireValue(ENV.SALES_APP_VIENNA_PASSWORD, "SALES_APP_VIENNA_PASSWORD"),
        // Postman: login sales vienna → country_code: "AT"
        countryCode: "AT",
      };
    case "collector-app":
      return {
        phone: requireValue(ENV.COLLECTOR_APP_PHONE, "COLLECTOR_APP_PHONE"),
        password: requireValue(ENV.COLLECTOR_APP_PASSWORD, "COLLECTOR_APP_PASSWORD"),
      };
  }
}

function loginEnvHint(profile: AuthProfile): string {
  if (profile === "admin") {
    return "Check ADMIN_EMAIL and ADMIN_PASSWORD in .env / .env.staging (do not hardcode credentials).";
  }
  if (profile === "customer-app") {
    return "Check CUSTOMER_APP_PHONE and CUSTOMER_APP_PASSWORD in .env / .env.staging.";
  }
  if (profile === "sales-app-egypt") {
    return "Check SALES_APP_EG_PHONE and SALES_APP_EG_PASSWORD in .env / .env.staging.";
  }
  if (profile === "sales-app-saudi") {
    return "Check SALES_APP_SA_PHONE / SALES_APP_SAUDI_PHONE and matching password env vars.";
  }
  if (profile === "sales-app-jordan") {
    return "Check SALES_APP_JORDAN_PHONE and SALES_APP_JORDAN_PASSWORD.";
  }
  if (profile === "sales-app-vienna") {
    return "Check SALES_APP_VIENNA_PHONE and SALES_APP_VIENNA_PASSWORD.";
  }
  return "Check COLLECTOR_APP_PHONE and COLLECTOR_APP_PASSWORD.";
}

async function postLogin(query: string, profile: AuthProfile): Promise<{ token: string }> {
  const api = await request.newContext();

  // Staging occasionally resets the connection (ECONNRESET); retry a few times.
  let response;
  let lastError: unknown;
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      response = await api.post(URLs.graphql, { data: { query } });
      break;
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
    }
  }
  if (!response) {
    throw new Error(`Login request failed after retries: ${String(lastError)}`);
  }

  const text = await response.text();
  const json = parseGraphqlResponse(text) as {
    data?: { login?: { jwtToken?: string } };
    errors?: Array<{ message?: string }>;
  };
  const token = json?.data?.login?.jwtToken;

  if (!token) {
    const backendMessage = json?.errors?.[0]?.message ?? text.slice(0, 300);
    throw new Error(
      `Login failed for profile "${profile}": token not returned.

Backend message:
${backendMessage}

${loginEnvHint(profile)}

Raw response (truncated): ${text.slice(0, 300)}`,
    );
  }

  return { token };
}

async function loginWithEmail(email: string, password: string, profile: AuthProfile = "admin") {
  return postLogin(
    `
    mutation {
      login(email: "${email}", password: "${password}", type: EMAIL) {
        id
        jwtToken
      }
    }
  `,
    profile,
  );
}

/**
 * Phone login for Sales / Collector apps.
 * Mutation: login(phone, password, type: PHONE[, country_code])
 */
async function loginWithPhone(
  { phone, password, countryCode }: PhoneCredentials,
  profile: AuthProfile,
) {
  const countryArg = countryCode ? `, country_code: "${countryCode}"` : "";
  return postLogin(
    `
    mutation {
      login(phone: "${phone}", password: "${password}", type: PHONE${countryArg}) {
        id
        jwtToken
      }
    }
  `,
    profile,
  );
}

/**
 * GraphQL login by profile.
 * Default `admin` keeps B2B/B2X UI setup and existing API tests working.
 */
export async function apiLogin(profile: AuthProfile = "admin") {
  if (profile === "admin") {
    return loginWithEmail(
      requireValue(ENV.ADMIN_EMAIL, "ADMIN_EMAIL"),
      requireValue(ENV.ADMIN_PASSWORD, "ADMIN_PASSWORD"),
      profile,
    );
  }

  return loginWithPhone(phoneCredentials(profile), profile);
}

/** Persist JWT per profile (admin still writes legacy token.json). */
export function saveAuthToken(token: string, profile: AuthProfile = "admin"): void {
  const path = TOKEN_PATHS[profile];
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify({ token }), "utf-8");
}

/**
 * Always re-login so JWTs stay single-session fresh.
 * Stale admin tokens from token.json caused 413 "logged in from another device".
 */
export async function getAuthToken(profile: AuthProfile = "admin"): Promise<string> {
  const { token } = await apiLogin(profile);
  saveAuthToken(token, profile);
  return token;
}
