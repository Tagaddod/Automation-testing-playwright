import { faker } from "@faker-js/faker";

import { randomPhoneNumber } from "../../utils/testdata";
import type { CreateSalesBranchData } from "./SalesService";

const DEFAULT_LAT = "29.930406163389";
const DEFAULT_LNG = "31.893502392581";

/** Default business client for Sales App create-branch tests (Egypt). */
export const SALES_APP_EG_BUSINESS_CLIENT_ID = 103;

export function buildSalesBranchData(input: {
  business_client_id?: string | number;
  collectable_id: string | number;
  price?: number;
  phone?: string;
  latitude?: string;
  longitude?: string;
  payment_type?: string;
}): CreateSalesBranchData {
  return {
    business_client_id: input.business_client_id ?? SALES_APP_EG_BUSINESS_CLIENT_ID,
    branch_collectables: [
      {
        collectable_id: input.collectable_id,
        price: input.price ?? faker.number.int({ min: 1, max: 50 }),
      },
    ],
    latitude: input.latitude ?? DEFAULT_LAT,
    longitude: input.longitude ?? DEFAULT_LNG,
    phone: input.phone ?? randomPhoneNumber(),
    payment_type: input.payment_type ?? "CASH",
  };
}
