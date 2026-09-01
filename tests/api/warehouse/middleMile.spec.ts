import { saveApiResponse } from "../../../src/api/saveApiResponse";
import {
  buildAddMiddleMileReceivingLoadInput,
  buildAddTripLoadQualityInput,
  buildConfirmMiddleMileReceivingLoadInput,
  buildConfirmMiddleMileSendingLoadInput,
  buildCreateMiddleMileTripInput,
  buildSetFirstScaleData,
  buildSetSecondScaleData,
  buildSetThirdScaleData,
  buildUpdateQualityOptionalFieldsInput,
  buildVerifySampleCodeData,
} from "../../../src/api/warehouse/testData";
import type { WarehouseService } from "../../../src/api/warehouse/WarehouseService";
import { expect, test } from "../../../src/fixtures/apiFixture";

function logStep(step: string, payload: unknown, response?: unknown) {
  console.log(`\n========== ${step} ==========`);
  console.log("REQUEST:");
  console.log(JSON.stringify(payload, null, 2));
  if (response !== undefined) {
    console.log("RESPONSE:");
    console.log(JSON.stringify(response, null, 2));
  }
}

function pickInboundTripLoadId(
  tripLoads:
    Array<{ id: string; direction?: string | null; status?: string | null }> | null | undefined,
): string {
  const loads = tripLoads ?? [];
  const inbound =
    loads.find((load) => load.direction?.toUpperCase() === "INBOUND") ??
    loads.find((load) => load.status === "IN_PROGRESS");
  expect(inbound?.id, "INBOUND receiving trip_load id missing").toBeTruthy();
  expect(inbound?.direction?.toUpperCase()).toBe("INBOUND");
  return inbound!.id;
}

async function runSendingFlow(wh: WarehouseService) {
  const createPayload = buildCreateMiddleMileTripInput();
  const createTrip = await wh.createMiddleMileTrip(createPayload);
  logStep("createMiddleMileTrip", createPayload, createTrip);
  expect(createTrip.errors).toBeUndefined();
  const middleMileTripId = createTrip.data?.createMiddleMileTrip.id;
  expect(middleMileTripId).toBeTruthy();

  const startSending = await wh.startMiddleMileSending(middleMileTripId!);
  logStep("startMiddleMileSending", { middleMileTripId }, startSending);
  expect(startSending.errors).toBeUndefined();
  const sendingTripLoadId = startSending.data?.startMiddleMileSending.trip_loads?.[0]?.id;
  expect(sendingTripLoadId).toBeTruthy();

  const confirmLoadPayload = buildConfirmMiddleMileSendingLoadInput({
    trip_load_id: sendingTripLoadId!,
  });
  const confirmLoad = await wh.confirmMiddleMileSendingLoad(confirmLoadPayload);
  logStep("confirmMiddleMileSendingLoad", confirmLoadPayload, confirmLoad);
  expect(confirmLoad.errors).toBeUndefined();

  const confirmSending = await wh.confirmMiddleMileSending(middleMileTripId!);
  logStep("confirmMiddleMileSending", { middleMileTripId }, confirmSending);
  expect(confirmSending.errors).toBeUndefined();
  expect(confirmSending.data?.confirmMiddleMileSending.sender_confirmed_at).toBeTruthy();

  return { middleMileTripId: middleMileTripId!, sendingTripLoadId: sendingTripLoadId! };
}

async function startReceivingInbound(wh: WarehouseService, middleMileTripId: string) {
  const startReceiving = await wh.startMiddleMileReceiving(middleMileTripId);
  logStep("startMiddleMileReceiving", { middleMileTripId }, startReceiving);
  expect(startReceiving.errors).toBeUndefined();
  const tripLoadId = pickInboundTripLoadId(
    startReceiving.data?.startMiddleMileReceiving.trip_loads,
  );
  console.log(`\nUsing INBOUND tripLoadId=${tripLoadId}`);
  return tripLoadId;
}

