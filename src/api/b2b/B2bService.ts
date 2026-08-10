import { GraphQLClient, GraphQLResponse } from "../GraphQLClient";
import {
  CREATE_BRANCH,
  CREATE_BUSINESS_CLIENT,
  CREATE_BUSINESS_REQUEST_V2,
} from "./graphql/mutations";
import {
  GET_BRAND_TYPES_B2B_FORM,
  GET_BRANCH_FRESH_PRODUCTS_WEBFORM,
  GET_COLLECTABLES,
} from "./graphql/queries";
import { Channel, CountryCode } from "../enums";

export type BrandType = {
  id: string;
  name: string; 
};

export type CollectableMeasure = {
  id: string;
  name_ar: string | null;
  name_de: string | null;
  name_en: string | null;
};

export type Collectable = {
  id: string;
  name_ar: string | null;
  name_en: string | null;
  name_de: string | null;
  image: string | null;
  flow: string | null;
  is_primary: boolean | null;
  total_count: number | null;
  remaining_count: number | null;
  consumed_count: number | null;
  measures: CollectableMeasure[] | null;
};

export type FreshProduct = {
  id: string;
  name: string | null;
  size: string | null;
  selling_price: number | null;
  warehouse_stock: number | null;
  min_qty_per_order: number | null;
};

export type CreateBusinessClientData = {
  business_client_ar_name: string;
  business_client_en_name: string;
  brand_type_id: string;
};

export type CreateBranchData = {
  business_client_id: string | number;
  branch_collectables: Array<{ collectable_id: string | number; price: number }>;
  latitude: string;
  longitude: string;
  phone: string;
  payment_type: string;
  sell_fresh_products: boolean;
};

export type CollectableRequestInput = {
  id: string | number;
  measure_id: string | number;
  count: number;
  price?: number;
};

export type FreshProductRequestInput = {
  fresh_product_id: string | number;
  quantity: number;
};

export type DateTimeObjectInput = {
  date: string;
  time: string;
};

export type CreateBusinessRequestData = {
  branch_id: string | number;
  collectables: CollectableRequestInput[];
  fresh_products: FreshProductRequestInput[];
  day_const: string;
  date_time: DateTimeObjectInput;
  notes: string;
};

export type BusinessRequestFreshProduct = {
  id: string;
  quantity: number | null;
  freshProduct: { id: string; name: string | null } | null;
};

export class B2bService {
  constructor(private readonly client: GraphQLClient) {}

  getBrandTypes() {
    return this.client.request<{
      getBrandTypesB2bForm: BrandType[];
    }>(GET_BRAND_TYPES_B2B_FORM);
  }

  getCollectables(
    channels: Channel[] = [Channel.B2B],
    countryCode: CountryCode = CountryCode.EG
  ) {
    return this.client.request<{
      getCollectables: Collectable[];
    }>(GET_COLLECTABLES, { channels, country_code: countryCode });
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

  getBranchFreshProducts(branchId: string | number) {
    return this.client.request<{
      getBranchFreshProductsWebform: FreshProduct[];
    }>(GET_BRANCH_FRESH_PRODUCTS_WEBFORM, { branch_id: branchId });
  }

  createBranch(data: CreateBranchData) {
    return this.client.request<{
      createBranchB2bForm: {
        id: string;
        name: string | null;
        phone: string | null;
        payment_type: string | null;
        latitude: string | null;
        longitude: string | null;
        status: string | null;
        sell_fresh_products: boolean | null;
      };
    }>(CREATE_BRANCH, data);
  }

  createBusinessRequest(data: CreateBusinessRequestData) {
    return this.client.request<{
      createBusinessRequestB2bFormV2: {
        id: string;
        status: string | null;
        collection_date: string | null;
        notes: string | null;
        net_uco_quantity: number | null;
        created_at: string | null;
        collection_time: string | null;
        currency: string | null;
        compensation: number | null;
        selling_total: number | null;
        net_compensation: number | null;
        flow_type: string | null;
        requestFreshProducts: BusinessRequestFreshProduct[] | null;
      };
    }>(CREATE_BUSINESS_REQUEST_V2, data);
  }
}

export type { GraphQLResponse };
export { Channel, CountryCode };
