import { randomPhoneNumber, randomTraderName } from "../../utils/testdata";
import { requireSavedBranchId } from "../saveApiResponse";
import type {
  CreateBusinessRequestSuperAppData,
  CreateSalesBranchData,
  GetRecurringRequestSummaryData,
  RecurringCollectionFrequency,
} from "./SalesService";

const DEFAULT_LAT = "29.930406163389";
const DEFAULT_LNG = "31.893502392581";

/** Default business client for Sales App create-branch helper (`buildSalesBranchData`). */
export const SALES_APP_EG_BUSINESS_CLIENT_ID = 103;

/** Business client id used by createBranch Sales Egypt API scenarios. */
export const SALES_CREATE_BRANCH_BUSINESS_CLIENT_ID = 23291;

/** Business client id used by createBranch Sales Saudi API scenarios. */
export const SALES_CREATE_BRANCH_SAUDI_BUSINESS_CLIENT_ID = 23990;

/** Business client id used by createBranch Sales Jordan API scenarios. */
export const SALES_CREATE_BRANCH_JORDAN_BUSINESS_CLIENT_ID = 23335;

/** Egypt country code returned by Sales create APIs. */
export const SALES_EGYPT_COUNTRY_CODE = "+20";

/** GraphQL country_code input for Egypt createTraderSuperApp. */
export const SALES_EGYPT_GRAPHQL_COUNTRY_CODE = "EG";

/** Saudi dialing code returned by Sales create APIs. */
export const SALES_SAUDI_COUNTRY_CODE = "+966";

/** GraphQL country_code input for Saudi createTraderSuperApp. */
export const SALES_SAUDI_GRAPHQL_COUNTRY_CODE = "SA";

/** Default Sales Egypt create-branch coordinates. */
export const SALES_EGYPT_DEFAULT_LATITUDE = DEFAULT_LAT;
export const SALES_EGYPT_DEFAULT_LONGITUDE = DEFAULT_LNG;

/** Hardcoded Sales Saudi create-trader coordinates. */
export const SALES_SAUDI_DEFAULT_LATITUDE = "24.718594538080318";
export const SALES_SAUDI_DEFAULT_LONGITUDE = "46.67802396464344";

/** Hardcoded Sales Saudi create-branch coordinates. */
export const SALES_SAUDI_BRANCH_LATITUDE = "24.718594538080318";
export const SALES_SAUDI_BRANCH_LONGITUDE = "46.67802396464344";

/** Saudi collectable / measure used by createTrader + createTraderRequest. */
export const SALES_SAUDI_COLLECTABLE_ID = 1;
export const SALES_SAUDI_MEASURE_ID = 3;

/** Jordan dialing code returned by Sales create APIs. */
export const SALES_JORDAN_COUNTRY_CODE = "+962";

/** GraphQL country_code input for Jordan createTraderSuperApp. */
export const SALES_JORDAN_GRAPHQL_COUNTRY_CODE = "JO";

/** Hardcoded Sales Jordan create-trader coordinates. */
export const SALES_JORDAN_DEFAULT_LATITUDE = "31.9539";
export const SALES_JORDAN_DEFAULT_LONGITUDE = "35.9106";

/** Jordan collectable / measure used by createTrader + createTraderRequest. */
export const SALES_JORDAN_COLLECTABLE_ID = 3;
export const SALES_JORDAN_MEASURE_ID = 4;

/** Saudi mobile prefixes for createBranch local phones (50–59). */
export const SALES_SAUDI_PHONE_PREFIXES = [
  "50",
  "51",
  "52",
  "53",
  "54",
  "55",
  "56",
  "57",
  "58",
  "59",
] as const;

/** Saudi mobile prefixes for createTrader (+966) phones. */
export const SALES_SAUDI_TRADER_PHONE_PREFIXES = [
  "50",
  "53",
  "54",
  "55",
  "56",
  "57",
  "58",
  "59",
] as const;

/** Jordan mobile prefixes for createTrader local phones. */
export const SALES_JORDAN_PHONE_PREFIXES = ["77", "78", "79"] as const;

