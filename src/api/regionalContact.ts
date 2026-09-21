/** Riyadh coordinates used by Sales / webform Saudi scenarios. */
export const SAUDI_LATITUDE = "24.718594538080318";
export const SAUDI_LONGITUDE = "46.67802396464344";

/** Amman coordinates used by Sales / webform Jordan scenarios. */
export const JORDAN_LATITUDE = "31.9539";
export const JORDAN_LONGITUDE = "35.9106";

const SAUDI_MOBILE_PREFIXES = ["50"] as const;
const JORDAN_MOBILE_PREFIXES = ["79"] as const;

function randomDigits(length: number): string {
  return Math.floor(Math.random() * 10 ** length)
    .toString()
    .padStart(length, "0");
}

function pick<T extends readonly string[]>(values: T): T[number] {
  return values[Math.floor(Math.random() * values.length)]!;
}

/** Saudi local mobile without leading 0: 50XXXXXXX (createTrader). */
export function randomSaudiLocalPhone(): string {
  return `${pick(SAUDI_MOBILE_PREFIXES)}${randomDigits(7)}`;
}

/** Saudi branch mobile with leading 0: 05XXXXXXXX (createBranch). */
export function randomSaudiBranchPhone(): string {
  return `0${randomSaudiLocalPhone()}`;
}

/** Jordan local mobile without leading 0: 79XXXXXXX (createTrader). */
export function randomJordanLocalPhone(): string {
  return `${pick(JORDAN_MOBILE_PREFIXES)}${randomDigits(7)}`;
}

/** Jordan branch mobile with leading 0: 079 + 7 digits (createBranch). */
export function randomJordanBranchPhone(): string {
  return `0${pick(JORDAN_MOBILE_PREFIXES)}${Math.floor(1_000_000 + Math.random() * 9_000_000)}`;
}
