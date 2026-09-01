import { saveApiResponse } from "../../../src/api/saveApiResponse";
import {
  buildAddTripLoadQualityInput,
  buildCreateTripLoadData,
  buildSetFirstScaleData,
  buildSetSecondScaleData,
  buildSetThirdScaleData,
  buildUpdateQualityOptionalFieldsInput,
  buildVerifySampleCodeData,
} from "../../../src/api/warehouse/testData";
import { expect, test } from "../../../src/fixtures/apiFixture";

function tripLoadEnv() {
  const tripId = process.env.WAREHOUSE_TRIP_ID;
  const channelType = process.env.WAREHOUSE_CHANNEL_TYPE ?? "B2B";
  return { tripId, channelType };
}

test.describe("Warehouse GraphQL API — trip load", () => {
  test.describe.configure({ timeout: 180_000 });

  test(
    "create trip load then delete it",
    { tag: ["@all-regression", "@warehouse-regression", "@create-trip-load-with-quality"] },
    async ({ api }) => {
      const { tripId, channelType } = tripLoadEnv();
      test.skip(!tripId, "Set WAREHOUSE_TRIP_ID to a valid trip id");

      const wh = api.warehouse;

      const createPayload = buildCreateTripLoadData({ tripId: tripId!, channelType });
      const createLoad = await wh.createTripLoad(createPayload);
      expect(createLoad.errors).toBeUndefined();
      const tripLoadId = createLoad.data?.createTripLoad.id;
      expect(tripLoadId, "createTripLoad did not return id").toBeTruthy();
      saveApiResponse("warehouseCreateThenDeleteCreate", {
        request: createPayload,
        response: createLoad,
      });

      const deleted = await wh.deleteTripLoad(tripLoadId!);
      expect(deleted.errors).toBeUndefined();
      expect(deleted.data?.deleteTripLoad).toBeTruthy();
      saveApiResponse("warehouseCreateThenDelete", {
        request: { trip_load_id: tripLoadId },
        response: deleted,
      });
    },
  );

  test(
    "create trip load then first, second, and third scale",
    { tag: ["@all-regression", "@warehouse-regression", "@create-trip-load-with-quality"] },
    async ({ api }) => {
      const { tripId, channelType } = tripLoadEnv();
      test.skip(!tripId, "Set WAREHOUSE_TRIP_ID to a valid trip id");

      const wh = api.warehouse;

      const createPayload = buildCreateTripLoadData({ tripId: tripId!, channelType });
      const createLoad = await wh.createTripLoad(createPayload);
      expect(createLoad.errors).toBeUndefined();
      const tripLoadId = createLoad.data?.createTripLoad.id;
      expect(tripLoadId, "createTripLoad did not return id").toBeTruthy();
      saveApiResponse("warehouseScalesCreateTripLoad", {
        request: createPayload,
        response: createLoad,
      });

      const firstScaleAmount = 2000;
      const firstScalePayload = buildSetFirstScaleData({
        tripLoadId: tripLoadId!,
        firstScaleAmount,
      });
      const firstScale = await wh.setFirstScale(firstScalePayload);
      expect(firstScale.errors).toBeUndefined();
      const firstScaleId = firstScale.data?.setFirstScale.id;
      expect(firstScaleId, "setFirstScale did not return id").toBeTruthy();
      expect(firstScale.data?.setFirstScale.first_scale_amount).toBe(firstScaleAmount);
      saveApiResponse("warehouseScalesSetFirstScale", {
        request: firstScalePayload,
        response: firstScale,
      });

      const secondScaleAmount = firstScaleAmount - 150;
      const secondScalePayload = buildSetSecondScaleData({
        firstScaleId: firstScaleId!,
        secondScaleAmount,
      });
      const secondScale = await wh.setSecondScale(secondScalePayload);
      expect(secondScale.errors).toBeUndefined();
      expect(secondScale.data?.setSecondScale.id).toBeTruthy();
      expect(secondScale.data?.setSecondScale.second_scale_amount).toBe(secondScaleAmount);
      saveApiResponse("warehouseScalesSetSecondScale", {
        request: secondScalePayload,
        response: secondScale,
      });

      const thirdScalePayload = buildSetThirdScaleData({
        firstScaleId: firstScaleId!,
        notes: "Container weight",
      });
      const thirdScale = await wh.setThirdScale(thirdScalePayload);
      expect(thirdScale.errors).toBeUndefined();
      expect(thirdScale.data?.setThirdScaleDeductibles.id).toBe(firstScaleId);
      saveApiResponse("warehouseScalesSetThirdScale", {
        request: thirdScalePayload,
        response: thirdScale,
      });
    },
  );

  test(
    "create sample confirmation then delete it so quality cannot proceed",
    { tag: ["@all-regression", "@warehouse-regression", "@create-trip-load-with-quality"] },
    async ({ api }) => {
      const { tripId, channelType } = tripLoadEnv();
      test.skip(!tripId, "Set WAREHOUSE_TRIP_ID to a valid trip id");

      const wh = api.warehouse;

      const createPayload = buildCreateTripLoadData({ tripId: tripId!, channelType });
      const createLoad = await wh.createTripLoad(createPayload);
      expect(createLoad.errors).toBeUndefined();
      const tripLoadId = createLoad.data?.createTripLoad.id;
      expect(tripLoadId, "createTripLoad did not return id").toBeTruthy();

      const firstScale = await wh.setFirstScale(
        buildSetFirstScaleData({ tripLoadId: tripLoadId!, firstScaleAmount: 2000 }),
      );
      expect(firstScale.errors).toBeUndefined();
      expect(firstScale.data?.setFirstScale.id).toBeTruthy();

      const generateCode = await wh.generateSampleCode({ tripLoadId: tripLoadId! });
      expect(generateCode.errors).toBeUndefined();
      const code = generateCode.data?.generateSampleConfirmationCode.sample_confirmation_code;
      expect(code, "generateSampleConfirmationCode did not return code").toBeTruthy();
      saveApiResponse("warehouseGenerateSampleCodeBeforeDelete", {
        request: { tripLoadId },
        response: generateCode,
      });

      const deleted = await wh.deleteSampleConfirmation(tripLoadId!);
      expect(deleted.errors).toBeUndefined();
      expect(deleted.data?.deleteSampleConfirmation.id).toBeTruthy();
      saveApiResponse("warehouseDeleteSampleConfirmation", {
        request: { tripLoadId },
        response: deleted,
      });

      // After delete, quality flow must not proceed
      const quality = await wh.addTripLoadQuality(
        buildAddTripLoadQualityInput({ trip_load_id: tripLoadId! }),
      );
      expect(quality.errors).toBeDefined();
      expect(quality.data?.addTripLoadQuality).toBeFalsy();
      saveApiResponse("warehouseQualityBlockedAfterSampleDelete", {
        request: { trip_load_id: tripLoadId },
        response: quality,
      });
    },
  );

  test(
    "create trip load then scales, sample code, and quality",
    { tag: ["@all-regression", "@warehouse-regression", "@create-trip-load-with-quality"] },
    async ({ api }) => {
      const { tripId, channelType } = tripLoadEnv();
      test.skip(!tripId, "Set WAREHOUSE_TRIP_ID to a valid trip id");

      const wh = api.warehouse;

      const createPayload = buildCreateTripLoadData({ tripId: tripId!, channelType });
      const createLoad = await wh.createTripLoad(createPayload);
      expect(createLoad.errors).toBeUndefined();
      const tripLoadId = createLoad.data?.createTripLoad.id;
      expect(tripLoadId, "createTripLoad did not return id").toBeTruthy();
      saveApiResponse("warehouseCreateTripLoad", {
        request: createPayload,
        response: createLoad,
      });

      const firstScaleAmount = 2000;
      const firstScalePayload = buildSetFirstScaleData({
        tripLoadId: tripLoadId!,
        firstScaleAmount,
      });
      const firstScale = await wh.setFirstScale(firstScalePayload);
      expect(firstScale.errors).toBeUndefined();
      const firstScaleId = firstScale.data?.setFirstScale.id;
      expect(firstScaleId, "setFirstScale did not return id").toBeTruthy();
      saveApiResponse("warehouseSetFirstScale", {
        request: firstScalePayload,
        response: firstScale,
      });

      const generatePayload = { tripLoadId: tripLoadId! };
      const generateCode = await wh.generateSampleCode(generatePayload);
      expect(generateCode.errors).toBeUndefined();
      const code = generateCode.data?.generateSampleConfirmationCode.sample_confirmation_code;
      expect(code, "generateSampleConfirmationCode did not return code").toBeTruthy();
      saveApiResponse("warehouseGenerateSampleCode", {
        request: generatePayload,
        response: generateCode,
      });

      const verifyPayload = buildVerifySampleCodeData({ tripLoadId: tripLoadId!, code: code! });
      const verifyCode = await wh.verifySampleCode(verifyPayload);
      expect(verifyCode.errors).toBeUndefined();
      expect(verifyCode.data?.verifySampleConfirmationCode.id).toBeTruthy();
      saveApiResponse("warehouseVerifySampleCode", {
        request: verifyPayload,
        response: verifyCode,
      });

      const qualityPayload = buildAddTripLoadQualityInput({ trip_load_id: tripLoadId! });
      const quality = await wh.addTripLoadQuality(qualityPayload);
      expect(quality.errors).toBeUndefined();
      expect(quality.data?.addTripLoadQuality.id).toBeTruthy();
      saveApiResponse("warehouseAddTripLoadQuality", {
        request: qualityPayload,
        response: quality,
      });

      const secondScalePayload = buildSetSecondScaleData({
        firstScaleId: firstScaleId!,
        secondScaleAmount: firstScaleAmount - 150,
      });
      const secondScale = await wh.setSecondScale(secondScalePayload);
      expect(secondScale.errors).toBeUndefined();
      expect(secondScale.data?.setSecondScale.id).toBeTruthy();
      saveApiResponse("warehouseSetSecondScale", {
        request: secondScalePayload,
        response: secondScale,
      });

      const thirdScalePayload = buildSetThirdScaleData({
        firstScaleId: firstScaleId!,
        notes: "Container weight",
      });
      const thirdScale = await wh.setThirdScale(thirdScalePayload);
      expect(thirdScale.errors).toBeUndefined();
      expect(thirdScale.data?.setThirdScaleDeductibles.id).toBe(firstScaleId);
      saveApiResponse("warehouseSetThirdScale", {
        request: thirdScalePayload,
        response: thirdScale,
      });
    },
  );

  test(
    "reject verify when sample confirmation code is wrong",
    { tag: ["@all-regression", "@warehouse-regression", "@create-trip-load-with-quality"] },
    async ({ api }) => {
      const { tripId, channelType } = tripLoadEnv();
      test.skip(!tripId, "Set WAREHOUSE_TRIP_ID to a valid trip id");

      const wh = api.warehouse;

      const createLoad = await wh.createTripLoad(
        buildCreateTripLoadData({ tripId: tripId!, channelType }),
      );
      expect(createLoad.errors).toBeUndefined();
      const tripLoadId = createLoad.data?.createTripLoad.id;
      expect(tripLoadId).toBeTruthy();

      const firstScale = await wh.setFirstScale(
        buildSetFirstScaleData({ tripLoadId: tripLoadId!, firstScaleAmount: 2000 }),
      );
      expect(firstScale.errors).toBeUndefined();

      const generateCode = await wh.generateSampleCode({ tripLoadId: tripLoadId! });
      expect(generateCode.errors).toBeUndefined();
      expect(
        generateCode.data?.generateSampleConfirmationCode.sample_confirmation_code,
      ).toBeTruthy();

      const verifyWrong = await wh.verifySampleCode(
        buildVerifySampleCodeData({ tripLoadId: tripLoadId!, code: "000000" }),
      );
      expect(verifyWrong.errors).toBeDefined();
      expect(verifyWrong.data?.verifySampleConfirmationCode).toBeFalsy();
      saveApiResponse("warehouseVerifyWrongSampleCode", {
        request: { tripLoadId, code: "000000" },
        response: verifyWrong,
      });
    },
  );

  test(
    "reject quality when sample was never verified",
    { tag: ["@all-regression", "@warehouse-regression", "@create-trip-load-with-quality"] },
    async ({ api }) => {
      const { tripId, channelType } = tripLoadEnv();
      test.skip(!tripId, "Set WAREHOUSE_TRIP_ID to a valid trip id");

      const wh = api.warehouse;

      const createLoad = await wh.createTripLoad(
        buildCreateTripLoadData({ tripId: tripId!, channelType }),
      );
      expect(createLoad.errors).toBeUndefined();
      const tripLoadId = createLoad.data?.createTripLoad.id;
      expect(tripLoadId).toBeTruthy();

      const firstScale = await wh.setFirstScale(
        buildSetFirstScaleData({ tripLoadId: tripLoadId!, firstScaleAmount: 2000 }),
      );
      expect(firstScale.errors).toBeUndefined();

      const generateCode = await wh.generateSampleCode({ tripLoadId: tripLoadId! });
      expect(generateCode.errors).toBeUndefined();

      // Skip verify — quality must fail
      const quality = await wh.addTripLoadQuality(
        buildAddTripLoadQualityInput({ trip_load_id: tripLoadId! }),
      );
      expect(quality.errors).toBeDefined();
      expect(quality.data?.addTripLoadQuality).toBeFalsy();
      saveApiResponse("warehouseQualityWithoutVerify", {
        request: { trip_load_id: tripLoadId },
        response: quality,
      });
    },
  );

  test(
    "delete sample confirmation then regenerate and complete quality flow",
    { tag: ["@all-regression", "@warehouse-regression", "@create-trip-load-with-quality"] },
    async ({ api }) => {
      const { tripId, channelType } = tripLoadEnv();
      test.skip(!tripId, "Set WAREHOUSE_TRIP_ID to a valid trip id");

      const wh = api.warehouse;
      const firstScaleAmount = 2000;

      const createLoad = await wh.createTripLoad(
        buildCreateTripLoadData({ tripId: tripId!, channelType }),
      );
      expect(createLoad.errors).toBeUndefined();
      const tripLoadId = createLoad.data?.createTripLoad.id;
      expect(tripLoadId).toBeTruthy();

      const firstScale = await wh.setFirstScale(
        buildSetFirstScaleData({ tripLoadId: tripLoadId!, firstScaleAmount }),
      );
      expect(firstScale.errors).toBeUndefined();
      const firstScaleId = firstScale.data?.setFirstScale.id;
      expect(firstScaleId).toBeTruthy();

      const firstCode = await wh.generateSampleCode({ tripLoadId: tripLoadId! });
      expect(firstCode.errors).toBeUndefined();

      const deleted = await wh.deleteSampleConfirmation(tripLoadId!);
      expect(deleted.errors).toBeUndefined();

      const regenerated = await wh.generateSampleCode({ tripLoadId: tripLoadId! });
      expect(regenerated.errors).toBeUndefined();
      const code = regenerated.data?.generateSampleConfirmationCode.sample_confirmation_code;
      expect(code).toBeTruthy();

      const verifyCode = await wh.verifySampleCode(
        buildVerifySampleCodeData({ tripLoadId: tripLoadId!, code: code! }),
      );
      expect(verifyCode.errors).toBeUndefined();

      const quality = await wh.addTripLoadQuality(
        buildAddTripLoadQualityInput({ trip_load_id: tripLoadId! }),
      );
      expect(quality.errors).toBeUndefined();

      const secondScale = await wh.setSecondScale(
        buildSetSecondScaleData({
          firstScaleId: firstScaleId!,
          secondScaleAmount: firstScaleAmount - 150,
        }),
      );
      expect(secondScale.errors).toBeUndefined();

      const thirdScale = await wh.setThirdScale(
        buildSetThirdScaleData({ firstScaleId: firstScaleId!, notes: "Container weight" }),
      );
      expect(thirdScale.errors).toBeUndefined();
      saveApiResponse("warehouseRegenerateSampleThenQuality", {
        request: { tripLoadId, code },
        response: { regenerated, verifyCode, quality, thirdScale },
      });
    },
  );

  test(
    "create trip load then scales with third scale deductibles",
    { tag: ["@all-regression", "@warehouse-regression", "@create-trip-load-with-quality"] },
    async ({ api }) => {
      const { tripId, channelType } = tripLoadEnv();
      test.skip(!tripId, "Set WAREHOUSE_TRIP_ID to a valid trip id");

      const wh = api.warehouse;
      const firstScaleAmount = 2000;
      const deductibles = 25;

      const createLoad = await wh.createTripLoad(
        buildCreateTripLoadData({ tripId: tripId!, channelType }),
      );
      expect(createLoad.errors).toBeUndefined();
      const tripLoadId = createLoad.data?.createTripLoad.id;
      expect(tripLoadId).toBeTruthy();

      const firstScale = await wh.setFirstScale(
        buildSetFirstScaleData({ tripLoadId: tripLoadId!, firstScaleAmount }),
      );
      expect(firstScale.errors).toBeUndefined();
      const firstScaleId = firstScale.data?.setFirstScale.id;
      expect(firstScaleId).toBeTruthy();

      const secondScale = await wh.setSecondScale(
        buildSetSecondScaleData({
          firstScaleId: firstScaleId!,
          secondScaleAmount: firstScaleAmount - 150,
        }),
      );
      expect(secondScale.errors).toBeUndefined();

      const thirdScalePayload = buildSetThirdScaleData({
        firstScaleId: firstScaleId!,
        notes: "Container weight",
        deductibles,
      });
      const thirdScale = await wh.setThirdScale(thirdScalePayload);
      saveApiResponse("warehouseThirdScaleWithDeductibles", {
        request: thirdScalePayload,
        response: thirdScale,
      });

      const tripEnded = thirdScale.errors?.some((e) => /trip end/i.test(e.message));
      test.skip(
        !!tripEnded,
        "WAREHOUSE_TRIP_ID trip is ended; third-scale deductibles need an active trip (covered by middle-mile deductibles test)",
      );

      expect(thirdScale.errors).toBeUndefined();
      expect(thirdScale.data?.setThirdScaleDeductibles.third_scale_deductibles_amount).toBe(
        deductibles,
      );
    },
  );

  test(
    "reject sample before first scale",
    { tag: ["@all-regression", "@warehouse-regression", "@create-trip-load-with-quality"] },
    async ({ api }) => {
      const { tripId, channelType } = tripLoadEnv();
      test.skip(!tripId, "Set WAREHOUSE_TRIP_ID to a valid trip id");

      const wh = api.warehouse;
      const createLoad = await wh.createTripLoad(
        buildCreateTripLoadData({ tripId: tripId!, channelType }),
      );
      expect(createLoad.errors).toBeUndefined();
      const tripLoadId = createLoad.data?.createTripLoad.id;
      expect(tripLoadId).toBeTruthy();

      const generateCode = await wh.generateSampleCode({ tripLoadId: tripLoadId! });
      expect(generateCode.errors).toBeDefined();
      expect(generateCode.data?.generateSampleConfirmationCode).toBeFalsy();
      saveApiResponse("warehouseSampleBeforeFirstScale", {
        request: { tripLoadId },
        response: generateCode,
      });
    },
  );

  test(
    "reject second scale before first scale",
    { tag: ["@all-regression", "@warehouse-regression", "@create-trip-load-with-quality"] },
    async ({ api }) => {
      const { tripId, channelType } = tripLoadEnv();
      test.skip(!tripId, "Set WAREHOUSE_TRIP_ID to a valid trip id");

      const wh = api.warehouse;
      const createLoad = await wh.createTripLoad(
        buildCreateTripLoadData({ tripId: tripId!, channelType }),
      );
      expect(createLoad.errors).toBeUndefined();
      const tripLoadId = createLoad.data?.createTripLoad.id;
      expect(tripLoadId).toBeTruthy();

      // Use tripLoadId as fake firstScaleId — second scale must fail without a real first scale
      const secondScale = await wh.setSecondScale(
        buildSetSecondScaleData({ firstScaleId: tripLoadId!, secondScaleAmount: 1850 }),
      );
      expect(secondScale.errors).toBeDefined();
      expect(secondScale.data?.setSecondScale).toBeFalsy();
      saveApiResponse("warehouseSecondScaleBeforeFirst", {
        request: { firstScaleId: tripLoadId, secondScaleAmount: 1850 },
        response: secondScale,
      });
    },
  );

  test(
    "reject quality before first scale",
    { tag: ["@all-regression", "@warehouse-regression", "@create-trip-load-with-quality"] },
    async ({ api }) => {
      const { tripId, channelType } = tripLoadEnv();
      test.skip(!tripId, "Set WAREHOUSE_TRIP_ID to a valid trip id");

      const wh = api.warehouse;
      const createLoad = await wh.createTripLoad(
        buildCreateTripLoadData({ tripId: tripId!, channelType }),
      );
      expect(createLoad.errors).toBeUndefined();
      const tripLoadId = createLoad.data?.createTripLoad.id;
      expect(tripLoadId).toBeTruthy();

      const quality = await wh.addTripLoadQuality(
        buildAddTripLoadQualityInput({ trip_load_id: tripLoadId! }),
      );
      expect(quality.errors).toBeDefined();
      expect(quality.data?.addTripLoadQuality).toBeFalsy();
      saveApiResponse("warehouseQualityBeforeFirstScale", {
        request: { trip_load_id: tripLoadId },
        response: quality,
      });
    },
  );

  test(
    "reject createTripLoad with invalid trip id",
    { tag: ["@all-regression", "@warehouse-regression", "@create-trip-load-with-quality"] },
    async ({ api }) => {
      const channelType = tripLoadEnv().channelType;
      const wh = api.warehouse;
      const invalidTripId = "999999999";

      const createLoad = await wh.createTripLoad(
        buildCreateTripLoadData({ tripId: invalidTripId, channelType }),
      );
      expect(createLoad.errors).toBeDefined();
      expect(createLoad.data?.createTripLoad).toBeFalsy();
      saveApiResponse("warehouseCreateTripLoadInvalidTripId", {
        request: { tripId: invalidTripId, channelType },
        response: createLoad,
      });
    },
  );

  for (const productType of ["PRODUCT_2", "ACIDIC_OIL"] as const) {
    test(
      `create trip load quality with product_type ${productType}`,
      { tag: ["@all-regression", "@warehouse-regression", "@create-trip-load-with-quality"] },
      async ({ api }) => {
        const { tripId, channelType } = tripLoadEnv();
        test.skip(!tripId, "Set WAREHOUSE_TRIP_ID to a valid trip id");

        const wh = api.warehouse;
        const createLoad = await wh.createTripLoad(
          buildCreateTripLoadData({ tripId: tripId!, channelType }),
        );
        expect(createLoad.errors).toBeUndefined();
        const tripLoadId = createLoad.data?.createTripLoad.id;
        expect(tripLoadId).toBeTruthy();

        const firstScale = await wh.setFirstScale(
          buildSetFirstScaleData({ tripLoadId: tripLoadId!, firstScaleAmount: 2000 }),
        );
        expect(firstScale.errors).toBeUndefined();

        const generateCode = await wh.generateSampleCode({ tripLoadId: tripLoadId! });
        expect(generateCode.errors).toBeUndefined();
        const code = generateCode.data?.generateSampleConfirmationCode.sample_confirmation_code;
        expect(code).toBeTruthy();

        const verifyCode = await wh.verifySampleCode(
          buildVerifySampleCodeData({ tripLoadId: tripLoadId!, code: code! }),
        );
        expect(verifyCode.errors).toBeUndefined();

        const qualityPayload = buildAddTripLoadQualityInput({
          trip_load_id: tripLoadId!,
          product_type: productType,
        });
        const quality = await wh.addTripLoadQuality(qualityPayload);
        expect(quality.errors).toBeUndefined();
        expect(quality.data?.addTripLoadQuality.product_type?.toUpperCase()).toBe(productType);
        saveApiResponse(`warehouseQuality_${productType}`, {
          request: qualityPayload,
          response: quality,
        });
      },
    );
  }

  test(
    "create trip load quality with all fields including optional s/cl/p/unsaponifiable",
    { tag: ["@all-regression", "@warehouse-regression", "@create-trip-load-with-quality"] },
    async ({ api }) => {
      const { tripId, channelType } = tripLoadEnv();
      test.skip(!tripId, "Set WAREHOUSE_TRIP_ID to a valid trip id");

      const wh = api.warehouse;
      const createLoad = await wh.createTripLoad(
        buildCreateTripLoadData({ tripId: tripId!, channelType }),
      );
      expect(createLoad.errors).toBeUndefined();
      const tripLoadId = createLoad.data?.createTripLoad.id;
      expect(tripLoadId).toBeTruthy();

      const firstScale = await wh.setFirstScale(
        buildSetFirstScaleData({ tripLoadId: tripLoadId!, firstScaleAmount: 2000 }),
      );
      expect(firstScale.errors).toBeUndefined();

      const generateCode = await wh.generateSampleCode({ tripLoadId: tripLoadId! });
      expect(generateCode.errors).toBeUndefined();
      const code = generateCode.data?.generateSampleConfirmationCode.sample_confirmation_code;
      expect(code).toBeTruthy();

      const verifyCode = await wh.verifySampleCode(
        buildVerifySampleCodeData({ tripLoadId: tripLoadId!, code: code! }),
      );
      expect(verifyCode.errors).toBeUndefined();

      const qualityPayload = buildAddTripLoadQualityInput({
        trip_load_id: tripLoadId!,
        includeOptionalFields: true,
        s: 17.5,
        cl: 6.5,
        p: 20,
        unsaponifiable: 3.5,
      });
      const quality = await wh.addTripLoadQuality(qualityPayload);
      expect(quality.errors).toBeUndefined();
      const q = quality.data?.addTripLoadQuality;
      expect(q?.id).toBeTruthy();
      expect(q?.s).toBe(17.5);
      expect(q?.cl).toBe(6.5);
      expect(q?.p).toBe(20);
      expect(q?.unsaponifiable).toBe(3.5);
      saveApiResponse("warehouseQualityWithOptionalFields", {
        request: qualityPayload,
        response: quality,
      });
    },
  );

  test(
    "create trip load quality without optional fields then update them",
    { tag: ["@all-regression", "@warehouse-regression", "@create-trip-load-with-quality"] },
    async ({ api }) => {
      const { tripId, channelType } = tripLoadEnv();
      test.skip(!tripId, "Set WAREHOUSE_TRIP_ID to a valid trip id");

      const wh = api.warehouse;
      const createLoad = await wh.createTripLoad(
        buildCreateTripLoadData({ tripId: tripId!, channelType }),
      );
      expect(createLoad.errors).toBeUndefined();
      const tripLoadId = createLoad.data?.createTripLoad.id;
      expect(tripLoadId).toBeTruthy();

      const firstScale = await wh.setFirstScale(
        buildSetFirstScaleData({ tripLoadId: tripLoadId!, firstScaleAmount: 2000 }),
      );
      expect(firstScale.errors).toBeUndefined();

      const generateCode = await wh.generateSampleCode({ tripLoadId: tripLoadId! });
      expect(generateCode.errors).toBeUndefined();
      const code = generateCode.data?.generateSampleConfirmationCode.sample_confirmation_code;
      expect(code).toBeTruthy();

      const verifyCode = await wh.verifySampleCode(
        buildVerifySampleCodeData({ tripLoadId: tripLoadId!, code: code! }),
      );
      expect(verifyCode.errors).toBeUndefined();

      const qualityPayload = buildAddTripLoadQualityInput({ trip_load_id: tripLoadId! });
      const quality = await wh.addTripLoadQuality(qualityPayload);
      expect(quality.errors).toBeUndefined();
      const qualityId = quality.data?.addTripLoadQuality.id;
      expect(qualityId).toBeTruthy();
      expect(quality.data?.addTripLoadQuality.s ?? null).toBeNull();
      expect(quality.data?.addTripLoadQuality.cl ?? null).toBeNull();
      expect(quality.data?.addTripLoadQuality.p ?? null).toBeNull();
      expect(quality.data?.addTripLoadQuality.unsaponifiable ?? null).toBeNull();
      saveApiResponse("warehouseQualityWithoutOptionalFields", {
        request: qualityPayload,
        response: quality,
      });

      const updatePayload = buildUpdateQualityOptionalFieldsInput({
        trip_load_quality_id: qualityId!,
        s: 17.5,
        cl: 6.5,
        p: 20,
        unsaponifiable: 3.5,
      });
      const updated = await wh.updateQualityOptionalFields(updatePayload);
      expect(updated.errors).toBeUndefined();
      const u = updated.data?.updateQualityOptionalFields;
      expect(u?.id).toBe(qualityId);
      expect(u?.s).toBe(17.5);
      expect(u?.cl).toBe(6.5);
      expect(u?.p).toBe(20);
      expect(u?.unsaponifiable).toBe(3.5);
      saveApiResponse("warehouseUpdateQualityOptionalFields", {
        request: updatePayload,
        response: updated,
      });
    },
  );

  test(
    "reject create trip load when channel is not on the trip",
    { tag: ["@all-regression", "@warehouse-regression", "@create-trip-load-with-quality"] },
    async ({ api }) => {
      const tripId = process.env.WAREHOUSE_TRIP_ID;
      test.skip(!tripId, "Set WAREHOUSE_TRIP_ID to a valid trip id");

      const wh = api.warehouse;
      // Trip 33969 is B2B-only — B2X must be rejected
      const createPayload = buildCreateTripLoadData({ tripId: tripId!, channelType: "B2X" });
      const createLoad = await wh.createTripLoad(createPayload);
      expect(createLoad.errors).toBeDefined();
      expect(createLoad.data?.createTripLoad).toBeFalsy();
      saveApiResponse("warehouseCreateTripLoadWrongChannel", {
        request: createPayload,
        response: createLoad,
      });
    },
  );

  test(
    "create trip load with matching channel from env",
    { tag: ["@all-regression", "@warehouse-regression", "@create-trip-load-with-quality"] },
    async ({ api }) => {
      const tripId = process.env.WAREHOUSE_TRIP_ID;
      const channelType = process.env.WAREHOUSE_CHANNEL_TYPE ?? "B2B";
      test.skip(!tripId, "Set WAREHOUSE_TRIP_ID to a valid trip id");

      const wh = api.warehouse;
      const createPayload = buildCreateTripLoadData({ tripId: tripId!, channelType });
      const createLoad = await wh.createTripLoad(createPayload);
      expect(createLoad.errors).toBeUndefined();
      const tripLoadId = createLoad.data?.createTripLoad.id;
      expect(tripLoadId).toBeTruthy();
      saveApiResponse("warehouseCreateTripLoadMatchingChannel", {
        request: createPayload,
        response: createLoad,
      });
      await wh.deleteTripLoad(tripLoadId!);
    },
  );
});
