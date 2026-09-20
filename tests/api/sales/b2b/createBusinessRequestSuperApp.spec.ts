import { validBusinessRequestVariables } from "../../../../src/api/sales/testData";
import { saveApiResponse } from "../../../../src/api/saveApiResponse";
import { expect, test } from "../../../../src/fixtures/apiFixture";

test.describe(
  "CreateBusinessRequestSuperApp",
  { tag: ["@api", "@b2b", "@valid", "@create-business-request-super-app"] },
  () => {
    test.describe.configure({ timeout: 180_000 });

    test(
      "Create Business Request SuperApp - Valid",
      { tag: ["@b2b request supperapp"] },
      async ({ salesAppEgyptApi }) => {
        const branchId = "387925812";
        const variables = validBusinessRequestVariables(branchId);

        const response = await salesAppEgyptApi.sales.createBusinessRequestSuperApp(variables);

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
  },
);
