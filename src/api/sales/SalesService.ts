import type { GraphQLClient, GraphQLResponse } from "../GraphQLClient";
import { CREATE_BRANCH } from "./graphql/mutations";
import { GET_COLLECTABLES } from "./graphql/queries";

export type Collectable = {
  id: string;
  name: string;
};

export type CreateSalesBranchData = {
  business_client_id: string | number;
  branch_collectables: Array<{ collectable_id: string | number; price: number }>;
  latitude: string;
  longitude: string;
  phone: string;
  payment_type: string;
};

export type CreateSalesBranchResult = {
  id: string;
  name: string | null;
  identification_card: string | null;
  phone: string | null;
  address: string | null;
  address_notes: string | null;
  payment_type: string | null;
  longitude: string | null;
  latitude: string | null;
  job_role: string | null;
  manager_name: string | null;
  sign_image: string | null;
  status: string | null;
  google_maps_id: string | null;
  country_code: string | null;
  is_seasonal: boolean | null;
  preferred_time: string | null;
};

/** Sales App GraphQL operations (phone-auth token). */
export class SalesService {
  constructor(private readonly client: GraphQLClient) {}

  getCollectables(channels: string[] = ["B2B"]) {
    return this.client.request<{
      getCollectables: Collectable[];
    }>(GET_COLLECTABLES, { channels });
  }

  createBranch(data: CreateSalesBranchData) {
    return this.client.request<{
      createBranch: CreateSalesBranchResult;
    }>(CREATE_BRANCH, data);
  }
}

export type { GraphQLResponse };
