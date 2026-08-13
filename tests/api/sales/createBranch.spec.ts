import {
  buildSalesBranchData,
  SALES_APP_EG_BUSINESS_CLIENT_ID,
} from "../../../src/api/sales/testData";
import { saveApiResponse } from "../../../src/api/saveApiResponse";
import { expect, test } from "../../../src/fixtures/apiFixture";

test.describe(
  "Sales App GraphQL API",
  { tag: ["@api", "@sales-app", "@create-branch", "@regression"] },
  () => {
    test.describe.configure({ timeout: 120_000 });

    test("create new branch for business client 103", async ({ salesAppEgyptApi }) => {
      const collectables = await salesAppEgyptApi.sales.getCollectables();
      expect(collectables.errors).toBeUndefined();

      const collectableId = collectables.data?.getCollectables?.[0]?.id;
      expect(collectableId, "No collectables returned from getCollectables").toBeTruthy();

      const data = buildSalesBranchData({
        business_client_id: SALES_APP_EG_BUSINESS_CLIENT_ID,
        collectable_id: collectableId!,
      });

      const response = await salesAppEgyptApi.sales.createBranch(data);

      expect(response.errors).toBeUndefined();
      expect(response.data?.createBranch).toBeDefined();
      expect(response.data?.createBranch.id).toBeTruthy();
      // API may normalize phone by dropping a leading 0
      expect(response.data?.createBranch.phone?.replace(/^0/, "")).toBe(
        data.phone.replace(/^0/, ""),
      );

      const filePath = saveApiResponse("salesCreateBranch", response);
      console.warn(`Saved sales createBranch response to ${filePath}`);
    });
  },
);
