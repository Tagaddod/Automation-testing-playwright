import { ApiManager } from "../api/ApiManager";
import { GraphQLClient } from "../api/GraphQLClient";
import { validSignContractVariables } from "../api/sales/testData";
import { type AuthProfile, getAuthToken } from "./authApi";

/**
 * Fresh B2B webform branches reject createBusinessRequest with CONTRACT_MISSING
 * until a service contract is signed. Sales SuperApp is the mutation the backend
 * uses for that; admin is a fallback when sales credentials are missing.
 */
export async function signBranchServiceContract(branchId: string) {
  const profiles: AuthProfile[] = ["sales-app-egypt", "admin"];
  let lastError: unknown;

  for (const profile of profiles) {
    try {
      const token = await getAuthToken(profile);
      const client = await GraphQLClient.create(token);
      const api = new ApiManager(client);
      try {
        const response = await api.sales.signContractSuperApp(validSignContractVariables(branchId));
        const alreadySigned = (response.errors ?? []).some((error) =>
          /already|signed|exists/i.test(error.message),
        );
        if (!response.errors?.length || alreadySigned) {
          return;
        }
        lastError = new Error(`${profile}: ${JSON.stringify(response.errors)}`);
      } finally {
        await api.dispose();
      }
    } catch (error) {
      lastError = error;
    }
  }

  throw new Error(`Could not sign a service contract for branch ${branchId}. ${String(lastError)}`);
}
