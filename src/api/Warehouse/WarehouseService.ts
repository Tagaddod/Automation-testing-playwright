import type { GraphQLClient, GraphQLResponse } from "../GraphQLClient";
import {
  ADD_MIDDLE_MILE_RECEIVING_LOAD,
  ADD_TRIP_LOAD_QUALITY,
  CONFIRM_MIDDLE_MILE_RECEIVING,
  CONFIRM_MIDDLE_MILE_RECEIVING_LOAD,
  CONFIRM_MIDDLE_MILE_SENDING,
  CONFIRM_MIDDLE_MILE_SENDING_LOAD,
  CREATE_MIDDLE_MILE_TRIP,
  CREATE_TRIP_LOAD,
  DELETE_SAMPLE_CONFIRMATION,
  DELETE_TRIP_LOAD,
  GENERATE_SAMPLE_CODE,
  SET_FIRST_SCALE,
  SET_SECOND_SCALE,
  SET_THIRD_SCALE,
  START_MIDDLE_MILE_RECEIVING,
  START_MIDDLE_MILE_SENDING,
  UPDATE_QUALITY_OPTIONAL_FIELDS,
  VERIFY_SAMPLE_CODE,
} from "./graphql/mutations";

export type CreateTripLoadData = {
  tripId: string | number;
  /** Depends on the trip — e.g. B2B, B2X, B2C */
  channelType: string;
};

export type SetFirstScaleData = {
  tripLoadId: string | number;
  firstScaleAmount: number;
};

export type SetSecondScaleData = {
  firstScaleId: string | number;
  secondScaleAmount: number;
};

export type SetThirdScaleData = {
  firstScaleId: string | number;
  notes?: string | null;
  /** Optional deductibles amount — omit/null for notes-only */
  deductibles?: number | null;
};

export type AddTripLoadQualityInput = {
  trip_load_id: string | number;
  ffa: number;
  i: number;
  m: number;
  s?: number | null;
  cl?: number | null;
  p?: number | null;
  unsaponifiable?: number | null;
  empty_beaker_weight: number;
  beaker_sample_before: number;
  beaker_sample_after: number;
  beaker_sediments: number;
  koh_volume: number;
  /** ProductTypeEnum: PRODUCT_1 | PRODUCT_2 | ACIDIC_OIL */
  product_type: string;
};

export type GenerateSampleCodeData = {
  tripLoadId: string | number;
};

export type VerifySampleCodeData = {
  tripLoadId: string | number;
  code: string;
};

export type CreateMiddleMileTripInput = {
  source_warehouse_id: string | number;
  destination_warehouse_id: string | number;
  collectable_id: string | number;
  truck_type: string;
  /** YYYY-MM-DD — prefer system date from builders */
  shipping_date: string;
  notes?: string | null;
  items: Array<{ channel_type: string; quantity: number }>;
};

export type ConfirmMiddleMileSendingLoadInput = {
  trip_load_id: string | number;
  net_weight: number;
};

export type AddMiddleMileReceivingLoadInput = {
  middle_mile_trip_id: string | number;
  channel_type: string;
  net_weight?: number | null;
};

export type ConfirmMiddleMileReceivingLoadInput = {
  trip_load_id: string | number;
  net_weight?: number | null;
  has_scrape?: boolean | null;
};

export type UpdateQualityOptionalFieldsInput = {
  trip_load_quality_id: string | number;
  s?: number | null;
  cl?: number | null;
  p?: number | null;
  unsaponifiable?: number | null;
};

type TripLoadQualityResult = {
  id: string;
  trip_load_id: string | number | null;
  status?: string | null;
  channel_type?: string | null;
  ffa: number | null;
  i: number | null;
  m: number | null;
  s?: number | null;
  cl?: number | null;
  p?: number | null;
  unsaponifiable?: number | null;
  empty_beaker_weight: number | null;
  beaker_sample_before: number | null;
  beaker_sample_after: number | null;
  beaker_sediments: number | null;
  koh_volume: number | null;
  product_type: string | null;
  inspection_time?: string | null;
  inspector_name?: string | null;
  trip_load?: {
    id: string;
    load_step: string | null;
    status: string | null;
    net_weight: number | null;
  } | null;
};

