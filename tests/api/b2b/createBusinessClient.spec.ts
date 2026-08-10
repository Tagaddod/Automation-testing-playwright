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

test.describe("B2B GraphQL API", { tag: ["@api", "@b2b", "@create business client"] }, () => {
  test("create business client", async ({ api }) => {
    const brands = await api.b2b.getBrandTypes();

    expect(brands.errors).toBeUndefined();

    const brandTypeId = brands.data?.getBrandTypesB2bForm?.[0]?.id;
    expect(brandTypeId, "No brand types returned from getBrandTypesB2bForm").toBeTruthy();
    const data = buildBusinessClientData({ brand_type_id: brandTypeId! });

    const response = await api.b2b.createBusinessClient(data);

    expect(response.errors).toBeUndefined();

    expect(response.data?.createBusinessClientB2bForm).toBeDefined();

    const filePath = saveApiResponse("createBusinessClient", response);

    console.warn(`Saved business client response to ${filePath}`);
  });

  test("create branch", async ({ api }) => {
    const businessClientId = process.env.BUSINESS_CLIENT_ID;
    const collectableId = process.env.COLLECTABLE_ID;
    test.skip(!businessClientId || !collectableId, "Set BUSINESS_CLIENT_ID and COLLECTABLE_ID");

    const data = buildBranchData({
      business_client_id: businessClientId!,
      collectable_id: collectableId!,
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