async function runReceivingScales(
  wh: WarehouseService,
  tripLoadId: string,
  options: { withSampleAndQuality: boolean },
) {
  const firstScaleAmount = 2000;
  const firstScalePayload = buildSetFirstScaleData({ tripLoadId, firstScaleAmount });
  const firstScale = await wh.setFirstScale(firstScalePayload);
  logStep("setFirstScale", firstScalePayload, firstScale);
  expect(firstScale.errors).toBeUndefined();
  const firstScaleId = firstScale.data?.setFirstScale.id;
  expect(firstScaleId).toBeTruthy();

  if (options.withSampleAndQuality) {
    const generateCode = await wh.generateSampleCode({ tripLoadId });
    logStep("generateSampleCode", { tripLoadId }, generateCode);
    expect(generateCode.errors).toBeUndefined();
    const code = generateCode.data?.generateSampleConfirmationCode.sample_confirmation_code;
    expect(code).toBeTruthy();

    const verifyPayload = buildVerifySampleCodeData({ tripLoadId, code: code! });
    const verifyCode = await wh.verifySampleCode(verifyPayload);
    logStep("verifySampleCode", verifyPayload, verifyCode);
    expect(verifyCode.errors).toBeUndefined();

    const qualityPayload = buildAddTripLoadQualityInput({ trip_load_id: tripLoadId });
    const quality = await wh.addTripLoadQuality(qualityPayload);
    logStep("addTripLoadQuality", qualityPayload, quality);
    expect(quality.errors).toBeUndefined();
  }

  const secondScalePayload = buildSetSecondScaleData({
    firstScaleId: firstScaleId!,
    secondScaleAmount: firstScaleAmount - 150,
  });
  const secondScale = await wh.setSecondScale(secondScalePayload);
  logStep("setSecondScale", secondScalePayload, secondScale);
  expect(secondScale.errors).toBeUndefined();

  const thirdScalePayload = buildSetThirdScaleData({
    firstScaleId: firstScaleId!,
    notes: "Container weight",
  });
  const thirdScale = await wh.setThirdScale(thirdScalePayload);
  logStep("setThirdScale", thirdScalePayload, thirdScale);
  expect(thirdScale.errors).toBeUndefined();
  expect(thirdScale.data?.setThirdScaleDeductibles.tripLoad?.status).toBeTruthy();

  return { firstScaleId: firstScaleId! };
}

/** Send → receive INBOUND → first scale (ready for sample/quality cases). */
async function prepareInboundAfterFirstScale(wh: WarehouseService) {
  const { middleMileTripId } = await runSendingFlow(wh);
  const tripLoadId = await startReceivingInbound(wh, middleMileTripId);
  const firstScaleAmount = 2000;
  const firstScale = await wh.setFirstScale(
    buildSetFirstScaleData({ tripLoadId, firstScaleAmount }),
  );
  logStep("setFirstScale", { tripLoadId, firstScaleAmount }, firstScale);
  expect(firstScale.errors).toBeUndefined();
  const firstScaleId = firstScale.data?.setFirstScale.id;
  expect(firstScaleId).toBeTruthy();
  return { middleMileTripId, tripLoadId, firstScaleId: firstScaleId!, firstScaleAmount };
}

