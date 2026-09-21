import type { CreateTripData } from "./TripService";

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

/** Format a local date as the DateTime value expected by trip mutations. */
export function tripCollectionDate(daysAhead = 1): string {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} 00:00:00`;
}

export function buildCreateTripData(input: {
  warehouseTypeId: string | number;
  warehouseId: string | number;
  collectorId: string | number;
  requestIds: Array<string | number>;
  collectionDate?: string;
}): CreateTripData {
  return {
    warehouse_type_id: input.warehouseTypeId,
    warehouse_id: input.warehouseId,
    collector_id: input.collectorId,
    collection_date: input.collectionDate ?? tripCollectionDate(),
    requests_ids: input.requestIds,
  };
}
