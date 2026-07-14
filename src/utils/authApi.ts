import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { request } from "@playwright/test";
import { URLs } from "../config/urls";
import { ENV } from "../config/env";

const AUTH_TOKEN_PATH = "playwright/.auth/token.json";

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

export async function apiLogin() {
  const api = await request.newContext();

  const response = await api.post(URLs.graphql, {
    data: {
      query: `
        mutation {
          login(email: "${ENV.ADMIN_EMAIL}", password: "${ENV.ADMIN_PASSWORD}", type: EMAIL) {
            id
            jwtToken
          }
        }
      `,
    },
  });

  const text = await response.text();
  const json = parseGraphqlResponse(text) as {
    data?: { login?: { jwtToken?: string } };
  };
  const token = json?.data?.login?.jwtToken;

  if (!token) {
    throw new Error(
      `Login failed: token not returned. Response: ${text.slice(0, 300)}`
    );
  }

  return { token };
}

/** Persist JWT from setup so API tests reuse the same login. */
export function saveAuthToken(token: string): void {
  mkdirSync(dirname(AUTH_TOKEN_PATH), { recursive: true });
  writeFileSync(AUTH_TOKEN_PATH, JSON.stringify({ token }), "utf-8");
}

/** Prefer setup token; fall back to apiLogin for local API-only runs. */
export async function getAuthToken(): Promise<string> {
  if (existsSync(AUTH_TOKEN_PATH)) {
    const { token } = JSON.parse(
      readFileSync(AUTH_TOKEN_PATH, "utf-8")
    ) as { token?: string };
    if (token) return token;
  }

  const { token } = await apiLogin();
  saveAuthToken(token);
  return token;
}
