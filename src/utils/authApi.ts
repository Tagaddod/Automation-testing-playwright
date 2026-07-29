import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

import { request } from "@playwright/test";

import { ENV } from "../config/env";
import { URLs } from "../config/urls";

/**
 * Auth profiles:
 * - admin: EMAIL → B2B/B2X UI setup + default API
 * - sales-app-*: PHONE → Sales App API only
 * - collector-app: PHONE → Collector App API only
 */
export type AuthProfile = "admin" | "sales-app-egypt" | "sales-app-saudi" | "collector-app";

const TOKEN_PATHS: Record<AuthProfile, string> = {
  admin: "playwright/.auth/token.json", // legacy path used by auth.setup
  "sales-app-egypt": "playwright/.auth/token-sales-app-egypt.json",
  "sales-app-saudi": "playwright/.auth/token-sales-app-saudi.json",
  "collector-app": "playwright/.auth/token-collector-app.json",
};

type PhoneCredentials = {
  phone: string;
  password: string;
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
    case "sales-app-egypt":
      return {
        phone: requireValue(ENV.SALES_APP_EG_PHONE, "SALES_APP_EG_PHONE"),
        password: requireValue(ENV.SALES_APP_EG_PASSWORD, "SALES_APP_EG_PASSWORD"),
      };
    case "sales-app-saudi":
      return {
        phone: requireValue(ENV.SALES_APP_SA_PHONE, "SALES_APP_SA_PHONE"),
        password: requireValue(ENV.SALES_APP_SA_PASSWORD, "SALES_APP_SA_PASSWORD"),
      };
    case "collector-app":
      return {
        phone: requireValue(ENV.COLLECTOR_APP_PHONE, "COLLECTOR_APP_PHONE"),
        password: requireValue(ENV.COLLECTOR_APP_PASSWORD, "COLLECTOR_APP_PASSWORD"),
      };
  }
}

async function postLogin(query: string): Promise<{ token: string }> {
  const api = await request.newContext();
  const response = await api.post(URLs.graphql, { data: { query } });
  const text = await response.text();
  const json = parseGraphqlResponse(text) as {
    data?: { login?: { jwtToken?: string } };
    errors?: unknown;
  };
  const token = json?.data?.login?.jwtToken;

  if (!token) {
    throw new Error(`Login failed: token not returned. Response: ${text.slice(0, 300)}`);
  }

  return { token };
}

async function loginWithEmail(email: string, password: string) {
  return postLogin(`
    mutation {
      login(email: "${email}", password: "${password}", type: EMAIL) {
        id
        jwtToken
      }
    }
  `);
}

/**
 * Phone login for Sales / Collector apps.
 * Mutation: login(phone, password, type: PHONE)
 */
async function loginWithPhone({ phone, password }: PhoneCredentials) {
  return postLogin(`
    mutation {
      login(phone: "${phone}", password: "${password}", type: PHONE) {
        id
        jwtToken
      }
    }
  `);
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
    );
  }

  return loginWithPhone(phoneCredentials(profile));
}

/** Persist JWT per profile (admin still writes legacy token.json). */
export function saveAuthToken(token: string, profile: AuthProfile = "admin"): void {
  const path = TOKEN_PATHS[profile];
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify({ token }), "utf-8");
}

/** Prefer saved token for admin; phone app profiles always re-login (single-session JWT). */
export async function getAuthToken(profile: AuthProfile = "admin"): Promise<string> {
  if (profile === "admin") {
    const path = TOKEN_PATHS.admin;
    if (existsSync(path)) {
      const { token } = JSON.parse(readFileSync(path, "utf-8")) as { token?: string };
      if (token) return token;
    }
  }

  const { token } = await apiLogin(profile);
  saveAuthToken(token, profile);
  return token;
}
