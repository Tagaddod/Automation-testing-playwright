import * as dotenv from "dotenv";
import * as path from "path";

const environment = (process.env.ENV || "dev") as "dev" | "staging" | "uat";
dotenv.config({ path: path.resolve(process.cwd(), `.env.${environment}`) });
dotenv.config();

export const ENV = {
  ENVIRONMENT: (process.env.ENV || "dev") as "dev" | "staging" | "uat",
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || "",
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || "",
};