/** Jordan mobile prefixes for createBranch (+962) phones. */
export const SALES_JORDAN_BRANCH_PHONE_PREFIXES = ["077", "078", "079"] as const;

/** GraphQL country_code for Vienna / Austria recurring-request flows. */
export const SALES_VIENNA_GRAPHQL_COUNTRY_CODE = "AT";

/** Default collection time used by Vienna recurring-request Postman flow. */
export const SALES_VIENNA_COLLECTION_TIME = "12:00";

/** Default frequency used by Vienna recurring-request Postman flow. */
export const SALES_VIENNA_COLLECTION_FREQUENCY: RecurringCollectionFrequency = "WEEKLY";

function formatDateYmd(date: Date): string {
  return date.toISOString().split("T")[0]!;
}

/**
 * Dynamic Vienna recurring-request variables (Postman pre-request script).
 * start_date = today, end_date = +5 months, frequency_day = 1–28.
 */
export function validViennaRecurringRequestVariables(
  overrides: Partial<GetRecurringRequestSummaryData> = {},
): GetRecurringRequestSummaryData {
  const startDate = new Date();
  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + 5);

  return {
    country_code: SALES_VIENNA_GRAPHQL_COUNTRY_CODE,
    start_date: formatDateYmd(startDate),
    end_date: formatDateYmd(endDate),
    frequency_day: Math.floor(Math.random() * 28) + 1,
    collection_time: SALES_VIENNA_COLLECTION_TIME,
    collection_frequency: SALES_VIENNA_COLLECTION_FREQUENCY,
    ...overrides,
  };
}

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
        price: input.price ?? Math.floor(Math.random() * 50) + 1,
      },
    ],
    latitude: input.latitude ?? DEFAULT_LAT,
    longitude: input.longitude ?? DEFAULT_LNG,
    phone: input.phone ?? randomPhoneNumber(),
    payment_type: input.payment_type ?? "CASH",
  };
}

/** Valid CreateBranch defaults for Sales Egypt API tests (override one field per scenario). */
export function validBranchVariables(
  overrides: Partial<{
    business_client_id: string | number;
    collectable_id: string | number;
    price: number;
    latitude: string;
    longitude: string;
    phone: string;
    payment_type: string;
    country_code: string;
  }> = {},
): CreateSalesBranchData {
  const {
    collectable_id = 1,
    price = 10,
    business_client_id = SALES_CREATE_BRANCH_BUSINESS_CLIENT_ID,
    latitude = DEFAULT_LAT,
    longitude = DEFAULT_LNG,
    phone = randomPhoneNumber(),
    payment_type = "CASH",
    country_code,
  } = overrides;

  return {
    business_client_id,
    branch_collectables: [{ collectable_id, price }],
    latitude,
    longitude,
    phone,
    payment_type,
    ...(country_code ? { country_code } : {}),
  };
}

/** Valid CreateBranch defaults for Sales Saudi API tests (hardcoded Postman payload). */
export function validSaudiBranchVariables(
  overrides: Partial<{
    business_client_id: string | number;
    collectable_id: string | number;
    price: number;
    latitude: string;
    longitude: string;
    phone: string;
    payment_type: string;
    country_code: string;
  }> = {},
): CreateSalesBranchData {
  return validBranchVariables({
    business_client_id: SALES_CREATE_BRANCH_SAUDI_BUSINESS_CLIENT_ID,
    collectable_id: SALES_SAUDI_COLLECTABLE_ID,
    price: 10,
    latitude: SALES_SAUDI_BRANCH_LATITUDE,
    longitude: SALES_SAUDI_BRANCH_LONGITUDE,
    phone: randomSaudiLocalPhoneNumber(),
    country_code: SALES_SAUDI_GRAPHQL_COUNTRY_CODE,
    ...overrides,
  });
}

