import { faker } from "@faker-js/faker";

import type {
  AddMiddleMileReceivingLoadInput,
  AddTripLoadQualityInput,
  ConfirmMiddleMileReceivingLoadInput,
  ConfirmMiddleMileSendingLoadInput,
  CreateMiddleMileTripInput,
  CreateTripLoadData,
  SetFirstScaleData,
  SetSecondScaleData,
  SetThirdScaleData,
  UpdateQualityOptionalFieldsInput,
  VerifySampleCodeData,
} from "./WarehouseService";

/** Local calendar date as YYYY-MM-DD (system date). */
export function systemShippingDate(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function buildCreateTripLoadData(input: {
  tripId: string | number;
  /** Channel for this trip — e.g. B2B, B2X, B2C */
  channelType: string;
}): CreateTripLoadData {
  return {
    tripId: input.tripId,
    channelType: input.channelType,
  };
}

export function buildSetFirstScaleData(input: {
  tripLoadId: string | number;
  firstScaleAmount?: number;
}): SetFirstScaleData {
  return {
    tripLoadId: input.tripLoadId,
    firstScaleAmount:
      input.firstScaleAmount ?? faker.number.float({ min: 1000, max: 5000, fractionDigits: 2 }),
  };
}

export function buildSetSecondScaleData(input: {
  firstScaleId: string | number;
  secondScaleAmount?: number;
}): SetSecondScaleData {
  return {
    firstScaleId: input.firstScaleId,
    secondScaleAmount:
      input.secondScaleAmount ?? faker.number.float({ min: 800, max: 4500, fractionDigits: 2 }),
  };
}

export function buildSetThirdScaleData(input: {
  firstScaleId: string | number;
  notes?: string;
  deductibles?: number;
}): SetThirdScaleData {
  return {
    firstScaleId: input.firstScaleId,
    notes: input.notes ?? "Container weight",
    // Only set when caller passes it (notes-only remains the default path)
    ...(input.deductibles !== undefined ? { deductibles: input.deductibles } : {}),
  };
}

export function buildAddTripLoadQualityInput(input: {
  trip_load_id: string | number;
  ffa?: number;
  i?: number;
  m?: number;
  product_type?: string;
  /** When true, also fills optional s/cl/p/unsaponifiable */
  includeOptionalFields?: boolean;
  s?: number;
  cl?: number;
  p?: number;
  unsaponifiable?: number;
}): AddTripLoadQualityInput {
  const emptyBeaker = faker.number.float({ min: 50, max: 120, fractionDigits: 2 });
  const sampleBefore = emptyBeaker + faker.number.float({ min: 5, max: 40, fractionDigits: 2 });
  const sampleAfter = sampleBefore + faker.number.float({ min: 1, max: 20, fractionDigits: 2 });

  const base: AddTripLoadQualityInput = {
    trip_load_id: input.trip_load_id,
    ffa: input.ffa ?? faker.number.float({ min: 0.1, max: 5, fractionDigits: 2 }),
    i: input.i ?? faker.number.float({ min: 0.1, max: 5, fractionDigits: 2 }),
    m: input.m ?? faker.number.float({ min: 0.1, max: 5, fractionDigits: 2 }),
    empty_beaker_weight: emptyBeaker,
    beaker_sample_before: sampleBefore,
    beaker_sample_after: sampleAfter,
    beaker_sediments: faker.number.float({ min: 0, max: 2, fractionDigits: 2 }),
    koh_volume: faker.number.float({ min: 0, max: 5, fractionDigits: 2 }),
    product_type: input.product_type ?? "PRODUCT_1",
  };

  if (input.includeOptionalFields) {
    base.s = input.s ?? faker.number.float({ min: 0.1, max: 20, fractionDigits: 2 });
    base.cl = input.cl ?? faker.number.float({ min: 0.1, max: 10, fractionDigits: 2 });
    base.p = input.p ?? faker.number.float({ min: 0.1, max: 25, fractionDigits: 2 });
    base.unsaponifiable =
      input.unsaponifiable ?? faker.number.float({ min: 0.1, max: 5, fractionDigits: 2 });
  }

  return base;
}

export function buildUpdateQualityOptionalFieldsInput(input: {
  trip_load_quality_id: string | number;
  s?: number;
  cl?: number;
  p?: number;
  unsaponifiable?: number;
}): UpdateQualityOptionalFieldsInput {
  return {
    trip_load_quality_id: input.trip_load_quality_id,
    s: input.s ?? 17.5,
    cl: input.cl ?? 6.5,
    p: input.p ?? 20,
    unsaponifiable: input.unsaponifiable ?? 3.5,
  };
}

export function buildVerifySampleCodeData(input: {
  tripLoadId: string | number;
  code: string;
}): VerifySampleCodeData {
  return {
    tripLoadId: input.tripLoadId,
    code: input.code,
  };
}

export function buildCreateMiddleMileTripInput(
  input: Partial<CreateMiddleMileTripInput> = {},
): CreateMiddleMileTripInput {
  return {
    source_warehouse_id: input.source_warehouse_id ?? 5,
    destination_warehouse_id: input.destination_warehouse_id ?? 1,
    collectable_id: input.collectable_id ?? 1,
    truck_type: input.truck_type ?? "JUMBO",
    shipping_date: input.shipping_date ?? systemShippingDate(),
    notes: input.notes ?? "Priority shipment",
    items: input.items ?? [{ channel_type: "B2X", quantity: 1000 }],
  };
}

export function buildConfirmMiddleMileSendingLoadInput(input: {
  trip_load_id: string | number;
  net_weight?: number;
}): ConfirmMiddleMileSendingLoadInput {
  return {
    trip_load_id: input.trip_load_id,
    net_weight: input.net_weight ?? 1000,
  };
}

export function buildAddMiddleMileReceivingLoadInput(input: {
  middle_mile_trip_id: string | number;
  channel_type?: string;
  net_weight?: number;
}): AddMiddleMileReceivingLoadInput {
  return {
    middle_mile_trip_id: input.middle_mile_trip_id,
    channel_type: input.channel_type ?? "B2B",
    net_weight: input.net_weight ?? 900,
  };
}

export function buildConfirmMiddleMileReceivingLoadInput(input: {
  trip_load_id: string | number;
  net_weight?: number;
  has_scrape?: boolean;
}): ConfirmMiddleMileReceivingLoadInput {
  return {
    trip_load_id: input.trip_load_id,
    net_weight: input.net_weight ?? 9000,
    has_scrape: input.has_scrape ?? false,
  };
}
