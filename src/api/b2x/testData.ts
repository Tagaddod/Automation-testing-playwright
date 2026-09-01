import { randomPhoneNumber, randomTraderName } from "../../utils/testdata";
import { CountryCode, TraderType } from "../enums";
import type { CreateTraderData, CreateTraderRequestData } from "./B2xService";

const LAT = "29.930406163389";
const LNG = "31.893502392581";

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

/** Today's date in the `YYYY-MM-DD 00:00:00` DateTime format the API expects. */
function todayDateTime(): string {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} 00:00:00`;
}

export function buildTraderData(input?: {
  name?: string;
  country_code?: string;
  phone?: string;
  trader_type?: TraderType;
  has_warehouse?: boolean;
  vehicle_id?: number;
  latitude?: string;
  longitude?: string;
}): CreateTraderData {
  return {
    name: input?.name ?? randomTraderName(),
    country_code: input?.country_code ?? CountryCode.EG,
    phone: input?.phone ?? randomPhoneNumber(),
    trader_type: input?.trader_type ?? TraderType.TRADER,
    has_warehouse: input?.has_warehouse ?? false,
    vehicle_id: input?.vehicle_id ?? 5,
    latitude: input?.latitude ?? LAT,
    longitude: input?.longitude ?? LNG,
    collectables: ["1"],
  };
}

export function buildTraderRequestData(input: {
  trader_id: string | number;
  collectable_id: string | number;
  measure_id: string | number;
  count?: number;
  price?: number;
  collection_date?: string;
  notes?: string;
}): CreateTraderRequestData {
  return {
    trader_id: input.trader_id,
    collectables: [
      {
        id: input.collectable_id,
        measure_id: input.measure_id,
        count: input.count ?? 2,
        // Server rejects prices below 1 EGP.
        price: input.price ?? 10,
      },
    ],
    collection_date: input.collection_date ?? todayDateTime(),
    notes: input.notes ?? "Trader FP Request",
  };
}