/** Valid CreateBranch defaults for Sales Jordan API tests (hardcoded Postman payload). */
export function validJordanBranchVariables(
  overrides: Partial<{
    business_client_id: string | number;
    collectable_id: string | number;
    price: number;
    latitude: string;
    longitude: string;
    phone: string;
    payment_type: string;
    country_code: string;
  }> = {},
): CreateSalesBranchData {
  return validBranchVariables({
    business_client_id: SALES_CREATE_BRANCH_JORDAN_BUSINESS_CLIENT_ID,
    collectable_id: SALES_JORDAN_COLLECTABLE_ID,
    price: 10,
    latitude: SALES_JORDAN_DEFAULT_LATITUDE,
    longitude: SALES_JORDAN_DEFAULT_LONGITUDE,
    phone: randomJordanPhoneNumber(),
    country_code: SALES_JORDAN_GRAPHQL_COUNTRY_CODE,
    ...overrides,
  });
}

/** Normalize phone by removing +20/+966/+962 and a leading 0 before compare. */
export function normalizePhone(phone: string): string {
  return phone
    .replace(/^\+20/, "")
    .replace(/^\+966/, "")
    .replace(/^\+962/, "")
    .replace(/^0/, "");
}

/** Random Saudi mobile for createTrader: +966 + prefix + 7-digit subscriber. */
export function randomSaudiPhoneNumber(): string {
  const prefix =
    SALES_SAUDI_TRADER_PHONE_PREFIXES[
      Math.floor(Math.random() * SALES_SAUDI_TRADER_PHONE_PREFIXES.length)
    ];
  const subscriberNumber = Math.floor(1000000 + Math.random() * 9000000).toString();
  return "+966" + prefix + subscriberNumber;
}

/** Random Saudi local mobile for createBranch: e.g. 551234563 (50–59 + 7 digits, no +966). */
export function randomSaudiLocalPhoneNumber(): string {
  const prefix =
    SALES_SAUDI_PHONE_PREFIXES[Math.floor(Math.random() * SALES_SAUDI_PHONE_PREFIXES.length)];
  const subscriberNumber = Math.floor(1000000 + Math.random() * 9000000).toString();
  return prefix + subscriberNumber;
}

/** Random Jordan mobile for createTrader: 77|78|79 + 7 digits (e.g. 791234567). */
export function randomJordanPhoneNumber(): string {
  const prefix =
    SALES_JORDAN_PHONE_PREFIXES[Math.floor(Math.random() * SALES_JORDAN_PHONE_PREFIXES.length)];
  const subscriberNumber = Math.floor(1000000 + Math.random() * 9000000).toString();
  return prefix + subscriberNumber;
}

/** Random Jordan mobile for createBranch: +962 + 077|078|079 + 6 digits. */
export function randomJordanBranchPhoneNumber(): string {
  const prefix =
    SALES_JORDAN_BRANCH_PHONE_PREFIXES[
      Math.floor(Math.random() * SALES_JORDAN_BRANCH_PHONE_PREFIXES.length)
    ];
  const subscriberNumber = Math.floor(100000 + Math.random() * 900000).toString();
  return "+962" + prefix + subscriberNumber;
}

/** Tomorrow as `YYYY-MM-DD 00:00:00` (local). */
export function futureCollectionDate(daysAhead = 1): string {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} 00:00:00`;
}

/** Yesterday as `YYYY-MM-DD 00:00:00` (local). */
export function pastCollectionDate(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} 00:00:00`;
}

/** Valid CreateTraderSuperApp defaults for Egypt (override one field per scenario). */
export function validTraderVariables(
  overrides: Partial<{
    name: string;
    phone: string;
    vehicle_id: string;
    latitude: string;
    longitude: string;
    note: string;
    collectable_id: string;
    country_code: string;
  }> = {},
) {
  return {
    name: randomTraderName(),
    phone: randomPhoneNumber(),
    vehicle_id: "2",
    latitude: "30.044420",
    longitude: "31.235712",
    note: "Cairo Egypt",
    collectable_id: "1",
    country_code: SALES_EGYPT_GRAPHQL_COUNTRY_CODE,
    ...overrides,
  };
}

