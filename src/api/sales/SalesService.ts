import type { GraphQLClient } from "../GraphQLClient";
import {
  CREATE_BRANCH,
  CREATE_BUSINESS_REQUEST_SUPER_APP,
  CREATE_TRADER_REQUEST_SALES_AGENT,
  CREATE_TRADER_SUPER_APP,
  SIGN_CONTRACT_SUPER_APP,
  UPDATE_SALES_AGENT,
} from "./mutations";
import {
  GET_COLLECTABLES,
  GET_RECURRING_REQUEST_SUMMARY,
  GET_REQUESTS_TIME_SLOTS,
  GET_SELLER_COLLECTABLES_SALES_AGENT,
  MY_SALES_AGENT,
  SALES_AGENT_LATEST_VERSION,
} from "./queries";

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
  country_code?: string;
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

export type CreateTraderSuperAppData = {
  name: string;
  phone: string;
  vehicle_id: string;
  latitude: string;
  longitude: string;
  note: string;
  collectable_id: string;
  country_code: string;
};

export type CreateTraderSuperAppResult = {
  id: string;
  name: string;
  phone: string;
  country_code: string;
};

/** Variables for createTraderRequestSalesAgent (partial allowed for negative payloads). */
export type CreateTraderRequestSalesAgentData = {
  trader_id?: string;
  collectable_id?: string | number;
  measure_id?: string | number;
  count?: number;
  price?: number;
  collection_date: string;
};

export type CreateTraderRequestSalesAgentResult = {
  id: string;
  status: string;
};

export type CreateBusinessRequestSuperAppData = {
  branch_id: string;
  collectable_id: string | number;
  measure_id: string | number;
  count: number;
  price: number;
  collection_date: string;
  collection_time: string;
};

export type CreateBusinessRequestSuperAppResult = {
  id: string;
  status: string;
  collection_date: string | null;
  collection_time: string | null;
  created_at: string | null;
};

export type SignContractSuperAppData = {
  branch_id: string;
  signature: string;
};

export type SignContractSuperAppResult = {
  id: string;
  branch_id: string;
  status: string;
  signature_path: string | null;
  signed_at: string | null;
  effective_date: string | null;
  expiry_date: string | null;
  created_by: string | null;
};

export interface MySalesAgentResult {
  id: string;
  code: string;
  name: string;
  locale: string;
  identification_card: string | null;
  phone: string;
  tasksCount: number;
}

export interface MySalesAgentResponse {
  mySalesAgent: MySalesAgentResult;
}

export type SalesAgentLatestVersionResult = {
  id: string;
  type: string;
  version: string;
  minimum_supported_version: string;
};

export type SellerCollectableResult = {
  id: string;
  name_ar: string | null;
  name_en: string | null;
  name_de: string | null;
  image: string | null;
  seller_extra_data: unknown;
  flow: string | null;
  is_primary: boolean | null;
  total_count: number | null;
  remaining_count: number | null;
  consumed_count: number | null;
};

export type RequestTimeSlotResult = {
  range: string | null;
  period: string | null;
  time: string | null;
};

export type RecurringCollectionFrequency = "WEEKLY" | "BIWEEKLY" | "MONTHLY";

export type GetRecurringRequestSummaryData = {
  country_code: string;
  start_date: string;
  end_date?: string;
  collection_frequency: RecurringCollectionFrequency;
  frequency_day?: number;
  collection_time: string;
};

export type RecurringRequestSummaryResult = {
  next_collection_date: string;
};

export type GetRecurringRequestSummaryResult = {
  getRecurringRequestSummary: RecurringRequestSummaryResult;
  getTimeSlots: RequestTimeSlotResult[];
};

/** Variables for updateSalesAgent (partial allowed for negative payloads). */
export type UpdateSalesAgentData = {
  id?: string | number;
  locale?: string;
};

/** Sales App GraphQL operations (phone-auth token). */
export class SalesService {
  constructor(private readonly client: GraphQLClient) {}

  getCollectables(channels: string[] = ["B2B"]) {
    return this.client.execute<{
      getCollectables: Collectable[];
    }>(GET_COLLECTABLES, { channels });
  }

  createBranch(data: CreateSalesBranchData) {
    return this.client.execute<{
      createBranch: CreateSalesBranchResult;
    }>(CREATE_BRANCH, data);
  }

  createTraderSuperApp(data: CreateTraderSuperAppData) {
    return this.client.execute<{
      createTraderSuperApp: CreateTraderSuperAppResult;
    }>(CREATE_TRADER_SUPER_APP, data);
  }

  createTraderRequestSalesAgent(data: CreateTraderRequestSalesAgentData) {
    return this.client.execute<{
      createTraderRequestSalesAgent: CreateTraderRequestSalesAgentResult;
    }>(CREATE_TRADER_REQUEST_SALES_AGENT, data);
  }

  createBusinessRequestSuperApp(data: CreateBusinessRequestSuperAppData) {
    return this.client.execute<{
      createBusinessRequestSuperApp: CreateBusinessRequestSuperAppResult;
    }>(CREATE_BUSINESS_REQUEST_SUPER_APP, data);
  }

  signContractSuperApp(data: SignContractSuperAppData) {
    return this.client.execute<{
      signContractSuperApp: SignContractSuperAppResult;
    }>(SIGN_CONTRACT_SUPER_APP, data);
  }

  async mySalesAgent() {
    return this.client.execute<MySalesAgentResponse>(MY_SALES_AGENT);
  }

  salesAgentLatestVersion() {
    return this.client.execute<{
      salesAgentLatestVersion: SalesAgentLatestVersionResult;
    }>(SALES_AGENT_LATEST_VERSION);
  }

  getSellerCollectablesSalesAgent(trader_id: string | number) {
    return this.client.execute<{
      getSellerCollectablesSalesAgent: SellerCollectableResult[];
    }>(GET_SELLER_COLLECTABLES_SALES_AGENT, { trader_id });
  }

  getRequestsTimeSlots() {
    return this.client.execute<{
      getRequestsTimeSlots: RequestTimeSlotResult[];
    }>(GET_REQUESTS_TIME_SLOTS);
  }

  getRecurringRequestSummary(data: GetRecurringRequestSummaryData) {
    return this.client.execute<GetRecurringRequestSummaryResult>(
      GET_RECURRING_REQUEST_SUMMARY,
      data,
    );
  }

  updateSalesAgent(data: UpdateSalesAgentData) {
    return this.client.execute<{
      updateSalesAgent: MySalesAgentResult;
    }>(UPDATE_SALES_AGENT, data);
  }
}
