import {
  BUSINESS_REQUEST_BATCH_COUNT,
  validBusinessRequestBatchVariables,
} from "../../../../src/api/sales/testData";
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
        const branchId = "387925296";
        const payloads = validBusinessRequestBatchVariables(branchId);
        const requestIds: string[] = [];

        for (const [index, businessRequestVariables] of payloads.entries()) {
          const response =
            await salesAppEgyptApi.sales.createBusinessRequestSuperApp(businessRequestVariables);

          expect(
            response.errors,
            `createBusinessRequestSuperApp ${index + 1}/${payloads.length} should succeed without GraphQL errors.`,
          ).toBeUndefined();

          const created = response.data?.createBusinessRequestSuperApp;
          expect(
            created,
            `createBusinessRequestSuperApp ${index + 1}/${payloads.length} should return a request.`,
          ).toBeDefined();
          expect(
            created?.id,
            `A valid Business Request ID should be returned for request ${index + 1}/${payloads.length}.`,
          ).toBeTruthy();

          requestIds.push(created!.id);
        }

        expect(
          requestIds,
          `${BUSINESS_REQUEST_BATCH_COUNT} business request IDs should be created.`,
        ).toHaveLength(BUSINESS_REQUEST_BATCH_COUNT);

        saveApiResponse("businessRequestId", {
          businessRequestId: requestIds[requestIds.length - 1],
          businessRequestIds: requestIds,
        });
      },
    );
  },
);
