import base from "./testdata.json";

const b2bConfig = base.b2b;
const b2xConfig = base.b2x;

/** Egyptian mobile: 010 / 011 / 012 / 015 + 8 digits */
export function randomPhoneNumber(): string {
  const prefixes = b2bConfig.phonePrefixes;
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = Math.floor(Math.random() * 1e8)
    .toString()
    .padStart(8, "0");
  return `${prefix}${suffix}`;
}

export function randomBranchName(): string {
  const suffix = `${Date.now()}-${Math.floor(Math.random() * 10_000)}`;
  return `${b2bConfig.branchNamePrefix}-${suffix}`;
}

export function getB2bTestData() {
  return {
    branchName: randomBranchName(),
    phone: randomPhoneNumber(),
    address: b2bConfig.address,
  };
}

export function randomTraderName(): string {
  const suffix = `${Date.now()}-${Math.floor(Math.random() * 10_000)}`;
  return `${b2xConfig.traderNamePrefix}-${suffix}`;
}

export function getB2xTestData() {
  return {
    traderName: randomTraderName(),
    phone: randomPhoneNumber(),
    address: b2xConfig.address,
    warehouseAddress: b2xConfig.warehouseAddress,
    pricePerKilo: b2xConfig.pricePerKilo,
    quantity: b2xConfig.quantity,
    notes: b2xConfig.notes,
  };
}

export const testdata = base;
