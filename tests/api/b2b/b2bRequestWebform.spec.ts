import {
  buildBranchData,
  buildBusinessClientData,
  buildBusinessRequestData,
  buildJordanBranchData,
  buildSaudiBranchData,
} from "../../../src/api/b2b/testData";
import { CountryCode } from "../../../src/api/enums";
import { saveApiResponse } from "../../../src/api/saveApiResponse";
import { expect, test } from "../../../src/fixtures/apiFixture";
import {
  createBranch,
  createBusinessClient,
  getFirstCollectable,
  getFirstFreshProduct,
} from "./helpers";

test.describe("B2B GraphQL API", { tag: ["@webform-API-regression"] }, () => {
  /**
   * Each test creates its own prerequisites through helpers
   * so tests remain independent and can run individually.
   */

  test(
    "create business client",
    { tag: ["@all-regression", "@webform-API-regression"] },
    async ({ api }) => {
      // 1. Get available brand types
      const brands = await api.b2b.getBrandTypes();

      expect(
        brands.errors,
        "The brand-types response should not contain GraphQL errors.",
      ).toBeUndefined();

      const brandTypes = brands.data?.getBrandTypesB2bForm;

      expect(
        brandTypes,
        "The brand-types response should contain a brand-types array.",
      ).toBeDefined();

      expect(
        brandTypes?.length,
        "The backend should return at least one brand type.",
      ).toBeGreaterThan(0);

      // 2. Get the first brand type ID
      const brandTypeId = brandTypes?.[0]?.id;

      expect(brandTypeId, "The first returned brand type should have a valid ID.").toBeTruthy();

      // 3. Build request payload
      const data = buildBusinessClientData({
        brand_type_id: brandTypeId!,
      });

      // 4. Create business client
      const response = await api.b2b.createBusinessClient(data);

      expect(response, "The create-business-client API should return a response.").toBeDefined();

      expect(
        response.errors,
        "The create-business-client response should not contain GraphQL errors.",
      ).toBeUndefined();

      expect(
        response.data,
        "The create-business-client response should contain data.",
      ).toBeDefined();

      // 5. Validate created business client
      const businessClient = response.data?.createBusinessClientB2bForm;

      expect(
        businessClient,
        "The response should contain the created business client.",
      ).toBeDefined();

      expect(
        businessClient?.id,
        "The created business client should have a valid ID.",
      ).toBeTruthy();

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

      // 6. Save API response
      const filePath = saveApiResponse("createBusinessClient", response);

      console.log(`Saved business client response to ${filePath}`);
    },
  );

  test(
    "get collectables",
    { tag: ["@all-regression", "@webform-API-regression"] },
    async ({ api }) => {
      // 1. Get collectables
      const response = await api.b2b.getCollectables();

      expect(
        response.errors,
        "The collectables response should not contain GraphQL errors.",
      ).toBeUndefined();

      const collectables = response.data?.getCollectables;

      // 2. Validate collectables
      expect(collectables?.length, "No collectables returned from getCollectables.").toBeTruthy();

      const firstCollectable = collectables![0];

      expect(firstCollectable.id, "The first collectable should have a valid ID.").toBeTruthy();

      expect(
        firstCollectable.measures?.[0]?.id,
        "The first collectable should have at least one measure.",
      ).toBeTruthy();

      // 3. Save response
      const filePath = saveApiResponse("getCollectables", response);

      console.log(`Saved get collectables response to ${filePath}`);
    },
  );

  test(
    "create branch",
    { tag: ["@all-regression", "@webform-API-regression"] },
    async ({ api }) => {
      // 1. Create business client
      const businessClientId = await createBusinessClient(api);

      // 2. Get collectable
      const { collectableId } = await getFirstCollectable(api);

      // 3. Build branch payload
      const data = buildBranchData({
        business_client_id: businessClientId,
        collectable_id: collectableId,
        sell_fresh_products: true,
      });

      // 4. Create branch
      const response = await api.b2b.createBranch(data);

      expect(
        response.errors,
        "The create-branch response should not contain GraphQL errors.",
      ).toBeUndefined();

      const branch = response.data?.createBranchB2bForm;

      // 5. Validate branch
      expect(branch?.id, "The created branch should have a valid ID.").toBeTruthy();

      // Backend removes the leading zero from the phone number.
      expect(branch?.phone).toBe(data.phone.replace(/^0/, ""));

      expect(branch?.sell_fresh_products).toBe(data.sell_fresh_products);

      // 6. Save response
      const filePath = saveApiResponse("createBranch", response);

      console.log(`Saved create branch response to ${filePath}`);
    },
  );

  test(
    "create branch with Saudi phone and coordinates",
    { tag: ["@all-regression", "@webform-API-regression"] },
    async ({ api }) => {
      const businessClientId = await createBusinessClient(api);
      const { collectableId } = await getFirstCollectable(api, CountryCode.SA);
      const data = buildSaudiBranchData({
        business_client_id: businessClientId,
        collectable_id: collectableId,
        sell_fresh_products: true,
      });

      const response = await api.b2b.createBranch(data);

      expect(
        response.errors,
        `createBranchB2bForm (Saudi) returned errors: ${JSON.stringify(response.errors)}`,
      ).toBeUndefined();

      const branch = response.data?.createBranchB2bForm;
      expect(branch?.id, "The Saudi branch should have a valid ID.").toBeTruthy();
      expect(branch?.phone).toBe(data.phone.replace(/^0/, ""));
      expect(branch?.latitude).toBe(data.latitude);
      expect(branch?.longitude).toBe(data.longitude);

      const filePath = saveApiResponse("createBranchSaudi", response);
      console.log(`Saved Saudi create branch response to ${filePath}`);
    },
  );

  test(
    "create branch with Jordan phone and coordinates",
    { tag: ["@all-regression", "@webform-API-regression"] },
    async ({ api }) => {
      const businessClientId = await createBusinessClient(api);
      const { collectableId } = await getFirstCollectable(api, CountryCode.JO);
      const data = buildJordanBranchData({
        business_client_id: businessClientId,
        collectable_id: collectableId,
        sell_fresh_products: true,
      });

      const response = await api.b2b.createBranch(data);

      expect(
        response.errors,
        `createBranchB2bForm (Jordan) phone=${data.phone} returned errors: ${JSON.stringify(response.errors)}`,
      ).toBeUndefined();

      const branch = response.data?.createBranchB2bForm;
      expect(branch?.id, "The Jordan branch should have a valid ID.").toBeTruthy();
      expect(branch?.phone).toBe(data.phone.replace(/^0/, ""));
      expect(branch?.latitude).toBe(data.latitude);
      expect(branch?.longitude).toBe(data.longitude);

      const filePath = saveApiResponse("createBranchJordan", response);
      console.log(`Saved Jordan create branch response to ${filePath}`);
    },
  );

  test(
    "get branch fresh products",
    { tag: ["@all-regression", "@webform-API-regression"] },
    async ({ api }) => {
      // 1. Create prerequisites
      const businessClientId = await createBusinessClient(api);

      const { collectableId } = await getFirstCollectable(api);

      // 2. Create branch
      const branchId = await createBranch(api, businessClientId, collectableId);

      // 3. Get branch fresh products
      const response = await api.b2b.getBranchFreshProducts(branchId);

      expect(
        response.errors,
        `getBranchFreshProductsWebform returned errors: ${JSON.stringify(response.errors)}`,
      ).toBeUndefined();

      const freshProducts = response.data?.getBranchFreshProductsWebform;

      // 4. Validate response
      expect(
        freshProducts?.length,
        "No fresh products returned from getBranchFreshProductsWebform.",
      ).toBeTruthy();

      // 5. Save response
      const filePath = saveApiResponse("getBranchFreshProducts", response);

      console.log(`Saved get branch fresh products response to ${filePath}`);
    },
  );

  test(
    "create business request webform",
    {
      tag: [
        "@all-regression",
        "@webform-API-regression",
        "@create-b2b-request",
        "@create-b2b-request-API",
      ],
    },
    async ({ api }) => {
      const businessClientId = await createBusinessClient(api);
      const { collectableId, measureId } = await getFirstCollectable(api);
      const branchId = await createBranch(api, businessClientId, collectableId);
      const freshProduct = await getFirstFreshProduct(api, branchId);

      const data = buildBusinessRequestData({
        branch_id: branchId,
        collectable_id: collectableId,
        measure_id: measureId,
        fresh_product_id: freshProduct.id,
        count: 1000,
        quantity: 1,
      });

      const response = await api.b2b.createBusinessRequest(data);

      expect(
        response.errors,
        `createBusinessRequestB2bFormV2 returned errors: ${JSON.stringify(response.errors)}`,
      ).toBeUndefined();

      const businessRequest = response.data?.createBusinessRequestB2bFormV2;
      expect(businessRequest?.id, "No business request ID returned.").toBeTruthy();

      const filePath = saveApiResponse("createBusinessRequest", response);
      console.warn(`Saved create business request response to ${filePath}`);
    },
  );

  test(
    "create business request webform with Saudi branch",
    { tag: ["@all-regression", "@webform-API-regression", "@create-b2b-request"] },
    async ({ api }) => {
      const businessClientId = await createBusinessClient(api);
      const { collectableId, measureId } = await getFirstCollectable(api, CountryCode.SA);
      const branchResponse = await api.b2b.createBranch(
        buildSaudiBranchData({
          business_client_id: businessClientId,
          collectable_id: collectableId,
          sell_fresh_products: false,
        }),
      );
      expect(
        branchResponse.errors,
        `createBranchB2bForm (Saudi) returned errors: ${JSON.stringify(branchResponse.errors)}`,
      ).toBeUndefined();
      const branchId = branchResponse.data?.createBranchB2bForm?.id;
      expect(branchId, "No Saudi branch id returned.").toBeTruthy();

      const data = buildBusinessRequestData({
        branch_id: branchId!,
        collectable_id: collectableId,
        measure_id: measureId,
        count: 2,
      });
      const response = await api.b2b.createBusinessRequest(data);

      expect(
        response.errors,
        `createBusinessRequestB2bFormV2 (Saudi) returned errors: ${JSON.stringify(response.errors)}`,
      ).toBeUndefined();
      expect(
        response.data?.createBusinessRequestB2bFormV2?.id,
        "No Saudi business request ID returned.",
      ).toBeTruthy();

      const filePath = saveApiResponse("createBusinessRequestSaudi", response);
      console.log(`Saved Saudi create business request response to ${filePath}`);
    },
  );

  test(
    "create business request webform with Jordan branch",
    { tag: ["@all-regression", "@webform-API-regression", "@create-b2b-request"] },
    async ({ api }) => {
      const businessClientId = await createBusinessClient(api);
      const { collectableId, measureId } = await getFirstCollectable(api, CountryCode.JO);
      const branchResponse = await api.b2b.createBranch(
        buildJordanBranchData({
          business_client_id: businessClientId,
          collectable_id: collectableId,
          sell_fresh_products: false,
        }),
      );
      expect(
        branchResponse.errors,
        `createBranchB2bForm (Jordan) returned errors: ${JSON.stringify(branchResponse.errors)}`,
      ).toBeUndefined();
      const branchId = branchResponse.data?.createBranchB2bForm?.id;
      expect(branchId, "No Jordan branch id returned.").toBeTruthy();

      const data = buildBusinessRequestData({
        branch_id: branchId!,
        collectable_id: collectableId,
        measure_id: measureId,
        count: 2,
      });
      const response = await api.b2b.createBusinessRequest(data);

      expect(
        response.errors,
        `createBusinessRequestB2bFormV2 (Jordan) returned errors: ${JSON.stringify(response.errors)}`,
      ).toBeUndefined();
      expect(
        response.data?.createBusinessRequestB2bFormV2?.id,
        "No Jordan business request ID returned.",
      ).toBeTruthy();

      const filePath = saveApiResponse("createBusinessRequestJordan", response);
      console.log(`Saved Jordan create business request response to ${filePath}`);
    },
  );
});
