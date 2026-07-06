import { PoManager } from "../../src/core/PoManager";
import { getB2xTestData, randomTraderName } from "../../src/utils/testdata";

export async function openB2XHome(po: PoManager) {
  await po.getB2XHomePage().open();
}

export async function goToTraderForm(po: PoManager, traderName = randomTraderName()) {
  await openB2XHome(po);
  await po.getB2XHomePage().addNewTrader(traderName);
  return traderName;
}

export async function submitTraderAndProceedToCollectables(po: PoManager, traderName: string) {
  await po.getB2XFormPage().submitTraderForm();
  const success = po.getB2XTraderRegistrationSuccessPage();
  await success.assertSuccessPage(traderName);
  await success.clickCreateRequestForTrader(traderName);
}

export async function goToCollectablesStep(po: PoManager) {
  const data = getB2xTestData();
  await goToTraderForm(po, data.traderName);
  await po.getB2XFormPage().completeTraderForm(data);
  await submitTraderAndProceedToCollectables(po, data.traderName);
  return data;
}

export async function goToRequestDetailsStep(po: PoManager) {
  const data = await goToCollectablesStep(po);
  await po.getB2XCollectablePage().completeCollectablesStep(data.pricePerKilo, data.quantity);
  return data;
}

export async function goToCollectablesStepWithWarehouse(po: PoManager) {
  const data = getB2xTestData();
  await goToTraderForm(po, data.traderName);
  await po.getB2XFormPage().completeTraderFormWithWarehouse({
    ...data,
    warehouseAddress: data.warehouseAddress ?? data.address,
  });
  await submitTraderAndProceedToCollectables(po, data.traderName);
  return data;
}