/** Warehouse GraphQL operations (B2B trip load / scales / quality / middle mile). */
export class WarehouseService {
  constructor(private readonly client: GraphQLClient) {}

  createTripLoad(data: CreateTripLoadData) {
    return this.client.request<{
      createTripLoad: {
        id: string;
        trip_id: string | null;
        load_step: string | null;
        status: string | null;
        net_weight: number | null;
        created_at: string | null;
      };
    }>(CREATE_TRIP_LOAD, {
      tripId: data.tripId,
      channelType: data.channelType,
    });
  }

  deleteTripLoad(tripLoadId: string | number) {
    return this.client.request<{
      deleteTripLoad: boolean | null;
    }>(DELETE_TRIP_LOAD, { trip_load_id: tripLoadId });
  }

  setFirstScale(data: SetFirstScaleData) {
    return this.client.request<{
      setFirstScale: {
        id: string;
        trip_id: string | null;
        trip_load_id: string | null;
        first_scale_amount: number | null;
        first_scale_time: string | null;
        is_pre_trip_scale: boolean | null;
        tripLoad: { id: string; status: string | null } | null;
      };
    }>(SET_FIRST_SCALE, {
      tripLoadId: data.tripLoadId,
      firstScaleAmount: data.firstScaleAmount,
    });
  }

  setSecondScale(data: SetSecondScaleData) {
    return this.client.request<{
      setSecondScale: {
        id: string;
        first_scale_amount: number | null;
        second_scale_amount: number | null;
        second_scale_time: string | null;
        scale_amount_difference: number | null;
        tripLoad: { id: string; status: string | null; net_weight: number | null } | null;
      };
    }>(SET_SECOND_SCALE, {
      firstScaleId: data.firstScaleId,
      secondScaleAmount: data.secondScaleAmount,
    });
  }

  setThirdScale(data: SetThirdScaleData) {
    return this.client.request<{
      setThirdScaleDeductibles: {
        id: string;
        first_scale_amount: number | null;
        second_scale_amount: number | null;
        third_scale_deductibles_amount: number | null;
        third_scale_time: string | null;
        scale_amount_difference: number | null;
        notes: string | null;
        tripLoad: { id: string; status: string | null; net_weight: number | null } | null;
      };
    }>(SET_THIRD_SCALE, {
      firstScaleId: data.firstScaleId,
      notes: data.notes ?? null,
      deductibles: data.deductibles ?? null,
    });
  }

  addTripLoadQuality(input: AddTripLoadQualityInput) {
    return this.client.request<{
      addTripLoadQuality: TripLoadQualityResult;
    }>(ADD_TRIP_LOAD_QUALITY, { input });
  }

  updateQualityOptionalFields(input: UpdateQualityOptionalFieldsInput) {
    return this.client.request<{
      updateQualityOptionalFields: TripLoadQualityResult;
    }>(UPDATE_QUALITY_OPTIONAL_FIELDS, { input });
  }

  generateSampleCode(data: GenerateSampleCodeData) {
    return this.client.request<{
      generateSampleConfirmationCode: {
        id: string;
        sample_confirmation_code: string | null;
        sample_taken_by_user: { id: string; name: string | null } | null;
        sample_taken_time: string | null;
      };
    }>(GENERATE_SAMPLE_CODE, { tripLoadId: data.tripLoadId });
  }

  deleteSampleConfirmation(tripLoadId: string | number) {
    return this.client.request<{
      deleteSampleConfirmation: {
        id: string;
        sample_confirmation_code: string | null;
        sample_taken_by_user: { id: string; name: string | null } | null;
        sample_taken_time: string | null;
      };
    }>(DELETE_SAMPLE_CONFIRMATION, { tripLoadId });
  }

