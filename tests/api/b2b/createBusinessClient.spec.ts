import { existsSync, readFileSync } from "node:fs";

import { buildBranchData, buildBusinessClientData } from "../../../src/api/b2b/testData";
import { saveApiResponse } from "../../../src/api/saveApiResponse";
import {
  buildBranchData,
  buildBusinessClientData,
  buildBusinessRequestData,
} from "../../../src/api/b2b/testData";
import {
  createBusinessClient,
  createBranch,
  getFirstCollectable,
  getFirstFreshProduct,
} from "./helpers";

test.describe(
  "B2B GraphQL API",
  { tag: ["@api", "@b2b", "@regression"] },
  () => {
    // Each test provisi  ons its own prerequisites through the helpers, so the
    // tests are independent and can run in any order or individually.

    test("create business client", async ({ api }) => {
      const brands = await api.b2b.getBrandTypes();
      expect(brands.errors).toBeUndefined();

      const brandTypeId = brands.data?.getBrandTypesB2bForm?.[0]?.id;
      expect(brandTypeId, "No brand types returned from getBrandTypesB2bForm").toBeTruthy();

      const data = buildBusinessClientData({ brand_type_id: brandTypeId! });
      const response = await api.b2b.createBusinessClient(data);
      expect(response.errors).toBeUndefined();

      const businessClient = response.data?.createBusinessClientB2bForm;
      expect(businessClient?.id, "No business client id returned").toBeTruthy();

      const filePath = saveApiResponse("createBusinessClient", response);
      console.log(`Saved business client response to ${filePath}`);
    });

    test("get collectables", async ({ api }) => {
      const response = await api.b2b.getCollectables();
      expect(response.errors).toBeUndefined();

      const collectables = response.data?.getCollectables;
      expect(collectables?.length, "No collectables returned from getCollectables").toBeTruthy();

      const first = collectables![0];
      expect(first.id, "First collectable has no id").toBeTruthy();
      expect(
        first.measures?.[0]?.id,
        "First collectable has no measures"
      ).toBeTruthy();

      const filePath = saveApiResponse("getCollectables", response);
      console.log(`Saved get collectables response to ${filePath}`);
    });

    test("create branch", async ({ api }) => {
      const businessClientId = await createBusinessClient(api);
      const { collectableId } = await getFirstCollectable(api);

      const data = buildBranchData({
        business_client_id: businessClientId,
        collectable_id: collectableId,
        sell_fresh_products: true,
      });
      const response = await api.b2b.createBranch(data);

      expect(response.errors).toBeUndefined();
      const branch = response.data?.createBranchB2bForm;
      expect(branch?.id).toBeTruthy();
      // Backend normalizes the phone by stripping the leading zero.
      expect(branch?.phone).toBe(data.phone.replace(/^0/, ""));
      expect(branch?.sell_fresh_products).toBe(data.sell_fresh_products);

      const filePath = saveApiResponse("createBranch", response);
      console.log(`Saved create branch response to ${filePath}`);
    });

    test("get branch fresh products", async ({ api }) => {
      const businessClientId = await createBusinessClient(api);
      const { collectableId } = await getFirstCollectable(api);
      const branchId = await createBranch(api, businessClientId, collectableId);

      const response = await api.b2b.getBranchFreshProducts(branchId);

      // Surface the real server error (data is null whenever errors exist).
      expect(
        response.errors,
        `getBranchFreshProductsWebform returned errors: ${JSON.stringify(response.errors)}`
      ).toBeUndefined();

      const freshProducts = response.data?.getBranchFreshProductsWebform;
      expect(
        freshProducts?.length,
        "No fresh products returned from getBranchFreshProductsWebform"
      ).toBeTruthy();

      const filePath = saveApiResponse("getBranchFreshProducts", response);
      console.log(`Saved get branch fresh products response to ${filePath}`);
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

    test("create business request", { tag: "@b2b_request" }, async ({ api }) => {
      const businessClientId = await createBusinessClient(api);
      const { collectableId, measureId } = await getFirstCollectable(api);
      const branchId = await createBranch(api, businessClientId, collectableId);
      const freshProduct = await getFirstFreshProduct(api, branchId);

      const data = buildBusinessRequestData({
        branch_id: branchId,
        collectable_id: collectableId,
        measure_id: measureId,
        fresh_product_id: freshProduct.id,
        count: 2,
        quantity: 1,
      });

      const response = await api.b2b.createBusinessRequest(data);

      // Surface the real server error (data is null whenever errors exist).
      expect(
        response.errors,
        `createBusinessRequestB2bFormV2 returned errors: ${JSON.stringify(response.errors)}`
      ).toBeUndefined();

      const businessRequest = response.data?.createBusinessRequestB2bFormV2;
      expect(businessRequest?.id, "No business request id returned").toBeTruthy();

      const filePath = saveApiResponse("createBusinessRequest", response);
      console.log(`Saved create business request response to ${filePath}`);
    });
  }
);
