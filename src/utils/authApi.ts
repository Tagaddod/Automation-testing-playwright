import { request } from "@playwright/test";
import { URLs } from "../config/urls";
import { ENV } from "../config/env";

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
      `
    }
  });

  const text = await response.text();
  const json = parseGraphqlResponse(text) as { data?: { login?: { jwtToken?: string } } };
  const token = json?.data?.login?.jwtToken;

  if (!token) {
    throw new Error(`Login failed: token not returned. Response: ${text.slice(0, 300)}`);
  }

  return { token };
}