/** Valid CreateTraderSuperApp defaults for Saudi. */
export function validSaudiTraderVariables(
  overrides: Partial<{
    name: string;
    phone: string;
    vehicle_id: string;
    latitude: string;
    longitude: string;
    note: string;
    collectable_id: string;
    country_code: string;
  }> = {},
) {
  return {
    name: randomTraderName(),
    phone: randomSaudiPhoneNumber(),
    vehicle_id: "2",
    latitude: SALES_SAUDI_DEFAULT_LATITUDE,
    longitude: SALES_SAUDI_DEFAULT_LONGITUDE,
    note: "Riyadh Saudi",
    collectable_id: String(SALES_SAUDI_COLLECTABLE_ID),
    country_code: SALES_SAUDI_GRAPHQL_COUNTRY_CODE,
    ...overrides,
  };
}

/** Valid CreateTraderSuperApp defaults for Jordan. */
export function validJordanTraderVariables(
  overrides: Partial<{
    name: string;
    phone: string;
    vehicle_id: string;
    latitude: string;
    longitude: string;
    note: string;
    collectable_id: string;
    country_code: string;
  }> = {},
) {
  return {
    name: randomTraderName(),
    phone: randomJordanPhoneNumber(),
    vehicle_id: "2",
    latitude: SALES_JORDAN_DEFAULT_LATITUDE,
    longitude: SALES_JORDAN_DEFAULT_LONGITUDE,
    note: "Amman Jordan",
    collectable_id: String(SALES_JORDAN_COLLECTABLE_ID),
    country_code: SALES_JORDAN_GRAPHQL_COUNTRY_CODE,
    ...overrides,
  };
}

/** Valid CreateTraderRequestSalesAgent defaults. */
export function validTraderRequestVariables(
  traderId: string,
  overrides: Partial<{
    collectable_id: string | number;
    measure_id: string | number;
    count: number;
    price: number;
    collection_date: string;
  }> = {},
) {
  return {
    trader_id: traderId,
    collectable_id: 1,
    measure_id: 2,
    count: 10,
    price: 10.12,
    collection_date: futureCollectionDate(),
    ...overrides,
  };
}

/** Valid CreateTraderRequestSalesAgent defaults for Saudi. */
export function validSaudiTraderRequestVariables(
  traderId: string,
  overrides: Partial<{
    collectable_id: string | number;
    measure_id: string | number;
    count: number;
    price: number;
    collection_date: string;
  }> = {},
) {
  return validTraderRequestVariables(traderId, {
    collectable_id: SALES_SAUDI_COLLECTABLE_ID,
    measure_id: SALES_SAUDI_MEASURE_ID,
    ...overrides,
  });
}

/** Valid CreateTraderRequestSalesAgent defaults for Jordan. */
export function validJordanTraderRequestVariables(
  traderId: string,
  overrides: Partial<{
    collectable_id: string | number;
    measure_id: string | number;
    count: number;
    price: number;
    collection_date: string;
  }> = {},
) {
  return validTraderRequestVariables(traderId, {
    collectable_id: SALES_JORDAN_COLLECTABLE_ID,
    measure_id: SALES_JORDAN_MEASURE_ID,
    ...overrides,
  });
}

/** Negative-only: CreateTraderRequestSalesAgent payload without trader_id. */
export function validTraderRequestWithoutTraderIdVariables(
  overrides: Partial<{
    collectable_id: string | number;
    measure_id: string | number;
    count: number;
    price: number;
    collection_date: string;
  }> = {},
) {
  return {
    collectable_id: "1",
    measure_id: "2",
    count: 10,
    price: 10.12,
    collection_date: futureCollectionDate(),
    ...overrides,
  };
}

/** Negative-only: CreateTraderRequestSalesAgent with empty collectables. */
export function validTraderRequestEmptyCollectablesVariables(
  traderId: string,
  overrides: Partial<{ collection_date: string }> = {},
) {
  return {
    trader_id: traderId,
    collection_date: futureCollectionDate(),
    ...overrides,
  };
}

/** Valid CreateBusinessRequestSuperApp defaults (override one field per scenario). */
export function validBusinessRequestVariables(
  branchId: string,
  overrides: Partial<CreateBusinessRequestSuperAppData> = {},
): CreateBusinessRequestSuperAppData {
  return {
    branch_id: branchId,
    collectable_id: 1,
    measure_id: 2,
    count: 10,
    price: 10,
    collection_date: futureCollectionDate(1),
    collection_time: "10:00",
    ...overrides,
  };
}

