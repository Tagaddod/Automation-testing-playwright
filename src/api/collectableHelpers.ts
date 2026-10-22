import type { ApiManager } from "./ApiManager";
import type { Channel } from "./enums";
import { CountryCode } from "./enums";

export type CollectableChannel = Channel.B2B | Channel.B2X;

export type CollectableWithMeasure = {
  collectableId: string;
  measureId: string;
};

/**
 * Resolve collectable + measure IDs from the admin catalog for the current ENV.
 * Used by Sales App and webform API tests so payloads are not tied to staging IDs.
 */
export async function fetchFirstCollectableWithMeasure(
  api: ApiManager,
  channel: CollectableChannel,
  countryCode: CountryCode = CountryCode.EG,
): Promise<CollectableWithMeasure> {
  const response = await api.b2b.getCollectables([channel], countryCode);
  if (response.errors?.length) {
    throw new Error(
      `getCollectables (${channel}, ${countryCode}) errors: ${JSON.stringify(response.errors)}`,
    );
  }

  const collectable = response.data?.getCollectables?.[0];
  if (!collectable?.id) {
    throw new Error(`No ${channel} collectables for ${countryCode}`);
  }

  const measureId = collectable.measures?.[0]?.id;
  if (!measureId) {
    throw new Error(`No measures on collectable ${collectable.id} (${countryCode})`);
  }

  return { collectableId: collectable.id, measureId };
}
