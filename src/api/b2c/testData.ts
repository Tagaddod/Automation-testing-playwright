import { randomInt } from "node:crypto";

import type {
  B2cAvailableGift,
  B2cCollectableInput,
  CreateCustomerRequestData,
  SelectedGiftInput,
  UpdateB2cWebRequestData,
} from "./B2cService";

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

export function b2cCollectionDate(daysAhead = 1): string {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} 00:00:00`;
}

/** Random collectable count, never below 2 units. */
export function randomCollectableCount(max = 20): number {
  return randomInt(2, max + 1);
}

/** measure_id must be one of the measures of that same collectable. */
export function buildCompensationsCollectables(input: {
  collectableId: string | number;
  measureId: string | number;
  count?: number;
}): B2cCollectableInput[] {
  return [
    {
      id: input.collectableId,
      measure_id: input.measureId,
      count: input.count ?? randomCollectableCount(),
    },
  ];
}

export function buildCustomerRequestData(input: {
  addressId: string | number;
  collectableId: string | number;
  measureId: string | number;
  count?: number;
  collectionDate?: string;
  notes?: string;
  /** Required: the resolver reads selectedGifts unconditionally, and [] is rejected. */
  selectedGifts: SelectedGiftInput[];
}): CreateCustomerRequestData {
  return {
    address: { connect: input.addressId },
    collectables: [
      {
        id: input.collectableId,
        measure_id: input.measureId,
        count: input.count ?? 2,
      },
    ],
    collection_date: input.collectionDate ?? b2cCollectionDate(),
    notes: input.notes ?? "Customer App API request",
    selectedGifts: input.selectedGifts,
  };
}

/**
 * Picks the cheapest gift by litres. Richer gifts are rejected even when
 * getCompensations lists them, so the lowest-litres gift keeps the flow green.
 */
export function buildSelectedGifts(availableGifts: B2cAvailableGift[]): SelectedGiftInput[] {
  const cheapest = [...availableGifts].sort((a, b) => (a.litres ?? 0) - (b.litres ?? 0))[0];
  return cheapest ? [{ id: cheapest.id, count: 1 }] : [];
}

export function buildB2cWebRequestUpdate(input: {
  requestId: string | number;
  addressId: string | number;
  collectableId: string | number;
  measureId: string | number;
  count?: number;
  collectionDate?: string;
}): UpdateB2cWebRequestData {
  return {
    id: input.requestId,
    status: "SCHEDULED",
    address: { connect: input.addressId },
    collectables: [
      {
        id: input.collectableId,
        measure_id: input.measureId,
        count: input.count ?? 2,
      },
    ],
    collection_date: input.collectionDate?.split(" ")[0] ?? b2cCollectionDate().split(" ")[0],
  };
}
