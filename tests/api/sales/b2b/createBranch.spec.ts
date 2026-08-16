import {
  SALES_EGYPT_COUNTRY_CODE,
  SALES_JORDAN_COUNTRY_CODE,
  SALES_SAUDI_COUNTRY_CODE,
  validBranchVariables,
  validJordanBranchVariables,
  validSaudiBranchVariables,
  validViennaRecurringRequestVariables,
} from "../../../../src/api/sales/testData";
import { requireSavedBranchId, saveApiResponse } from "../../../../src/api/saveApiResponse";
import { expect, test } from "../../../../src/fixtures/apiFixture";

test.describe("Create Branch", { tag: ["@api", "@b2b", "@valid", "@create-branch"] }, () => {
  test.describe.configure({ timeout: 180_000 });

  test(
    "Create Branch with valid data - Valid",
    { tag: ["@b2b Create Branch supperapp"] },
    async ({ salesAppEgyptApi }) => {
      const variables = validBranchVariables();

      const response = await salesAppEgyptApi.sales.createBranch(variables);

      expect(
        response.errors,
        "Branch creation should succeed without GraphQL errors.",
      ).toBeUndefined();

      const branchId = response.data?.createBranch?.id;
      expect(
        branchId,
        "A valid Branch ID should be returned after creating the branch.",
      ).toBeTruthy();
      expect(
        response.data?.createBranch?.phone,
        "The created branch should include a phone number.",
      ).toBeTruthy();
      expect(
        response.data?.createBranch?.status,
        "The created branch should include a status.",
      ).toBeTruthy();
      expect(
        response.data?.createBranch?.country_code,
        "The branch country code should be +20.",
      ).toBe(SALES_EGYPT_COUNTRY_CODE);

      saveApiResponse("branchId", {
        branchId: branchId!,
        phone: variables.phone,
      });

      expect(requireSavedBranchId(), "The created Branch ID should be persisted for reuse.").toBe(
        branchId,
      );
    },
  );

  test(
    "Create Branch - Valid Saudi",
    { tag: ["@b2b Create Branch supperapp saudi"] },
    async ({ salesAppSaudiApi }) => {
      const variables = validSaudiBranchVariables();

      const response = await salesAppSaudiApi.sales.createBranch(variables);

      expect(
        response.errors,
        "Branch creation should succeed without GraphQL errors.",
      ).toBeUndefined();

      const branchId = response.data?.createBranch?.id;
      expect(
        branchId,
        "A valid Branch ID should be returned after creating the branch.",
      ).toBeTruthy();
      expect(
        response.data?.createBranch?.phone,
        "The created branch should include a phone number.",
      ).toBeTruthy();
      expect(
        response.data?.createBranch?.status,
        "The created branch should include a status.",
      ).toBeTruthy();
      expect(
        response.data?.createBranch?.country_code,
        "The branch country code should be +966.",
      ).toBe(SALES_SAUDI_COUNTRY_CODE);

      saveApiResponse("branchIdSaudi", {
        branchId: branchId!,
        phone: variables.phone,
      });
    },
  );

  test(
    "Create Branch - Valid Jordan",
    { tag: ["@b2b Create Branch supperapp jordan"] },
    async ({ salesAppJordanApi }) => {
      const variables = validJordanBranchVariables();

      const response = await salesAppJordanApi.sales.createBranch(variables);

      expect(
        response.errors,
        "Branch creation should succeed without GraphQL errors.",
      ).toBeUndefined();

      const branchId = response.data?.createBranch?.id;
      expect(
        branchId,
        "A valid Branch ID should be returned after creating the branch.",
      ).toBeTruthy();
      expect(
        response.data?.createBranch?.phone,
        "The created branch should include a phone number.",
      ).toBeTruthy();
      expect(
        response.data?.createBranch?.status,
        "The created branch should include a status.",
      ).toBeTruthy();
      expect(
        response.data?.createBranch?.country_code,
        "The branch country code should be +962.",
      ).toBe(SALES_JORDAN_COUNTRY_CODE);

      saveApiResponse("branchIdJordan", {
        branchId: branchId!,
        phone: variables.phone,
      });
    },
  );

  test(
    "Get Recurring Request Summary with valid data - Valid Vienna",
    { tag: ["@sales", "@recurring-request", "@sales recurring request vienna"] },
    async ({ salesAppViennaApi }) => {
      const variables = validViennaRecurringRequestVariables();

      const response = await salesAppViennaApi.sales.getRecurringRequestSummary(variables);

      expect(response.status ?? 200, "Successful request should return HTTP 200.").toBe(200);
      expect(response.errors, "Response should not contain GraphQL errors.").toBeUndefined();

      const summary = response.data?.getRecurringRequestSummary;
      expect(summary, "Recurring request summary should be returned.").toBeTruthy();
      expect(
        summary?.next_collection_date,
        "Next collection date should be returned.",
      ).toBeTruthy();

      const timeSlots = response.data?.getTimeSlots;
      expect(timeSlots, "Time slots should be returned.").toBeDefined();
      expect(timeSlots!, "Time slots array should not be empty.").not.toHaveLength(0);

      for (const slot of timeSlots!) {
        expect(slot, "Each time slot should include range.").toHaveProperty("range");
        expect(slot, "Each time slot should include period.").toHaveProperty("period");
        expect(slot, "Each time slot should include time.").toHaveProperty("time");
      }
    },
  );
});
