import { Channel, CountryCode } from "../enums";
import type { GraphQLClient } from "../GraphQLClient";
import {
  CREATE_CUSTOMER_REQUEST,
  CREATE_INCOMPLETE_WEB_REQUEST,
  UPDATE_B2C_WEB_REQUEST,
} from "./graphql/mutations";
import {
  GET_B2C_COLLECTABLES,
  GET_B2C_WEB_COLLECTABLES,
  GET_CURRENT_CUSTOMER,
} from "./graphql/queries";

export type B2cAddress = {
  id: string;
  latitude: string | null;
  longitude: string | null;
  description: string | null;
  primary: boolean | null;
};

export type Customer = {
  id: string;
  name: string | null;
  phone: string | null;
  country_code: string | null;
  points: number | null;
  addresses: B2cAddress[] | null;
};

export type B2cMeasure = {
  id: string;
  name: string | null;
  name_ar: string;
  name_en: string;
  unit: string | null;
  price: number | null;
};

export type B2cCollectable = {
  id: string;
  name: string | null;
  name_ar: string;
  name_en: string;
  image: string | null;
  measures: B2cMeasure[] | null;
};

export type B2cCollectableInput = {
  id: string | number;
  measure_id: string | number;
  count: number;
  price?: number;
};

export type SelectedGiftInput = {
  id: string | number;
  count: number;
};

export type B2cRequest = {
  id: string;
  status: string;
  type: string | null;
  collection_date: string | null;
  notes: string | null;
  net_uco_quantity: number | null;
  address?: B2cAddress | null;
  requestCollectables?: Array<{
    collectable: { id: string } | null;
    measure: { id: string } | null;
    quantity: number | null;
  }> | null;
};

export type CreateCustomerRequestData = {
  collectables: B2cCollectableInput[];
  address: { connect: string | number };
  collection_date: string;
  selectedGifts?: SelectedGiftInput[];
  notes?: string;
  additional_points?: number;
};

export type CreateIncompleteWebRequestData = {
  phone: string;
  country_code?: string;
};

export type UpdateB2cWebRequestData = {
  id: string | number;
  status?: "FULFILLED" | "SCHEDULED" | "DISPATCHED" | "INCOMPLETED_INFO";
  collectables?: B2cCollectableInput[];
  selectedGifts?: SelectedGiftInput[];
  collection_date?: string;
  address?: { connect: string | number };
  additional_points?: number;
};

export class B2cService {
  constructor(private readonly client: GraphQLClient) {}

  getCurrentCustomer() {
    return this.client.execute<{ myCustomer: Customer }>(GET_CURRENT_CUSTOMER);
  }

  getCollectables(channels: Channel[] = [Channel.B2C], countryCode: CountryCode = CountryCode.EG) {
    return this.client.execute<{ getCollectables: B2cCollectable[] }>(GET_B2C_COLLECTABLES, {
      channels,
      country_code: countryCode,
    });
  }

  getWebCollectables(
    channels: Channel[] = [Channel.B2C],
    countryCode: CountryCode = CountryCode.EG,
  ) {
    return this.client.execute<{ webFormGetCollectables: B2cCollectable[] }>(
      GET_B2C_WEB_COLLECTABLES,
      {
        channels,
        country_code: countryCode,
      },
    );
  }

  createCustomerRequest(data: CreateCustomerRequestData) {
    return this.client.execute<{ createCustomerRequest: B2cRequest }>(
      CREATE_CUSTOMER_REQUEST,
      data,
    );
  }

  createIncompleteWebRequest(data: CreateIncompleteWebRequestData) {
    return this.client.execute<{
      webFormCreateIncompleteRequest: {
        page: string | null;
        recentlyCreated: boolean | null;
        customer: Pick<Customer, "id" | "phone" | "country_code"> | null;
        requests: Array<Pick<B2cRequest, "id" | "status" | "type">> | null;
      };
    }>(CREATE_INCOMPLETE_WEB_REQUEST, data);
  }

  updateWebRequest(data: UpdateB2cWebRequestData) {
    return this.client.execute<{ webFormUpdateCustomerRequest: B2cRequest }>(
      UPDATE_B2C_WEB_REQUEST,
      data,
    );
  }
}