/**
 * Resolve branch for createBusinessRequestSuperApp:
 * prefer branchId.json from createBranch (+ signed via signContractSuperApp),
 * otherwise fall back to env contracted branch.
 */
export function requireBusinessRequestBranchId(): string {
  try {
    return requireSavedBranchId();
  } catch {
    const fromEnv = (process.env.SALES_CONTRACTED_BRANCH_ID || process.env.BRANCH_ID || "").trim();
    if (fromEnv) {
      return fromEnv;
    }
    throw new Error(
      "A Branch ID is required: run createBranch first, or set SALES_CONTRACTED_BRANCH_ID.",
    );
  }
}

/** Human-readable failure when backend rejects with CONTRACT_MISSING. */
export function contractMissingFailureMessage(branchId: string, backendError: string): string {
  return `
====================================================
CreateBusinessRequestSuperApp blocked by CONTRACT_MISSING

Branch ID:
${branchId}

Backend Error:
${backendError}

Why:
The backend requires a signed service contract on this branch before creating a request.
Fresh branches from createBranch often have no signed contract.

Fix:
Set SALES_CONTRACTED_BRANCH_ID in .env to a branch id that already has a signed contract
(for business client ${SALES_CREATE_BRANCH_BUSINESS_CLIENT_ID}), then re-run.

====================================================
`.trim();
}

/** Clear Expected / Actual / Reason text for negative validation assertions. */
export function expectedValidationErrorMessage(expected: string, actual: string): string {
  return `Expected:
${expected}

Actual:
${actual || "(empty — no GraphQL error message was returned)"}

Reason:
The backend did not return the expected validation error.`;
}

/** Clear failure when createBusinessRequestSuperApp returns GraphQL errors. */
export function businessRequestFailureMessage(branchId: string, backendError: string): string {
  return `CreateBusinessRequestSuperApp failed.

Business Client ID: ${SALES_CREATE_BRANCH_BUSINESS_CLIENT_ID}

Branch ID: ${branchId}

Backend Error:

${backendError}`;
}

/** Throw a clear prerequisite error when the backend returns CONTRACT_MISSING. */
export function rejectIfContractMissing(branchId: string, actualError: string): void {
  if (actualError.includes("CONTRACT_MISSING")) {
    throw new Error(contractMissingFailureMessage(branchId, actualError));
  }
}

/** Valid updateSalesAgent locale payload. */
export function validUpdateSalesAgentVariables(
  id: string | number,
  overrides: Partial<{ locale: string }> = {},
) {
  return {
    id,
    locale: "EN",
    ...overrides,
  };
}

/** Shared invalid IDs / field values for Sales API negative scenarios. */
export const INVALID_BUSINESS_CLIENT_ID = -1;
export const INVALID_COLLECTABLE_ID = 999999;
export const INVALID_MEASURE_ID = 999999;
export const INVALID_VEHICLE_ID = "999999";
export const INVALID_TRADER_ID = "-1";
export const INVALID_BRANCH_ID = "-1";
export const INVALID_PHONE_SHORT = "123";
export const INVALID_PHONE_BRANCH = "12345";
export const INVALID_PHONE_UPDATE = "abc-invalid";
export const INVALID_TRADER_NAME_EMPTY = "";
export const INVALID_LOCALE = "ZZ";
export const INVALID_COUNT_NEGATIVE = -1;
export const INVALID_COUNT_NEGATIVE_TEN = -10;
export const INVALID_COUNT_ZERO = 0;
export const INVALID_PRICE_NEGATIVE = -10;
export const INVALID_COLLECTION_DATE = "ABC";
export const INVALID_COLLECTION_DATE_UNPARSEABLE = "1990-01-01 not-a-valid-time";
export const LOCALE_AR = "AR";
export const LOCALE_EN = "EN";

/** Invalid pickup coordinates for createTraderSuperApp (out of coverage). */
export const INVALID_PICKUP_COORDINATES = {
  latitude: "999",
  longitude: "999",
} as const;

