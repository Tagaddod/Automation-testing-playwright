import type { TraderType } from "../enums";
import { Channel, CountryCode } from "../enums";
import type { GraphQLClient, GraphQLResponse } from "../GraphQLClient";
import { CREATE_TRADER, CREATE_TRADER_REQUEST_V2 } from "./graphql/mutations";
import { GET_COLLECTABLES } from "./graphql/queries";

export type CreateTraderData = {
  name: string;
  country_code: string;
  phone: string;
  trader_type: TraderType;
  has_warehouse: boolean;
  vehicle_id: number;
  latitude: string;
  longitude: string;
  collectables: string[];
};

export type Trader = {
  id: string;
  name: string | null;
  phone: string | null;
  country_code: string | null;
};

export type CollectableMeasure = {
  id: string;
  name_ar: string | null;
  name_en: string | null;
  name_de: string | null;
  unit: string | null;
  price: number | null;
};

export type Collectable = {
  id: string;
  name_ar: string | null;
  name_en: string | null;
  name_de: string | null;
  image: string | null;
  seller_extra_data: string | null;
  flow: string | null;
  is_primary: boolean | null;
  total_count: number | null;
  remaining_count: number | null;
  consumed_count: number | null;
  measures: CollectableMeasure[] | null;
};

export type TraderCollectableInput = {
  id: string | number;
  measure_id: string | number;
  count: number;
  price?: number;
};

export type CreateTraderRequestData = {
  trader_id: string | number;
  collectables: TraderCollectableInput[];
  collection_date: string;
  notes?: string;
};

export class B2xService {
  constructor(private readonly client: GraphQLClient) {}

  createTrader(data: CreateTraderData) {
    return this.client.execute<{
      createTrader: Trader;
    }>(CREATE_TRADER, data);
  }

  createTraderRequest(data: CreateTraderRequestData) {
    return this.client.execute<{
      createTraderRequestV2: {
        id: string;
        status: string | null;
        localized_status: string | null;
        collection_date: string | null;
        net_uco_quantity: number | null;
        flow_type: string | null;
        service_contract_id: string | null;
      };
    }>(CREATE_TRADER_REQUEST_V2, data);
  }

  getCollectables(channels: Channel[] = [Channel.B2X], countryCode: CountryCode = CountryCode.EG) {
    return this.client.execute<{
      getCollectables: Collectable[];
    }>(GET_COLLECTABLES, { channels, country_code: countryCode });
  }
}

export type { GraphQLResponse };
export { Channel, CountryCode };
