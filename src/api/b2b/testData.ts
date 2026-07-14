import { faker } from "@faker-js/faker";
import { randomPhoneNumber } from "../../utils/testdata";
import {
  CreateBranchData,
  CreateBusinessClientData,
} from "./B2bService";

const LAT = "29.930406163389";
const LNG = "31.893502392581";

export function buildBusinessClientData(input: {
  brand_type_id: string;
  business_client_ar_name?: string;
  business_client_en_name?: string;
}): CreateBusinessClientData {
  const suffix = faker.string.alphanumeric(6).toLowerCase();

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
}): CreateBranchData {
  return {
    business_client_id: input.business_client_id,
    branch_collectables: {
      collectable_id: input.collectable_id,
      price: input.price ?? faker.number.int({ min: 1, max: 50 }),
    },
    latitude: input.latitude ?? LAT,
    longitude: input.longitude ?? LNG,
    phone: input.phone ?? randomPhoneNumber(),
    payment_type: input.payment_type ?? "CASH",
  };
}
