import { expect } from "../../../src/fixtures/apiFixture";
import type { ApiManager } from "../../../src/api/ApiManager";
import {
  buildBranchData,
  buildBusinessClientData,
} from "../../../src/api/b2b/testData";

/**
 * Reusable B2B setup steps so each test can provision its own prerequisites
 * and stay fully independent (runnable in any order or individually).
 */

export async function createBusinessClient(api: ApiManager): Promise<string> {
  const brands = await api.b2b.getBrandTypes();
  expect(brands.errors).toBeUndefined();

  const brandTypeId = brands.data?.getBrandTypesB2bForm?.[0]?.id;
  expect(brandTypeId, "No brand types returned from getBrandTypesB2bForm").toBeTruthy();

  const response = await api.b2b.createBusinessClient(
    buildBusinessClientData({ brand_type_id: brandTypeId! })
  );
  expect(response.errors).toBeUndefined();

  const businessClientId = response.data?.createBusinessClientB2bForm?.id;
  expect(businessClientId, "No business client id returned").toBeTruthy();

  return businessClientId!;
}

export async function getFirstCollectable(
  api: ApiManager
): Promise<{ collectableId: string; measureId: string }> {
  const response = await api.b2b.getCollectables();
  expect(response.errors).toBeUndefined();

  const collectable = response.data?.getCollectables?.[0];
  expect(collectable?.id, "No collectables returned from getCollectables").toBeTruthy();

  const measureId = collectable?.measures?.[0]?.id;
  expect(measureId, "No measures returned for the first collectable").toBeTruthy();

  return { collectableId: collectable!.id, measureId: measureId! };
}

export async function createBranch(
  api: ApiManager,
  businessClientId: string,
  collectableId: string
): Promise<string> {
  const response = await api.b2b.createBranch(
    buildBranchData({
      business_client_id: businessClientId,
      collectable_id: collectableId,
      sell_fresh_products: true,
    })
  );
  expect(response.errors).toBeUndefined();

  const branchId = response.data?.createBranchB2bForm?.id;
  expect(branchId, "No branch id returned").toBeTruthy();

  return branchId!;
}

export async function getFirstFreshProduct(
  api: ApiManager,
  branchId: string
): Promise<{ id: string }> {
  const response = await api.b2b.getBranchFreshProducts(branchId);
  expect(
    response.errors,
    `getBranchFreshProductsWebform returned errors: ${JSON.stringify(response.errors)}`
  ).toBeUndefined();

  const freshProducts = response.data?.getBranchFreshProductsWebform;
  expect(
    freshProducts?.length,
    "No fresh products returned from getBranchFreshProductsWebform"
  ).toBeTruthy();

  return freshProducts![0];
}
