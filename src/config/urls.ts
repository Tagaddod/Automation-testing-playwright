import { ENVIRONMENTS } from "./environments";
import { ENV } from "./env";

type EnvKeys = keyof typeof ENVIRONMENTS; // "dev" | "staging" | "uat"

// نقول لـ TypeScript إن ENV.ENVIRONMENT بالظبط من النوع EnvKeys
const current = ENVIRONMENTS[ENV.ENVIRONMENT as EnvKeys];

export const URLs = {
  graphql: current.GRAPHQL_URL,

  greenpan: {
    base: current.GREENPAN_BASE_URL,
    auth: `${current.GREENPAN_BASE_URL}/auth?token=`
  },

  b2b: {
    base: current.B2B_BASE_URL,
    auth: `${current.B2B_BASE_URL}/auth?token=`
  },

  b2x: {
    base: current.B2X_BASE_URL,
    auth: `${current.B2B_BASE_URL}/auth?token=`,
  },

  
};
