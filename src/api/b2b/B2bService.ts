import type { GraphQLClient, GraphQLResponse } from "../GraphQLClient";
import { CREATE_BRANCH, CREATE_BUSINESS_CLIENT } from "./graphql/mutations";
import { GET_BRAND_TYPES_B2B_FORM } from "./graphql/queries";

export type BrandType = {
  id: string;
  name: string;
};

export type CreateBusinessClientData = {
  business_client_ar_name: string;
  business_client_en_name: string;
  brand_type_id: string;
};

export type CreateBranchData = {
  business_client_id: string | number;
  branch_collectables: { collectable_id: string | number; price: number };
  latitude: string;
  longitude: string;
  phone: string;
  payment_type: string;
};

export class B2bService {
  constructor(private readonly client: GraphQLClient) {}

  getBrandTypes() {
    return this.client.request<{
      getBrandTypesB2bForm: BrandType[];
    }>(GET_BRAND_TYPES_B2B_FORM);
  }

  createBusinessClient(data: CreateBusinessClientData) {
    return this.client.request<{
      createBusinessClientB2bForm: {
        id: string;
        name: string;
        status: string;
        brandType: BrandType | null;
      };
    }>(CREATE_BUSINESS_CLIENT, data);
  }

  createBranch(data: CreateBranchData) {
    return this.client.request<{
      createBranch: {
        id: string;
        name: string | null;
        phone: string | null;
        payment_type: string | null;
        latitude: string | null;
        longitude: string | null;
        status: string | null;
      };
    }>(CREATE_BRANCH, data);
  }
}

export type { GraphQLResponse };
