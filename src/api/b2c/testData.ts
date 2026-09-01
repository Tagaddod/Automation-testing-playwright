import type { CreateCustomerRequestData, UpdateB2cWebRequestData } from "./B2cService";

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

export function b2cCollectionDate(daysAhead = 1): string {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} 00:00:00`;
}

export function buildCustomerRequestData(input: {
  addressId: string | number;
  collectableId: string | number;
  measureId: string | number;
  count?: number;
  collectionDate?: string;
  notes?: string;
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
  };
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