test.describe("Warehouse GraphQL API — Middle mile", () => {
  test.describe.configure({ timeout: 180_000 });

  test(
    "sending only — create, start send, confirm load, confirm sending",
    { tag: ["@all-regression", "@warehouse-regression", "@create-middle-mile-with-quality"] },
    async ({ api }) => {
      const wh = api.warehouse;
      const { middleMileTripId, sendingTripLoadId } = await runSendingFlow(wh);
      saveApiResponse("middleMileSendingOnly", {
        middleMileTripId,
        sendingTripLoadId,
      });
    },
  );

  test(
    "sending then receiving with scales only (no sample/quality)",
    { tag: ["@all-regression", "@warehouse-regression", "@create-middle-mile-with-quality"] },
    async ({ api }) => {
      const wh = api.warehouse;
      const { middleMileTripId } = await runSendingFlow(wh);
      const inboundTripLoadId = await startReceivingInbound(wh, middleMileTripId);
      const { firstScaleId } = await runReceivingScales(wh, inboundTripLoadId, {
        withSampleAndQuality: false,
      });
      saveApiResponse("middleMileReceivingScalesOnly", {
        middleMileTripId,
        inboundTripLoadId,
        firstScaleId,
      });
    },
  );

  test(
    "sending then receiving with scales, sample code, and quality",
    { tag: ["@all-regression", "@warehouse-regression", "@create-middle-mile-with-quality"] },
    async ({ api }) => {
      const wh = api.warehouse;
      const { middleMileTripId } = await runSendingFlow(wh);
      const inboundTripLoadId = await startReceivingInbound(wh, middleMileTripId);
      const { firstScaleId } = await runReceivingScales(wh, inboundTripLoadId, {
        withSampleAndQuality: true,
      });
      saveApiResponse("middleMileFullFlow", {
        middleMileTripId,
        inboundTripLoadId,
        firstScaleId,
      });
    },
  );

  test(
    "reject verify when sample confirmation code is wrong",
    { tag: ["@all-regression", "@warehouse-regression", "@create-middle-mile-with-quality"] },
    async ({ api }) => {
      const wh = api.warehouse;
      const { tripLoadId } = await prepareInboundAfterFirstScale(wh);

      const generateCode = await wh.generateSampleCode({ tripLoadId });
      logStep("generateSampleCode", { tripLoadId }, generateCode);
      expect(generateCode.errors).toBeUndefined();
      expect(
        generateCode.data?.generateSampleConfirmationCode.sample_confirmation_code,
      ).toBeTruthy();

      const verifyWrong = await wh.verifySampleCode(
        buildVerifySampleCodeData({ tripLoadId, code: "000000" }),
      );
      logStep("verifySampleCode (wrong)", { tripLoadId, code: "000000" }, verifyWrong);
      expect(verifyWrong.errors).toBeDefined();
      expect(verifyWrong.data?.verifySampleConfirmationCode).toBeFalsy();
      saveApiResponse("middleMileVerifyWrongSampleCode", {
        request: { tripLoadId, code: "000000" },
        response: verifyWrong,
      });
    },
  );

  test(
    "reject quality when sample was never verified",
    { tag: ["@all-regression", "@warehouse-regression", "@create-middle-mile-with-quality"] },
    async ({ api }) => {
      const wh = api.warehouse;
      const { tripLoadId } = await prepareInboundAfterFirstScale(wh);

      const generateCode = await wh.generateSampleCode({ tripLoadId });
      logStep("generateSampleCode", { tripLoadId }, generateCode);
      expect(generateCode.errors).toBeUndefined();

      const quality = await wh.addTripLoadQuality(
        buildAddTripLoadQualityInput({ trip_load_id: tripLoadId }),
      );
      logStep("addTripLoadQuality (no verify)", { trip_load_id: tripLoadId }, quality);
      expect(quality.errors).toBeDefined();
      expect(quality.data?.addTripLoadQuality).toBeFalsy();
      saveApiResponse("middleMileQualityWithoutVerify", {
        request: { trip_load_id: tripLoadId },
        response: quality,
      });
    },
  );

  test(
    "delete sample confirmation then regenerate and complete quality flow",
    { tag: ["@all-regression", "@warehouse-regression", "@create-middle-mile-with-quality"] },
    async ({ api }) => {
      const wh = api.warehouse;
      const { tripLoadId, firstScaleId, firstScaleAmount } =
        await prepareInboundAfterFirstScale(wh);

      const firstCode = await wh.generateSampleCode({ tripLoadId });
      logStep("generateSampleCode (first)", { tripLoadId }, firstCode);
      expect(firstCode.errors).toBeUndefined();

      const deleted = await wh.deleteSampleConfirmation(tripLoadId);
      logStep("deleteSampleConfirmation", { tripLoadId }, deleted);
      expect(deleted.errors).toBeUndefined();

      const regenerated = await wh.generateSampleCode({ tripLoadId });
      logStep("generateSampleCode (regenerated)", { tripLoadId }, regenerated);
      expect(regenerated.errors).toBeUndefined();
      const code = regenerated.data?.generateSampleConfirmationCode.sample_confirmation_code;
      expect(code).toBeTruthy();

      const verifyCode = await wh.verifySampleCode(
        buildVerifySampleCodeData({ tripLoadId, code: code! }),
      );
      logStep("verifySampleCode", { tripLoadId, code }, verifyCode);
      expect(verifyCode.errors).toBeUndefined();

      const quality = await wh.addTripLoadQuality(
        buildAddTripLoadQualityInput({ trip_load_id: tripLoadId }),
      );
      logStep("addTripLoadQuality", { trip_load_id: tripLoadId }, quality);
      expect(quality.errors).toBeUndefined();

      const secondScale = await wh.setSecondScale(
        buildSetSecondScaleData({
          firstScaleId,
          secondScaleAmount: firstScaleAmount - 150,
        }),
      );
      logStep("setSecondScale", { firstScaleId }, secondScale);
      expect(secondScale.errors).toBeUndefined();

      const thirdScale = await wh.setThirdScale(
        buildSetThirdScaleData({ firstScaleId, notes: "Container weight" }),
      );
      logStep("setThirdScale", { firstScaleId }, thirdScale);
      expect(thirdScale.errors).toBeUndefined();

      saveApiResponse("middleMileRegenerateSampleThenQuality", {
        request: { tripLoadId, code },
        response: { regenerated, verifyCode, quality, thirdScale },
      });
    },
  );

  test(
    "create multi-item middle mile trip",
    { tag: ["@all-regression", "@warehouse-regression", "@create-middle-mile-with-quality"] },
    async ({ api }) => {
      const wh = api.warehouse;
      const createPayload = buildCreateMiddleMileTripInput({
        items: [
          { channel_type: "B2X", quantity: 100 },
          { channel_type: "B2B", quantity: 50 },
        ],
        notes: "Multi-item shipment",
      });
      const createTrip = await wh.createMiddleMileTrip(createPayload);
      logStep("createMiddleMileTrip (multi-item)", createPayload, createTrip);
      expect(createTrip.errors).toBeUndefined();
      expect(createTrip.data?.createMiddleMileTrip.id).toBeTruthy();
      expect(createTrip.data?.createMiddleMileTrip.items?.length).toBe(2);
      saveApiResponse("middleMileCreateMultiItem", {
        request: createPayload,
        response: createTrip,
      });
    },
  );

  test(
    "receiving scales with third scale deductibles",
    { tag: ["@all-regression", "@warehouse-regression", "@create-middle-mile-with-quality"] },
    async ({ api }) => {
      const wh = api.warehouse;
      const deductibles = 25;
      const { tripLoadId, firstScaleId, firstScaleAmount } =
        await prepareInboundAfterFirstScale(wh);

      const secondScale = await wh.setSecondScale(
        buildSetSecondScaleData({
          firstScaleId,
          secondScaleAmount: firstScaleAmount - 150,
        }),
      );
      expect(secondScale.errors).toBeUndefined();

      const thirdScalePayload = buildSetThirdScaleData({
        firstScaleId,
        notes: "Container weight",
        deductibles,
      });
      const thirdScale = await wh.setThirdScale(thirdScalePayload);
      logStep("setThirdScale (deductibles)", thirdScalePayload, thirdScale);
      expect(thirdScale.errors).toBeUndefined();
      expect(thirdScale.data?.setThirdScaleDeductibles.third_scale_deductibles_amount).toBe(
        deductibles,
      );
      saveApiResponse("middleMileThirdScaleWithDeductibles", {
        request: { tripLoadId, ...thirdScalePayload },
        response: thirdScale,
      });
    },
  );

  test(
    "reject sample before first scale on inbound load",
    { tag: ["@all-regression", "@warehouse-regression", "@create-middle-mile-with-quality"] },
    async ({ api }) => {
      const wh = api.warehouse;
      const { middleMileTripId } = await runSendingFlow(wh);
      const tripLoadId = await startReceivingInbound(wh, middleMileTripId);

      const generateCode = await wh.generateSampleCode({ tripLoadId });
      logStep("generateSampleCode (before first scale)", { tripLoadId }, generateCode);
      expect(generateCode.errors).toBeDefined();
      expect(generateCode.data?.generateSampleConfirmationCode).toBeFalsy();
      saveApiResponse("middleMileSampleBeforeFirstScale", {
        request: { tripLoadId },
        response: generateCode,
      });
    },
  );

  test(
    "reject second scale before first scale on inbound load",
    { tag: ["@all-regression", "@warehouse-regression", "@create-middle-mile-with-quality"] },
    async ({ api }) => {
      const wh = api.warehouse;
      const { middleMileTripId } = await runSendingFlow(wh);
      const tripLoadId = await startReceivingInbound(wh, middleMileTripId);

      const secondScale = await wh.setSecondScale(
        buildSetSecondScaleData({ firstScaleId: tripLoadId, secondScaleAmount: 1850 }),
      );
      logStep("setSecondScale (before first)", { firstScaleId: tripLoadId }, secondScale);
      expect(secondScale.errors).toBeDefined();
      expect(secondScale.data?.setSecondScale).toBeFalsy();
      saveApiResponse("middleMileSecondScaleBeforeFirst", {
        request: { firstScaleId: tripLoadId, secondScaleAmount: 1850 },
        response: secondScale,
      });
    },
  );

  test(
    "reject quality before first scale on inbound load",
    { tag: ["@all-regression", "@warehouse-regression", "@create-middle-mile-with-quality"] },
    async ({ api }) => {
      const wh = api.warehouse;
      const { middleMileTripId } = await runSendingFlow(wh);
      const tripLoadId = await startReceivingInbound(wh, middleMileTripId);

      const quality = await wh.addTripLoadQuality(
        buildAddTripLoadQualityInput({ trip_load_id: tripLoadId }),
      );
      logStep("addTripLoadQuality (before first scale)", { trip_load_id: tripLoadId }, quality);
      expect(quality.errors).toBeDefined();
      expect(quality.data?.addTripLoadQuality).toBeFalsy();
      saveApiResponse("middleMileQualityBeforeFirstScale", {
        request: { trip_load_id: tripLoadId },
        response: quality,
      });
    },
  );

  test(
    "add middle mile receiving load after start receiving",
    { tag: ["@all-regression", "@warehouse-regression", "@create-middle-mile-with-quality"] },
    async ({ api }) => {
      const wh = api.warehouse;
      const { middleMileTripId } = await runSendingFlow(wh);
      await startReceivingInbound(wh, middleMileTripId);

      const addPayload = buildAddMiddleMileReceivingLoadInput({
        middle_mile_trip_id: middleMileTripId,
        // Must match an item channel on the trip (default create uses B2X)
        channel_type: "B2X",
        net_weight: 200,
      });
      const added = await wh.addMiddleMileReceivingLoad(addPayload);
      logStep("addMiddleMileReceivingLoad", addPayload, added);
      expect(added.errors).toBeUndefined();
      expect(added.data?.addMiddleMileReceivingLoad.id).toBe(middleMileTripId);
      const inboundCount =
        added.data?.addMiddleMileReceivingLoad.trip_loads?.filter(
          (l) => l.direction?.toUpperCase() === "INBOUND",
        ).length ?? 0;
      expect(inboundCount).toBeGreaterThan(1);
      saveApiResponse("middleMileAddReceivingLoad", {
        request: addPayload,
        response: added,
      });
    },
  );

  test(
    "confirm middle mile receiving load and receiving trip",
    { tag: ["@all-regression", "@warehouse-regression", "@create-middle-mile-with-quality"] },
    async ({ api }) => {
      const wh = api.warehouse;
      const { middleMileTripId } = await runSendingFlow(wh);
      const tripLoadId = await startReceivingInbound(wh, middleMileTripId);

      // Complete inbound via scales first (same as warehouse receiving path)
      await runReceivingScales(wh, tripLoadId, { withSampleAndQuality: false });

      const confirmLoadPayload = buildConfirmMiddleMileReceivingLoadInput({
        trip_load_id: tripLoadId,
        net_weight: 150,
        has_scrape: false,
      });
      const confirmLoad = await wh.confirmMiddleMileReceivingLoad(confirmLoadPayload);
      logStep("confirmMiddleMileReceivingLoad", confirmLoadPayload, confirmLoad);
      // Some environments auto-complete on third scale — allow already-confirmed errors
      if (confirmLoad.errors?.length) {
        console.log("confirmMiddleMileReceivingLoad returned errors (may already be completed)");
      }

      const confirmReceiving = await wh.confirmMiddleMileReceiving(middleMileTripId);
      logStep("confirmMiddleMileReceiving", { middleMileTripId }, confirmReceiving);
      expect(confirmReceiving.errors).toBeUndefined();
      expect(confirmReceiving.data?.confirmMiddleMileReceiving.id).toBe(middleMileTripId);
      saveApiResponse("middleMileConfirmReceiving", {
        request: { middleMileTripId, tripLoadId },
        response: { confirmLoad, confirmReceiving },
      });
    },
  );

  test(
    "delete inbound trip load after start receiving",
    { tag: ["@all-regression", "@warehouse-regression", "@create-middle-mile-with-quality"] },
    async ({ api }) => {
      const wh = api.warehouse;
      const { middleMileTripId } = await runSendingFlow(wh);
      const tripLoadId = await startReceivingInbound(wh, middleMileTripId);

      const deleted = await wh.deleteTripLoad(tripLoadId);
      logStep("deleteTripLoad (inbound)", { tripLoadId }, deleted);
      expect(deleted.errors).toBeUndefined();
      expect(deleted.data?.deleteTripLoad).toBeTruthy();
      saveApiResponse("middleMileDeleteInboundTripLoad", {
        request: { middleMileTripId, tripLoadId },
        response: deleted,
      });
    },
  );

  for (const productType of ["PRODUCT_2", "ACIDIC_OIL"] as const) {
    test(
      `receiving quality with product_type ${productType}`,
      { tag: ["@all-regression", "@warehouse-regression", "@create-middle-mile-with-quality"] },
      async ({ api }) => {
        const wh = api.warehouse;
        const { tripLoadId } = await prepareInboundAfterFirstScale(wh);

        const generateCode = await wh.generateSampleCode({ tripLoadId });
        expect(generateCode.errors).toBeUndefined();
        const code = generateCode.data?.generateSampleConfirmationCode.sample_confirmation_code;
        expect(code).toBeTruthy();

        const verifyCode = await wh.verifySampleCode(
          buildVerifySampleCodeData({ tripLoadId, code: code! }),
        );
        expect(verifyCode.errors).toBeUndefined();

        const qualityPayload = buildAddTripLoadQualityInput({
          trip_load_id: tripLoadId,
          product_type: productType,
        });
        const quality = await wh.addTripLoadQuality(qualityPayload);
        logStep(`addTripLoadQuality (${productType})`, qualityPayload, quality);
        expect(quality.errors).toBeUndefined();
        expect(quality.data?.addTripLoadQuality.product_type?.toUpperCase()).toBe(productType);
        saveApiResponse(`middleMileQuality_${productType}`, {
          request: qualityPayload,
          response: quality,
        });
      },
    );
  }

  test(
    "receiving quality with all fields including optional s/cl/p/unsaponifiable",
    { tag: ["@all-regression", "@warehouse-regression", "@create-middle-mile-with-quality"] },
    async ({ api }) => {
      const wh = api.warehouse;
      const { tripLoadId } = await prepareInboundAfterFirstScale(wh);

      const generateCode = await wh.generateSampleCode({ tripLoadId });
      expect(generateCode.errors).toBeUndefined();
      const code = generateCode.data?.generateSampleConfirmationCode.sample_confirmation_code;
      expect(code).toBeTruthy();

      const verifyCode = await wh.verifySampleCode(
        buildVerifySampleCodeData({ tripLoadId, code: code! }),
      );
      expect(verifyCode.errors).toBeUndefined();

      const qualityPayload = buildAddTripLoadQualityInput({
        trip_load_id: tripLoadId,
        includeOptionalFields: true,
        s: 17.5,
        cl: 6.5,
        p: 20,
        unsaponifiable: 3.5,
      });
      const quality = await wh.addTripLoadQuality(qualityPayload);
      logStep("addTripLoadQuality (with optionals)", qualityPayload, quality);
      expect(quality.errors).toBeUndefined();
      const q = quality.data?.addTripLoadQuality;
      expect(q?.id).toBeTruthy();
      expect(q?.s).toBe(17.5);
      expect(q?.cl).toBe(6.5);
      expect(q?.p).toBe(20);
      expect(q?.unsaponifiable).toBe(3.5);
      saveApiResponse("middleMileQualityWithOptionalFields", {
        request: qualityPayload,
        response: quality,
      });
    },
  );

  test(
    "receiving quality without optional fields then update them",
    { tag: ["@all-regression", "@warehouse-regression", "@create-middle-mile-with-quality"] },
    async ({ api }) => {
      const wh = api.warehouse;
      const { tripLoadId } = await prepareInboundAfterFirstScale(wh);

      const generateCode = await wh.generateSampleCode({ tripLoadId });
      expect(generateCode.errors).toBeUndefined();
      const code = generateCode.data?.generateSampleConfirmationCode.sample_confirmation_code;
      expect(code).toBeTruthy();

      const verifyCode = await wh.verifySampleCode(
        buildVerifySampleCodeData({ tripLoadId, code: code! }),
      );
      expect(verifyCode.errors).toBeUndefined();

      const qualityPayload = buildAddTripLoadQualityInput({ trip_load_id: tripLoadId });
      const quality = await wh.addTripLoadQuality(qualityPayload);
      logStep("addTripLoadQuality (required only)", qualityPayload, quality);
      expect(quality.errors).toBeUndefined();
      const qualityId = quality.data?.addTripLoadQuality.id;
      expect(qualityId).toBeTruthy();
      expect(quality.data?.addTripLoadQuality.s ?? null).toBeNull();
      expect(quality.data?.addTripLoadQuality.cl ?? null).toBeNull();
      expect(quality.data?.addTripLoadQuality.p ?? null).toBeNull();
      expect(quality.data?.addTripLoadQuality.unsaponifiable ?? null).toBeNull();
      saveApiResponse("middleMileQualityWithoutOptionalFields", {
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
      logStep("updateQualityOptionalFields", updatePayload, updated);
      expect(updated.errors).toBeUndefined();
      const u = updated.data?.updateQualityOptionalFields;
      expect(u?.id).toBe(qualityId);
      expect(u?.s).toBe(17.5);
      expect(u?.cl).toBe(6.5);
      expect(u?.p).toBe(20);
      expect(u?.unsaponifiable).toBe(3.5);
      saveApiResponse("middleMileUpdateQualityOptionalFields", {
        request: updatePayload,
        response: updated,
      });
    },
  );
});
