import {
  validBranchVariables,
  validBusinessRequestVariables,
  validJordanBranchVariables,
  validJordanBusinessRequestVariables,
  validSaudiBranchVariables,
  validSaudiBusinessRequestVariables,
  validSignContractVariables,
} from "../../../../src/api/sales/testData";
import { saveApiResponse } from "../../../../src/api/saveApiResponse";
import { expect, test } from "../../../../src/fixtures/apiFixture";

test.describe("CreateBusinessRequestSuperApp", { tag: ["@sales-app-regression"] }, () => {
  test.describe.configure({ timeout: 180_000 });

  test(
    "Create Business Request SuperApp - Valid",
    {
      tag: [
        "@all-regression",
        "@sales-app-regression",
        "@create-b2b-request",
        "@create-b2b-request-API",
      ],
    },
    async ({ salesAppEgyptApi }) => {
      // A fresh branch avoids "Branch has already an active request"; the backend
      // also rejects the request unless that branch has a signed contract.
      const branchResponse = await salesAppEgyptApi.sales.createBranch(validBranchVariables());
      expect(
        branchResponse.errors,
        "Branch creation should succeed without GraphQL errors.",
      ).toBeUndefined();

      const branchId = branchResponse.data?.createBranch?.id;
      expect(branchId, "A valid Branch ID should be returned.").toBeTruthy();

      const signResponse = await salesAppEgyptApi.sales.signContractSuperApp(
        validSignContractVariables(branchId!),
      );
      expect(
        signResponse.errors,
        "The contract should be signed without GraphQL errors.",
      ).toBeUndefined();

      const businessRequestVariables = validBusinessRequestVariables(branchId!);
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

  test(
    "Create Business Request SuperApp - Valid Saudi",
    { tag: ["@all-regression", "@sales-app-regression", "@create-b2b-request"] },
    async ({ salesAppSaudiApi }) => {
      const branchResponse = await salesAppSaudiApi.sales.createBranch(validSaudiBranchVariables());
      expect(
        branchResponse.errors,
        "Saudi branch creation should succeed without GraphQL errors.",
      ).toBeUndefined();

      const branchId = branchResponse.data?.createBranch?.id;
      expect(branchId, "A valid Saudi Branch ID should be returned.").toBeTruthy();

      const signResponse = await salesAppSaudiApi.sales.signContractSuperApp(
        validSignContractVariables(branchId!),
      );
      expect(
        signResponse.errors,
        "The Saudi contract should be signed without GraphQL errors.",
      ).toBeUndefined();

      const response = await salesAppSaudiApi.sales.createBusinessRequestSuperApp(
        validSaudiBusinessRequestVariables(branchId!),
      );
      expect(
        response.errors,
        "createBusinessRequestSuperApp (Saudi) should succeed without GraphQL errors.",
      ).toBeUndefined();

      const created = response.data?.createBusinessRequestSuperApp;
      expect(created?.id, "A valid Saudi Business Request ID should be returned.").toBeTruthy();

      saveApiResponse("businessRequestIdSaudi", {
        businessRequestId: created!.id,
      });
    },
  );

  test(
    "Create Business Request SuperApp - Valid Jordan",
    { tag: ["@all-regression", "@sales-app-regression", "@create-b2b-request"] },
    async ({ salesAppJordanApi }) => {
      const branchResponse = await salesAppJordanApi.sales.createBranch(
        validJordanBranchVariables(),
      );
      expect(
        branchResponse.errors,
        "Jordan branch creation should succeed without GraphQL errors.",
      ).toBeUndefined();

      const branchId = branchResponse.data?.createBranch?.id;
      expect(branchId, "A valid Jordan Branch ID should be returned.").toBeTruthy();

      const signResponse = await salesAppJordanApi.sales.signContractSuperApp(
        validSignContractVariables(branchId!),
      );
      expect(
        signResponse.errors,
        "The Jordan contract should be signed without GraphQL errors.",
      ).toBeUndefined();

      const response = await salesAppJordanApi.sales.createBusinessRequestSuperApp(
        validJordanBusinessRequestVariables(branchId!),
      );
      expect(
        response.errors,
        "createBusinessRequestSuperApp (Jordan) should succeed without GraphQL errors.",
      ).toBeUndefined();

      const created = response.data?.createBusinessRequestSuperApp;
      expect(created?.id, "A valid Jordan Business Request ID should be returned.").toBeTruthy();

      saveApiResponse("businessRequestIdJordan", {
        businessRequestId: created!.id,
      });
    },
  );
});
