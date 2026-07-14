import { test, expect } from "../../../src/fixtures/apiFixture";
import { saveApiResponse } from "../../../src/api/saveApiResponse";
import {
  buildBranchData,
  buildBusinessClientData,
} from "../../../src/api/b2b/testData";

test.describe("B2B GraphQL API @api @b2b @create business client", () => {
  test("create business client", async ({ api }) => {
    const brands = await api.b2b.getBrandTypes();
    expect(brands.errors).toBeUndefined();

    const brandTypeId = brands.data?.getBrandTypesB2bForm?.[0]?.id;
    expect(brandTypeId, "No brand types returned from getBrandTypesB2bForm").toBeTruthy();

    const data = buildBusinessClientData({ brand_type_id: brandTypeId! });
    const response = await api.b2b.createBusinessClient(data);

    expect(response.errors).toBeUndefined();

    const businessClient = response.data?.createBusinessClientB2bForm;
    expect(businessClient?.id).toBeTruthy();
    expect(businessClient?.brandType?.id).toBe(brandTypeId);

    const filePath = saveApiResponse("createBusinessClient", response);
    console.log(`Saved business client response to ${filePath}`);
  });

  test("create branch", async ({ api }) => {
    const businessClientId = process.env.BUSINESS_CLIENT_ID;
    const collectableId = process.env.COLLECTABLE_ID;
    test.skip(
      !businessClientId || !collectableId,
      "Set BUSINESS_CLIENT_ID and COLLECTABLE_ID"
    );

    const data = buildBranchData({
      business_client_id: businessClientId!,
      collectable_id: collectableId!,
    });
    const response = await api.b2b.createBranch(data);

    expect(response.errors).toBeUndefined();
    expect(response.data?.createBranch.id).toBeTruthy();
    expect(response.data?.createBranch.phone).toBe(data.phone);
  });
});
