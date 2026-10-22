import type { ApiManager } from "../../../src/api/ApiManager";
import { buildBranchData, buildBusinessClientData } from "../../../src/api/b2b/testData";
import { fetchFirstCollectableWithMeasure } from "../../../src/api/collectableHelpers";
import { Channel, CountryCode } from "../../../src/api/enums";
import { expect } from "../../../src/fixtures/apiFixture";

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
    buildBusinessClientData({ brand_type_id: brandTypeId! }),
  );
  expect(response.errors).toBeUndefined();

  const businessClientId = response.data?.createBusinessClientB2bForm?.id;
  expect(businessClientId, "No business client id returned").toBeTruthy();

  return businessClientId!;
}

export async function getFirstCollectable(
  api: ApiManager,
  countryCode: CountryCode = CountryCode.EG,
  channel: Channel.B2B | Channel.B2X = Channel.B2B,
): Promise<{ collectableId: string; measureId: string }> {
  try {
    return await fetchFirstCollectableWithMeasure(api, channel, countryCode);
  } catch (error) {
    expect(error, String(error)).toBeUndefined();
    throw error;
  }
}

export async function createBranch(
  api: ApiManager,
  businessClientId: string,
  collectableId: string,
): Promise<string> {
  const response = await api.b2b.createBranch(
    buildBranchData({
      business_client_id: businessClientId,
      collectable_id: collectableId,
      sell_fresh_products: true,
    }),
  );
  expect(response.errors).toBeUndefined();

  const branchId = response.data?.createBranchB2bForm?.id;
  expect(branchId, "No branch id returned").toBeTruthy();

  return branchId!;
}

export async function getFirstFreshProduct(
  api: ApiManager,
  branchId: string,
): Promise<{ id: string }> {
  const response = await api.b2b.getBranchFreshProducts(branchId);
  expect(
    response.errors,
    `getBranchFreshProductsWebform returned errors: ${JSON.stringify(response.errors)}`,
  ).toBeUndefined();

  const freshProducts = response.data?.getBranchFreshProductsWebform;
  expect(
    freshProducts?.length,
    "No fresh products returned from getBranchFreshProductsWebform",
  ).toBeTruthy();

  return freshProducts![0];
}
