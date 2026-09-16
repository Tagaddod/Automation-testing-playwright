import {
  SIGNED_CONTRACT_STATUS,
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

test.describe("SignContractSuperApp", { tag: ["@sales-app-regression"] }, () => {
  test.describe.configure({ mode: "serial", timeout: 180_000 });

  test(
    "Sign Contract SuperApp with Valid data",
    { tag: ["@all-regression", "@sales-app-regression"] },
    async ({ salesAppEgyptApi }) => {
      const branchVariables = validBranchVariables();
      const branchResponse = await salesAppEgyptApi.sales.createBranch(branchVariables);

      expect(
        branchResponse.errors,
        "Branch creation should succeed without GraphQL errors.",
      ).toBeUndefined();

      const branchId = branchResponse.data?.createBranch?.id;
      expect(
        branchId,
        "A valid Branch ID should be returned after creating the branch.",
      ).toBeTruthy();

      const signVariables = validSignContractVariables(branchId!);
      expect(signVariables.branch_id, "Sign contract must use the created Branch ID.").toBe(
        branchId,
      );

      const signResponse = await salesAppEgyptApi.sales.signContractSuperApp(signVariables);

      expect(signResponse, "The signContractSuperApp API should return a response.").toBeDefined();
      expect(
        signResponse.errors,
        "The contract should be created successfully without GraphQL errors.",
      ).toBeUndefined();

      const signed = signResponse.data?.signContractSuperApp;
      expect(signed, "The API should return signContractSuperApp.").toBeDefined();
      expect(signed?.id, "The signed contract should return a valid contract ID.").toBeTruthy();
      expect(signed?.branch_id, "The signed contract should belong to the created branch.").toBe(
        branchId,
      );
      expect(signed?.status, "The contract should have an active status.").toBe(
        SIGNED_CONTRACT_STATUS,
      );
      expect(
        signed?.signature_path,
        "The signed contract should include a signature_path.",
      ).toBeTruthy();

      const businessRequestVariables = validBusinessRequestVariables(branchId!);
      expect(
        businessRequestVariables.branch_id,
        "Business request must use the same created Branch ID.",
      ).toBe(branchId);

      const businessResponse =
        await salesAppEgyptApi.sales.createBusinessRequestSuperApp(businessRequestVariables);

      expect(
        businessResponse.errors,
        "createBusinessRequestSuperApp should succeed without GraphQL errors.",
      ).toBeUndefined();

      const created = businessResponse.data?.createBusinessRequestSuperApp;
      expect(created, "createBusinessRequestSuperApp should return a request.").toBeDefined();
      expect(created?.id, "A valid Business Request ID should be returned.").toBeTruthy();
      expect(created?.status, "The business request should include a status.").toBeTruthy();

      saveApiResponse("businessRequestId", {
        businessRequestId: created!.id,
      });
    },
  );

  test(
    "Sign Contract SuperApp - Valid Saudi",
    { tag: ["@all-regression", "@sales-app-regression"] },
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

      const signed = signResponse.data?.signContractSuperApp;
      expect(
        signed?.id,
        "The signed Saudi contract should return a valid contract ID.",
      ).toBeTruthy();
      expect(
        signed?.branch_id,
        "The signed Saudi contract should belong to the created branch.",
      ).toBe(branchId);
      expect(signed?.status, "The Saudi contract should have an active status.").toBe(
        SIGNED_CONTRACT_STATUS,
      );

      const businessResponse = await salesAppSaudiApi.sales.createBusinessRequestSuperApp(
        validSaudiBusinessRequestVariables(branchId!),
      );
      expect(
        businessResponse.errors,
        "createBusinessRequestSuperApp (Saudi) should succeed without GraphQL errors.",
      ).toBeUndefined();
      expect(
        businessResponse.data?.createBusinessRequestSuperApp?.id,
        "A valid Saudi Business Request ID should be returned.",
      ).toBeTruthy();

      saveApiResponse("businessRequestIdSaudi", {
        businessRequestId: businessResponse.data!.createBusinessRequestSuperApp!.id,
      });
    },
  );

  test(
    "Sign Contract SuperApp - Valid Jordan",
    { tag: ["@all-regression", "@sales-app-regression"] },
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

      const signed = signResponse.data?.signContractSuperApp;
      expect(
        signed?.id,
        "The signed Jordan contract should return a valid contract ID.",
      ).toBeTruthy();
      expect(
        signed?.branch_id,
        "The signed Jordan contract should belong to the created branch.",
      ).toBe(branchId);
      expect(signed?.status, "The Jordan contract should have an active status.").toBe(
        SIGNED_CONTRACT_STATUS,
      );

      const businessResponse = await salesAppJordanApi.sales.createBusinessRequestSuperApp(
        validJordanBusinessRequestVariables(branchId!),
      );
      expect(
        businessResponse.errors,
        "createBusinessRequestSuperApp (Jordan) should succeed without GraphQL errors.",
      ).toBeUndefined();
      expect(
        businessResponse.data?.createBusinessRequestSuperApp?.id,
        "A valid Jordan Business Request ID should be returned.",
      ).toBeTruthy();

      saveApiResponse("businessRequestIdJordan", {
        businessRequestId: businessResponse.data!.createBusinessRequestSuperApp!.id,
      });
    },
  );
});
