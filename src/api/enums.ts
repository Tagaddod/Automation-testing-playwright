/** GraphQL enum values used as B2B query/mutation arguments. */

/** Matches the server-side `Channel` GraphQL enum. */
export enum Channel {
  B2C = "B2C",
  B2B = "B2B",
  B2X = "B2X",
  PORT = "PORT",
}

/** ISO country codes accepted by collectable queries. */
export enum CountryCode {
  EG = "EG",
  SA = "SA",
  JO = "JO",
  AT = "AT",
}

/** Trader type values accepted by trader creation queries. */
export enum TraderType {
  TRADER = "X",
  CARRIER = "X-lans",
}
