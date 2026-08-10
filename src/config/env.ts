import * as dotenv from "dotenv";
import * as path from "path";

const environment = (process.env.ENV || "dev") as "dev" | "staging" | "uat";
dotenv.config({ path: path.resolve(process.cwd(), `.env.${environment}`) });
dotenv.config();

export const ENV = {
  ENVIRONMENT: (process.env.ENV || "dev") as "dev" | "staging" | "uat",

  /** Admin EMAIL login — B2B/B2X UI setup + default API */
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || "",
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || "",

  /** Sales App API — Egypt (phone login) */
  SALES_APP_EG_PHONE: process.env.SALES_APP_EG_PHONE || "",
  SALES_APP_EG_PASSWORD: process.env.SALES_APP_EG_PASSWORD || "",
  SALES_APP_EG_COUNTRY_CODE: process.env.SALES_APP_EG_COUNTRY_CODE || "20",

  /** Sales App API — Saudi (phone login) */
  SALES_APP_SA_PHONE: process.env.SALES_APP_SA_PHONE || "",
  SALES_APP_SA_PASSWORD: process.env.SALES_APP_SA_PASSWORD || "",
  SALES_APP_SA_COUNTRY_CODE: process.env.SALES_APP_SA_COUNTRY_CODE || "966",

  /** Collector App API (phone login) */
  COLLECTOR_APP_PHONE: process.env.COLLECTOR_APP_PHONE || "",
  COLLECTOR_APP_PASSWORD: process.env.COLLECTOR_APP_PASSWORD || "",
  COLLECTOR_APP_COUNTRY_CODE: process.env.COLLECTOR_APP_COUNTRY_CODE || "20",
};