/** Invalid coordinates for createBranch (out of coverage). */
export const INVALID_BRANCH_COORDINATES = {
  latitude: "500",
  longitude: "500",
} as const;

/** Fixed collection date used by valid createTraderRequestSalesAgent scenarios. */
export const VALID_TRADER_REQUEST_COLLECTION_DATE = "2026-11-20 00:00:00";

/** Expected backend validation message substrings for Sales API negative tests. */
export const EXPECTED_ERRORS = {
  invalidTraderPhone: "The phone number is invalid",
  emptyTraderName: "The name field is required",
  duplicatePhone: "Phone number is already taken",
  invalidVehicleId: "selected vehicle id is invalid",
  collectablesNotFound: "collectables not found",
  invalidPickupCoordinates: "Green Pan does not cover this area",
  invalidTraderId: "selected trader id is invalid",
  // Same production mutation; missing required GraphQL variables.
  missingTraderId: "trader_id",
  invalidCollectableOrMeasure: "Invalid collectable or measure selected",
  countAtLeastOne: "count must be at least 1",
  priceBelowOneEgp: "Price cannot be set below 1 EGP",
  errorNumber: "Error Number:",
  collectionDateInPast: "Collection date cannot be in the past",
  // Same production mutation; missing required collectable variables.
  collectablesRequired: "collectable_id",
  invalidBusinessClientId: "The selected business client id is invalid",
  invalidBranchCollectable: "You have already set the first scale for this trip load",
  phone: "phone",
  already: "already",
  branch: "branch",
  collectable: "collectable",
  measure: "measure",
  count: "count",
  // Same production mutation; invalid LocaleType values.
  unknownArgumentName: "Expected type LocaleType",
  expectedLocaleType: "Expected type LocaleType",
  unknownArgumentPhone: "Expected type LocaleType",
  idRequired: 'Variable "$id"',
} as const;

// --- Named invalid / edge-case payloads (use these from tests; do not inline overrides) ---

export function invalidBusinessClientBranchVariables() {
  return validBranchVariables({ business_client_id: INVALID_BUSINESS_CLIENT_ID });
}

export function invalidCollectableBranchVariables() {
  return validBranchVariables({ collectable_id: INVALID_COLLECTABLE_ID });
}

export function invalidPhoneBranchVariables() {
  return validBranchVariables({ phone: INVALID_PHONE_BRANCH });
}

export function duplicatePhoneBranchVariables(phone: string) {
  return validBranchVariables({ phone });
}

export function invalidCoordinatesBranchVariables() {
  return validBranchVariables({ ...INVALID_BRANCH_COORDINATES });
}

export function invalidPhoneTraderVariables() {
  return validTraderVariables({ phone: INVALID_PHONE_SHORT });
}

export function emptyNameTraderVariables() {
  return validTraderVariables({ name: INVALID_TRADER_NAME_EMPTY });
}

export function duplicatePhoneTraderVariables(phone: string) {
  return validTraderVariables({ phone });
}

export function invalidVehicleTraderVariables() {
  return validTraderVariables({ vehicle_id: INVALID_VEHICLE_ID });
}

export function invalidCollectableTraderVariables() {
  return validTraderVariables({ collectable_id: String(INVALID_COLLECTABLE_ID) });
}

export function invalidPickupCoordinatesTraderVariables() {
  return validTraderVariables({ ...INVALID_PICKUP_COORDINATES });
}

export function invalidTraderIdRequestVariables() {
  return validTraderRequestVariables(INVALID_TRADER_ID);
}

export function missingTraderIdRequestVariables() {
  return validTraderRequestWithoutTraderIdVariables();
}

export function invalidCollectableTraderRequestVariables(traderId: string) {
  return validTraderRequestVariables(traderId, {
    collectable_id: INVALID_COLLECTABLE_ID,
  });
}

export function invalidMeasureTraderRequestVariables(traderId: string) {
  return validTraderRequestVariables(traderId, {
    measure_id: INVALID_MEASURE_ID,
  });
}

export function negativeCountTraderRequestVariables(traderId: string) {
  return validTraderRequestVariables(traderId, {
    count: INVALID_COUNT_NEGATIVE,
  });
}

