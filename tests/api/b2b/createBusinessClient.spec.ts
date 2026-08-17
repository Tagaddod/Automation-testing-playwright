import { existsSync, readFileSync } from "node:fs";

import { buildBranchData, buildBusinessClientData } from "../../../src/api/b2b/testData";
import { getApiResponsePath, saveApiResponse } from "../../../src/api/saveApiResponse";
import { expect, test } from "../../../src/fixtures/apiFixture";

type GraphQlLikeResponse = {
  data: unknown;
  errors?: Array<{ message: string }>;
  status?: number;
};

const BUSINESS_CLIENT_ID_PATH = getApiResponsePath("businessClientId");

function authFailureMessage(status: string | number, backendMessage: string): string {
  return `
====================================================
Authentication Failed

Status:
${status}

Backend Message:

${backendMessage}

====================================================
`;
}

function extractAuthFailure(response: {
  errors?: Array<{ message?: string; extensions?: { code?: number | string } }>;
}): { status: string | number; message: string } | null {
  const error = response.errors?.[0];
  if (!error) {
    return null;
  }

  const code = error.extensions?.code;
  const message = error.message ?? "";
  const isSessionTaken =
    code === 413 ||
    code === "413" ||
    message.includes("Someone logged in to your account from another device");

  if (!isSessionTaken) {
    return null;
  }

  return {
    status: code ?? 413,
    message: message || "Someone logged in to your account from another device!",
  };
}

function resolveCreateBranchPrerequisites(): {
  businessClientId: string;
  collectableId: string;
} {
  const fromEnvClient = (process.env.BUSINESS_CLIENT_ID || "").trim();
  const fromEnvCollectable = (process.env.COLLECTABLE_ID || "").trim();

  let businessClientId = fromEnvClient;
  if (!businessClientId && existsSync(BUSINESS_CLIENT_ID_PATH)) {
    const saved = JSON.parse(readFileSync(BUSINESS_CLIENT_ID_PATH, "utf-8")) as {
      businessClientId?: string;
    };
    businessClientId = saved.businessClientId?.trim() ?? "";
  }

  const collectableId = fromEnvCollectable || "1";

  if (!businessClientId) {
    throw new Error(
      `
====================================================
Prerequisite Failed

Required:
BUSINESS_CLIENT_ID (env) or playwright/api-responses/businessClientId.json
from the preceding create business client test.

Optional:
COLLECTABLE_ID (defaults to "1" when unset)

====================================================
`.trim(),
    );
  }

  return { businessClientId, collectableId };
}

test.describe("B2B GraphQL API", { tag: ["@api", "@b2b", "@create business client"] }, () => {
  test("create business client", async ({ api }) => {
    const brands = await api.b2b.getBrandTypes();

    const brandsAuthFailure = extractAuthFailure(brands);
    if (brandsAuthFailure) {
      const message = authFailureMessage(brandsAuthFailure.status, brandsAuthFailure.message);
      console.warn(message);
      throw new Error(message);
    }

    expect(brands, "The brand-types API should return a response.").toBeDefined();
    expect(
      (brands as GraphQlLikeResponse).status ?? 200,
      "The brand-types API should return HTTP 200.",
    ).toBe(200);
    expect(
      brands.errors,
      "The brand-types response should not contain GraphQL errors.",
    ).toBeUndefined();
    expect(brands.data, "The brand-types response should contain data.").toBeDefined();
    const brandTypes = brands.data?.getBrandTypesB2bForm;
    expect(
      brandTypes,
      "The brand-types response should contain a brand-types array.",
    ).toBeDefined();
    expect(
      brandTypes?.length,
      "The backend should return at least one brand type.",
    ).toBeGreaterThan(0);
    for (const brandType of brandTypes ?? []) {
      expect(brandType.id, "Each brand type should have a valid ID.").toBeTruthy();
      expect(brandType.name, "Each brand type should have a non-empty name.").toBeTruthy();
    }

    const brandTypeId = brandTypes?.[0]?.id;
    expect(brandTypeId, "The first returned brand type should have a valid ID.").toBeTruthy();
    const data = buildBusinessClientData({ brand_type_id: brandTypeId! });

    const response = await api.b2b.createBusinessClient(data);

    const createAuthFailure = extractAuthFailure(response);
    if (createAuthFailure) {
      const message = authFailureMessage(createAuthFailure.status, createAuthFailure.message);
      console.warn(message);
      throw new Error(message);
    }

    expect(response, "The create-business-client API should return a response.").toBeDefined();
    expect(
      (response as GraphQlLikeResponse).status ?? 200,
      "The create-business-client API should return HTTP 200.",
    ).toBe(200);
    expect(
      response.errors,
      "The create-business-client response should not contain GraphQL errors.",
    ).toBeUndefined();
    expect(response.data, "The create-business-client response should contain data.").toBeDefined();

    const businessClient = response.data?.createBusinessClientB2bForm;
    expect(
      businessClient,
      "The response should contain the created business client.",
    ).toBeDefined();
    expect(businessClient?.id, "The created business client should have a valid ID.").toBeTruthy();
    expect(
      businessClient?.name,
      "The created business client should have a non-empty name.",
    ).toBeTruthy();
    expect(
      businessClient?.status,
      "The created business client should have a status.",
    ).toBeTruthy();
    expect(
      businessClient?.brandType?.id,
      "The created business client should return its brand-type ID.",
    ).toBe(brandTypeId);
    expect(
      businessClient?.brandType?.name,
      "The created business client should return its brand-type name.",
    ).toBeTruthy();

    const filePath = saveApiResponse("createBusinessClient", response);
    if (businessClient?.id) {
      saveApiResponse("businessClientId", { businessClientId: businessClient.id });
    }

    console.warn(`Saved business client response to ${filePath}`);
  });

  test("create branch", async ({ api }) => {
    const { businessClientId, collectableId } = resolveCreateBranchPrerequisites();

    const data = buildBranchData({
      business_client_id: businessClientId,
      collectable_id: collectableId,
    });
    const response = await api.b2b.createBranch(data);

    const createAuthFailure = extractAuthFailure(response);
    if (createAuthFailure) {
      const message = authFailureMessage(createAuthFailure.status, createAuthFailure.message);
      console.warn(message);
      throw new Error(message);
    }

    expect(response, "The create-branch API should return a response.").toBeDefined();
    expect(
      (response as GraphQlLikeResponse).status ?? 200,
      "The create-branch API should return HTTP 200.",
    ).toBe(200);
    expect(
      response.errors,
      "The create-branch response should not contain GraphQL errors.",
    ).toBeUndefined();
    expect(response.data, "The create-branch response should contain data.").toBeDefined();

    const branch = response.data?.createBranch;
    expect(branch, "The response should contain the created branch.").toBeDefined();
    expect(branch?.id, "The created branch should have a valid ID.").toBeTruthy();
    expect(branch?.phone, "The created branch phone should match the submitted phone.").toBe(
      data.phone,
    );
    expect(
      branch?.payment_type,
      "The created branch payment type should match the submitted value.",
    ).toBe(data.payment_type);
    expect(
      branch?.latitude,
      "The created branch latitude should match the submitted latitude.",
    ).toBe(data.latitude);
    expect(
      branch?.longitude,
      "The created branch longitude should match the submitted longitude.",
    ).toBe(data.longitude);
    expect(branch?.status, "The created branch should have a status.").toBeTruthy();
  });
});
