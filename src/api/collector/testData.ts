import type { CollectorTripRequest, RequestCollectableInput } from "./CollectorService";

export function buildCollectedRequestItems(
  request: CollectorTripRequest,
): RequestCollectableInput[] {
  return (request.requestCollectables ?? []).flatMap((item) => {
    if (!item.collectable?.id || !item.measure?.id) {
      return [];
    }

    return [
      {
        collectable_id: item.collectable.id,
        measure_id: item.measure.id,
        quantity: item.quantity ?? 0,
      },
    ];
  });
}