export function zeroCountTraderRequestVariables(traderId: string) {
  return validTraderRequestVariables(traderId, {
    count: INVALID_COUNT_ZERO,
  });
}

export function negativePriceTraderRequestVariables(traderId: string) {
  return validTraderRequestVariables(traderId, {
    price: INVALID_PRICE_NEGATIVE,
  });
}

export function invalidCollectionDateTraderRequestVariables(traderId: string) {
  return validTraderRequestVariables(traderId, {
    collection_date: INVALID_COLLECTION_DATE,
  });
}

export function pastCollectionDateTraderRequestVariables(traderId: string) {
  return validTraderRequestVariables(traderId, {
    collection_date: pastCollectionDate(),
  });
}

export function emptyCollectablesTraderRequestVariables(traderId: string) {
  return validTraderRequestEmptyCollectablesVariables(traderId);
}

export function invalidCollectableBusinessRequestVariables(branchId: string) {
  return validBusinessRequestVariables(branchId, {
    collectable_id: INVALID_COLLECTABLE_ID,
  });
}

export function invalidMeasureBusinessRequestVariables(branchId: string) {
  return validBusinessRequestVariables(branchId, {
    measure_id: INVALID_MEASURE_ID,
  });
}

export function negativeCountBusinessRequestVariables(branchId: string) {
  return validBusinessRequestVariables(branchId, {
    count: INVALID_COUNT_NEGATIVE_TEN,
  });
}

export function zeroCountBusinessRequestVariables(branchId: string) {
  return validBusinessRequestVariables(branchId, {
    count: INVALID_COUNT_ZERO,
  });
}

export function negativePriceBusinessRequestVariables(branchId: string) {
  return validBusinessRequestVariables(branchId, {
    price: INVALID_PRICE_NEGATIVE,
  });
}

export function invalidCollectionDateBusinessRequestVariables(branchId: string) {
  return validBusinessRequestVariables(branchId, {
    collection_date: INVALID_COLLECTION_DATE_UNPARSEABLE,
  });
}

export function emptyCollectablesBusinessRequestVariables(branchId: string) {
  return {
    branch_id: branchId,
    collection_date: futureCollectionDate(1),
    collection_time: "10:00",
  };
}

export function invalidBranchIdBusinessRequestVariables() {
  return validBusinessRequestVariables(INVALID_BRANCH_ID);
}

/** Invalid locale (empty) via the production updateSalesAgent mutation. */
export function emptyNameUpdateSalesAgentVariables(id: string) {
  return { id, locale: INVALID_TRADER_NAME_EMPTY };
}

export function invalidLocaleUpdateSalesAgentVariables(id: string) {
  return { id, locale: INVALID_LOCALE };
}

/** Invalid locale-shaped value via the production updateSalesAgent mutation. */
export function invalidPhoneUpdateSalesAgentVariables(id: string) {
  return { id, locale: INVALID_PHONE_UPDATE };
}

/** Invalid locale via the production updateSalesAgent mutation. */
export function duplicatePhoneUpdateSalesAgentVariables(id: string, _phone: string) {
  return { id, locale: INVALID_LOCALE };
}

/** Omits required id so the production mutation rejects the request. */
export function missingIdUpdateSalesAgentVariables() {
  return { locale: LOCALE_EN };
}

export function arabicLocaleUpdateSalesAgentVariables(id: string) {
  return validUpdateSalesAgentVariables(id, { locale: LOCALE_AR });
}

export function englishLocaleUpdateSalesAgentVariables(id: string) {
  return validUpdateSalesAgentVariables(id, { locale: LOCALE_EN });
}

/** Tiny PNG signature used by signContractSuperApp. */
export const CONTRACT_SIGNATURE =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

/** Expected status after a successful signContractSuperApp. */
export const SIGNED_CONTRACT_STATUS = "active";

/** Valid signContractSuperApp variables for a saved Branch ID. */
export function validSignContractVariables(branchId: string) {
  return {
    branch_id: branchId,
    signature: CONTRACT_SIGNATURE,
  };
}
