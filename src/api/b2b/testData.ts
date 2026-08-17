import { randomBytes, randomInt } from "node:crypto";
import { randomPhoneNumber } from "../../utils/testdata";
import {
  CreateBranchData,
  CreateBusinessClientData,
  CreateBusinessRequestData,
} from "./B2bService";
import { faker } from "@faker-js/faker";

import { randomPhoneNumber } from "../../utils/testdata";
import type { CreateBranchData, CreateBusinessClientData } from "./B2bService";

const DAY_CONST = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

const LAT = "29.930406163389";
const LNG = "31.893502392581";

function randomSuffix(length = 6): string {
  return Math.random()
    .toString(36)
    .slice(2, 2 + length)
    .padEnd(length, "0");
}

export function buildBusinessClientData(input: {
  brand_type_id: string;
  business_client_ar_name?: string;
  business_client_en_name?: string;
}): CreateBusinessClientData {
  const suffix = randomBytes(4).toString("hex").slice(0, 6);

  return {
    brand_type_id: input.brand_type_id,
    business_client_ar_name: input.business_client_ar_name ?? `عميل-${suffix}`,
    business_client_en_name: input.business_client_en_name ?? `Client-${suffix}`,
  };
}

export function buildBranchData(input: {
  business_client_id: string | number;
  collectable_id: string | number;
  price?: number;
  phone?: string;
  latitude?: string;
  longitude?: string;
  payment_type?: string;
  sell_fresh_products?: boolean;
}): CreateBranchData {
  return {
    business_client_id: input.business_client_id,
    branch_collectables: [
      {
        collectable_id: input.collectable_id,
        price: input.price ?? randomInt(1, 51),
      },
    ],
    latitude: input.latitude ?? LAT,
    longitude: input.longitude ?? LNG,
    phone: input.phone ?? randomPhoneNumber(),
    payment_type: input.payment_type ?? "CASH",
    sell_fresh_products: input.sell_fresh_products ?? true,
  };
}

export function buildBusinessRequestData(input: {
  branch_id: string | number;
  collectable_id: string | number;
  measure_id: string | number;
  fresh_product_id: string | number;
  count?: number;
  quantity?: number;
  notes?: string;
}): CreateBusinessRequestData {
  const now = new Date();
  const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} 00:00:00`;

  return {
    branch_id: input.branch_id,
    collectables: [
      {
        id: input.collectable_id,
        measure_id: input.measure_id,
        // Requirement: count must be at least 2.
        count: input.count ?? 2,
      },
    ],
    fresh_products: [
      {
        fresh_product_id: input.fresh_product_id,
        // Requirement: quantity must be greater than 0.
        quantity: input.quantity ?? 1,
      },
    ],
    day_const: DAY_CONST[now.getDay()],
    date_time: {
      time: "3:00:00",
      date,
    },
    notes: input.notes ?? "FP Request",
  };
}
