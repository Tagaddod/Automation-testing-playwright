export const ENVIRONMENTS = {
  dev: {
    GRAPHQL_URL: "https://dev2.tagaddod.com/graphql",
    CREATE_TRIPS_URL: "https://dev2.tagaddod.com/api/v2/create-trips",
    GREENPAN_BASE_URL: "https://dev-greenpan.tagaddod.com",
    B2B_BASE_URL: "https://dev-b2b.tagaddod.com",
    B2X_BASE_URL: "https://dev-b2b.tagaddod.com/trader",
  },
  staging: {
    GRAPHQL_URL: "https://staging2.tagaddod.com/graphql",
    CREATE_TRIPS_URL: "https://staging2.tagaddod.com/api/v2/create-trips",
    GREENPAN_BASE_URL: "https://staging-greenpan.tagaddod.com",
    B2B_BASE_URL: "https://staging-b2b.tagaddod.com",
    B2X_BASE_URL: "https://staging-b2b.tagaddod.com/trader",
  },
  uat: {
    GRAPHQL_URL: "https://uat.tagaddod.com/graphql",
    CREATE_TRIPS_URL: "https://uat.tagaddod.com/api/v2/create-trips",
    GREENPAN_BASE_URL: "https://uat-greenpan.tagaddod.com",
    B2B_BASE_URL: "https://uat-b2b.tagaddod.com",
    B2X_BASE_URL: "https://uat-b2b.tagaddod.com/trader",
  },
} as const; // as const to protect the values from being changed
