import * as dotenv from "dotenv";
import * as path from "path";

// Default matches playwright.config.ts so Sales Egypt login hits the same GraphQL host.
const environment = (process.env.ENV || "staging") as "dev" | "staging" | "uat";
dotenv.config({ path: path.resolve(process.cwd(), `.env.${environment}`) });
dotenv.config();

export const ENV = {
  ENVIRONMENT: (process.env.ENV || "staging") as "dev" | "staging" | "uat",

  /** Admin EMAIL login — B2B/B2X UI setup + default API */
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || "",
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || "",

  /** Sales App API — Egypt / Sales Agent Egypt (phone login) */
  SALES_APP_EG_PHONE: process.env.SALES_APP_EG_PHONE || "",
  SALES_APP_EG_PASSWORD: process.env.SALES_APP_EG_PASSWORD || "",
  /** Dialing code (e.g. 20) */
  SALES_APP_EG_COUNTRY_CODE: process.env.SALES_APP_EG_COUNTRY_CODE || "20",
  /** ISO country code for GraphQL login (e.g. EG) */
  SALES_APP_EG_GRAPHQL_COUNTRY_CODE: process.env.SALES_APP_EG_GRAPHQL_COUNTRY_CODE || "EG",

  /** Sales App API — Saudi (phone login) */
  SALES_APP_SA_PHONE: process.env.SALES_APP_SA_PHONE || process.env.SALES_APP_SAUDI_PHONE || "",
  SALES_APP_SA_PASSWORD:
    process.env.SALES_APP_SA_PASSWORD || process.env.SALES_APP_SAUDI_PASSWORD || "",
  SALES_APP_SA_COUNTRY_CODE:
    process.env.SALES_APP_SA_GRAPHQL_COUNTRY_CODE ||
    process.env.SALES_APP_SAUDI_GRAPHQL_COUNTRY_CODE ||
    process.env.SALES_APP_SA_COUNTRY_CODE ||
    process.env.SALES_APP_SAUDI_COUNTRY_CODE ||
    "SA",

  /** Sales App API — Jordan (phone login) */
  SALES_APP_JORDAN_PHONE: process.env.SALES_APP_JORDAN_PHONE || "",
  SALES_APP_JORDAN_PASSWORD: process.env.SALES_APP_JORDAN_PASSWORD || "",
  SALES_APP_JORDAN_COUNTRY_CODE: process.env.SALES_APP_JORDAN_COUNTRY_CODE || "962",

  /** Sales App API — Vienna (phone login) */
  SALES_APP_VIENNA_PHONE: process.env.SALES_APP_VIENNA_PHONE || "",
  SALES_APP_VIENNA_PASSWORD: process.env.SALES_APP_VIENNA_PASSWORD || "",
  SALES_APP_VIENNA_COUNTRY_CODE: process.env.SALES_APP_VIENNA_COUNTRY_CODE || "43",

  /** Collector App API (phone login) */
  COLLECTOR_APP_PHONE: process.env.COLLECTOR_APP_PHONE || "",
  COLLECTOR_APP_PASSWORD: process.env.COLLECTOR_APP_PASSWORD || "",
  COLLECTOR_APP_COUNTRY_CODE: process.env.COLLECTOR_APP_COUNTRY_CODE || "20",

  /**
   * Optional branch with a signed service contract for createBusinessRequestSuperApp.
   * Fresh branches from createBranch often return CONTRACT_MISSING without this.
   */
  SALES_CONTRACTED_BRANCH_ID: process.env.SALES_CONTRACTED_BRANCH_ID || process.env.BRANCH_ID || "",

  /** Optional defaults for admin B2B createBranch API test */
  BUSINESS_CLIENT_ID: process.env.BUSINESS_CLIENT_ID || "",
  COLLECTABLE_ID: process.env.COLLECTABLE_ID || "",
};
