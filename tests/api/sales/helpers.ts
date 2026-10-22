import type { ApiManager } from "../../../src/api/ApiManager";
import {
  type CollectableChannel,
  fetchFirstCollectableWithMeasure,
} from "../../../src/api/collectableHelpers";
import type { CountryCode } from "../../../src/api/enums";
import { expect } from "../../../src/fixtures/apiFixture";

export type { CollectableChannel };

/** Playwright-friendly wrapper around {@link fetchFirstCollectableWithMeasure}. */
export async function getFirstCollectableWithMeasure(
  api: ApiManager,
  channel: CollectableChannel,
  countryCode: CountryCode,
): Promise<{ collectableId: string; measureId: string }> {
  try {
    return await fetchFirstCollectableWithMeasure(api, channel, countryCode);
  } catch (error) {
    expect(error, String(error)).toBeUndefined();
    throw error;
  }
}
