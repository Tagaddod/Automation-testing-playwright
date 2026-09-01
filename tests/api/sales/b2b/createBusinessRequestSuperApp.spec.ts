import { validBusinessRequestVariables } from "../../../../src/api/sales/testData";
import { saveApiResponse } from "../../../../src/api/saveApiResponse";
import { expect, test } from "../../../../src/fixtures/apiFixture";

test.describe("CreateBusinessRequestSuperApp", () => {
  test.describe.configure({ timeout: 180_000 });

  test(
    "Create Business Request SuperApp - Valid",
    { tag: ["@all-regression", "@sales-app-regression", "@create-b2b-request"] },
    async ({ salesAppEgyptApi }) => {
      // const branchVariables = validBranchVariables();

      // const responsebranch = await salesAppEgyptApi.sales.createBranch(branchVariables);
      const branchId = "387925296";
      const businessRequestVariables = validBusinessRequestVariables(branchId);
      const response =
        await salesAppEgyptApi.sales.createBusinessRequestSuperApp(businessRequestVariables);
      expect(
        response.errors,
        "createBusinessRequestSuperApp should succeed without GraphQL errors.",
      ).toBeUndefined();

      const created = response.data?.createBusinessRequestSuperApp;
      expect(created, "createBusinessRequestSuperApp should return a request.").toBeDefined();
      expect(created?.id, "A valid Business Request ID should be returned.").toBeTruthy();

      saveApiResponse("businessRequestId", {
        businessRequestId: created!.id,
      });
    },
  );
});