  verifySampleCode(data: VerifySampleCodeData) {
    return this.client.request<{
      verifySampleConfirmationCode: {
        id: string;
        sample_confirmation_code: string | null;
        sample_received_by_user: { id: string; name: string | null } | null;
        sample_received_time: string | null;
      };
    }>(VERIFY_SAMPLE_CODE, {
      tripLoadId: data.tripLoadId,
      code: data.code,
    });
  }

  createMiddleMileTrip(input: CreateMiddleMileTripInput) {
    return this.client.request<{
      createMiddleMileTrip: {
        id: string;
        status: string | null;
        truck_type: string | null;
        shipping_date: string | null;
        notes: string | null;
        created_at: string | null;
        items: Array<{
          id: string;
          channel_type: string | null;
          quantity: number | null;
        }> | null;
      };
    }>(CREATE_MIDDLE_MILE_TRIP, { input });
  }

  startMiddleMileSending(middleMileTripId: string | number) {
    return this.client.request<{
      startMiddleMileSending: {
        id: string;
        status: string | null;
        trip_loads: Array<{
          id: string;
          channel_type: string | null;
          load_step: string | null;
          status: string | null;
          direction: string | null;
          net_weight: number | null;
        }> | null;
      };
    }>(START_MIDDLE_MILE_SENDING, { middleMileTripId });
  }

  confirmMiddleMileSendingLoad(input: ConfirmMiddleMileSendingLoadInput) {
    return this.client.request<{
      confirmMiddleMileSendingLoad: {
        id: string;
        status: string | null;
        trip_loads: Array<{
          id: string;
          status: string | null;
          direction: string | null;
          net_weight: number | null;
        }> | null;
      };
    }>(CONFIRM_MIDDLE_MILE_SENDING_LOAD, { input });
  }

  confirmMiddleMileSending(middleMileTripId: string | number) {
    return this.client.request<{
      confirmMiddleMileSending: {
        id: string;
        status: string | null;
        sender_confirmed_at: string | null;
      };
    }>(CONFIRM_MIDDLE_MILE_SENDING, { middleMileTripId });
  }

  startMiddleMileReceiving(middleMileTripId: string | number) {
    return this.client.request<{
      startMiddleMileReceiving: {
        id: string;
        status: string | null;
        trip_loads: Array<{
          id: string;
          status: string | null;
          direction: string | null;
          net_weight: number | null;
        }> | null;
      };
    }>(START_MIDDLE_MILE_RECEIVING, { middleMileTripId });
  }

  addMiddleMileReceivingLoad(input: AddMiddleMileReceivingLoadInput) {
    return this.client.request<{
      addMiddleMileReceivingLoad: {
        id: string;
        status: string | null;
        trip_loads: Array<{
          id: string;
          channel_type: string | null;
          direction: string | null;
          net_weight: number | null;
          has_scrape: boolean | null;
        }> | null;
      };
    }>(ADD_MIDDLE_MILE_RECEIVING_LOAD, { input });
  }

  confirmMiddleMileReceivingLoad(input: ConfirmMiddleMileReceivingLoadInput) {
    return this.client.request<{
      confirmMiddleMileReceivingLoad: {
        id: string;
        status: string | null;
        trip_loads: Array<{
          id: string;
          status: string | null;
          direction: string | null;
          net_weight: number | null;
          has_scrape: boolean | null;
        }> | null;
      };
    }>(CONFIRM_MIDDLE_MILE_RECEIVING_LOAD, { input });
  }

  confirmMiddleMileReceiving(middleMileTripId: string | number) {
    return this.client.request<{
      confirmMiddleMileReceiving: {
        id: string;
        status: string | null;
        trip_loads: Array<{
          id: string;
          status: string | null;
          direction: string | null;
          net_weight: number | null;
        }> | null;
      };
    }>(CONFIRM_MIDDLE_MILE_RECEIVING, { middleMileTripId });
  }
}

export type { GraphQLResponse };
