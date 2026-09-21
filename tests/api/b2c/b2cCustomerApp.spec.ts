import {
  b2cCollectionDate,
  buildCompensationsCollectables,
  buildCustomerRequestData,
  buildSelectedGifts,
} from "../../../src/api/b2c/testData";
import { saveApiResponse } from "../../../src/api/saveApiResponse";
import { expect, test } from "../../../src/fixtures/apiFixture";

/** Fixed collection address for the Customer App flow. */
const ADDRESS_ID = 2030;

test.describe("B2C Customer App GraphQL API", () => {
  test("get collectables", { tag: ["@all-regression", "@b2c"] }, async ({ api }) => {
    const response = await api.b2c.getCollectables();

    // Surface the real server error (data is null whenever errors exist).
    expect(
      response.errors,
      `getCollectables returned errors: ${JSON.stringify(response.errors)}`,
    ).toBeUndefined();

    const collectables = response.data?.getCollectables;
    expect(collectables?.length, "No collectables returned from getCollectables").toBeTruthy();

    const first = collectables![0];
    const collectableId = first.id;
    const measureId = first.measures?.[0]?.id;
    expect(collectableId, "First collectable has no id").toBeTruthy();
    expect(measureId, "First collectable has no measures").toBeTruthy();

    // Persist the first collectable id and measure id for the compensations / request flow.
    const filePath = saveApiResponse("b2cGetCollectables", response);
    console.log(`Saved get collectables response to ${filePath}`);
    console.log(`Collectable id: ${collectableId}, Measure id: ${measureId}`);
  });

  test("get compensations", { tag: ["@all-regression", "@b2c"] }, async ({ api }) => {
    // Provision the collectable / measure so this test stays independent.
    const collectablesResponse = await api.b2c.getCollectables();
    expect(
      collectablesResponse.errors,
      `getCollectables returned errors: ${JSON.stringify(collectablesResponse.errors)}`,
    ).toBeUndefined();

    const firstCollectable = collectablesResponse.data?.getCollectables?.[0];
    const collectableId = firstCollectable?.id;
    const measureId = firstCollectable?.measures?.[0]?.id;
    expect(collectableId, "No collectables returned from getCollectables").toBeTruthy();
    expect(measureId, "First collectable has no measures").toBeTruthy();

    const collectables = buildCompensationsCollectables({
      collectableId: collectableId!,
      measureId: measureId!,
    });
    const response = await api.b2c.getCompensations(collectables);

    // Surface the real server error (data is null whenever errors exist).
    expect(
      response.errors,
      `getCompensations returned errors: ${JSON.stringify(response.errors)}`,
    ).toBeUndefined();

    const compensation = response.data?.getCompensations;
    expect(compensation, "No compensation returned from getCompensations").toBeTruthy();
    expect(compensation?.total_points, "getCompensations returned no total_points").not.toBeNull();

    const filePath = saveApiResponse("b2cGetCompensations", response);
    console.log(`Saved get compensations response to ${filePath}`);
    console.log(
      `Collectable id: ${collectableId}, measure id: ${measureId}, count: ${collectables[0].count}`,
    );
    console.log(
      `Total points: ${compensation?.total_points}, cash: ${compensation?.cash}, gifts: ${compensation?.available_gifts?.length ?? 0}`,
    );
  });

  test(
    "create customer request flow",
    { tag: ["@all-regression", "@b2c", "@create-request"] },
    async ({ api }) => {
      const collectables = await test.step("Get collectables", async () => {
        const response = await api.b2c.getCollectables();

        expect(
          response.errors,
          `getCollectables returned errors: ${JSON.stringify(response.errors)}`,
        ).toBeUndefined();

        const first = response.data?.getCollectables?.[0];
        expect(first?.id, "No collectables returned from getCollectables").toBeTruthy();
        expect(first?.measures?.[0]?.id, "First collectable has no measures").toBeTruthy();

        // measure_id must belong to that same collectable.
        return buildCompensationsCollectables({
          collectableId: first!.id,
          measureId: first!.measures![0].id,
        });
      });

      const compensation = await test.step("Get compensations", async () => {
        const response = await api.b2c.getCompensations(collectables);

        expect(
          response.errors,
          `getCompensations returned errors: ${JSON.stringify(response.errors)}`,
        ).toBeUndefined();

        const result = response.data?.getCompensations;
        expect(result, "No compensation returned from getCompensations").toBeTruthy();
        expect(result?.available_gifts?.length, "getCompensations returned no gifts").toBeTruthy();

        return result!;
      });

      await test.step("Create customer request", async () => {
        const data = buildCustomerRequestData({
          addressId: ADDRESS_ID,
          collectableId: collectables[0].id,
          measureId: collectables[0].measure_id,
          count: collectables[0].count,
          collectionDate: b2cCollectionDate(0),
          selectedGifts: buildSelectedGifts(compensation.available_gifts ?? []),
        });

        const response = await api.b2c.createCustomerRequest(data);

        expect(
          response.errors,
          `createCustomerRequest returned errors: ${JSON.stringify(response.errors)}`,
        ).toBeUndefined();

        const request = response.data?.createCustomerRequest;
        expect(request?.id, "No request id returned from createCustomerRequest").toBeTruthy();
        expect(request?.address?.id, "Created request has no address").toBe(String(ADDRESS_ID));

        const filePath = saveApiResponse("b2cCreateCustomerRequest", response);
        console.log(`Saved create customer request response to ${filePath}`);
        console.log(
          `Request id: ${request!.id}, status: ${request!.status}, collection date: ${request!.collection_date}`,
        );
        console.log(
          `Collectable id: ${collectables[0].id}, measure id: ${collectables[0].measure_id}, count: ${collectables[0].count}, gift: ${JSON.stringify(data.selectedGifts)}`,
        );
      });
    },
  );
});
