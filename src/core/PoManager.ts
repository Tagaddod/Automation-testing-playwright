import type { Page } from "@playwright/test";

import { branchConfirmationPage } from "../pages/b2b/branchConfirmationPage";
import { branchFormPage } from "../pages/b2b/branchFormPage";
import { createBusinessClientPage } from "../pages/b2b/createBusinessClientPage";
import { B2BHomePage } from "../pages/b2b/homePage";
import { requestDetailsPage as b2bRequestDetailsPage } from "../pages/b2b/requestDetailsPage";
import { requestMaterialsPage } from "../pages/b2b/requestMaterialsPage";
import { B2XHomePage } from "../pages/B2X/B2XHomePage";
import { collectablePage } from "../pages/B2X/collectablePage";
import { formPage } from "../pages/B2X/formPage";
import { requestDetailsPage as b2xRequestDetailsPage } from "../pages/B2X/requestDetailsPage";
import { traderRegistrationSuccessPage } from "../pages/B2X/traderRegistrationSuccessPage";
import { addressPage } from "../pages/greenpan/addressPage";
import { bundlePackagePage } from "../pages/greenpan/bundlePackagePage";
import { giftsPage } from "../pages/greenpan/giftsPage";
import { greenpanHomePage } from "../pages/greenpan/homePage";
import { quantityPage } from "../pages/greenpan/quantityPage";
import { requestSuccessPage } from "../pages/greenpan/requestSuccessPage";
import { sendRequestPage } from "../pages/greenpan/sendRequestPage";

export class PoManager {
  private page: Page;
  private greenpanHome?: greenpanHomePage;
  private greenpanBundlePackage?: bundlePackagePage;
  private greenpanQuantity?: quantityPage;
  private greenpanGifts?: giftsPage;
  private addressPage?: addressPage;
  private sendRequest?: sendRequestPage;
  private greenpanRequestSuccess?: requestSuccessPage;
  private b2bHome?: B2BHomePage;
  private b2bCreateBusinessClient?: createBusinessClientPage;
  private b2bBranchForm?: branchFormPage;
  private b2bBranchConfirmation?: branchConfirmationPage;
  private b2bRequestMaterials?: requestMaterialsPage;
  private b2bRequestDetails?: b2bRequestDetailsPage;
  private b2xHome?: B2XHomePage;
  private b2xForm?: formPage;
  private b2xCollectable?: collectablePage;
  private b2xRequestDetails?: b2xRequestDetailsPage;
  private b2xTraderRegistrationSuccess?: traderRegistrationSuccessPage;

  constructor(page: Page) {
    this.page = page;
  }

  getPage() {
    return this.page;
  }

  getGreenpanHomePage() {
    if (!this.greenpanHome) this.greenpanHome = new greenpanHomePage(this.page);
    return this.greenpanHome;
  }

  /** @deprecated Use getGreenpanHomePage() */
  getGreenpanHome() {
    return this.getGreenpanHomePage();
  }

  getGreenpanBundlePackagePage() {
    if (!this.greenpanBundlePackage) {
      this.greenpanBundlePackage = new bundlePackagePage(this.page);
    }
    return this.greenpanBundlePackage;
  }

  getGreenpanQuantityPage() {
    if (!this.greenpanQuantity) this.greenpanQuantity = new quantityPage(this.page);
    return this.greenpanQuantity;
  }

  getGreenpanGiftsPage() {
    if (!this.greenpanGifts) this.greenpanGifts = new giftsPage(this.page);
    return this.greenpanGifts;
  }

  getGreenpanAddressPage() {
    if (!this.addressPage) this.addressPage = new addressPage(this.page);
    return this.addressPage;
  }

  /** @deprecated Use getGreenpanAddressPage() */
  getAddressPage() {
    return this.getGreenpanAddressPage();
  }

  getGreenpanSendRequestPage() {
    if (!this.sendRequest) this.sendRequest = new sendRequestPage(this.page);
    return this.sendRequest;
  }

  /** @deprecated Use getGreenpanSendRequestPage() */
  getSendRequestPage() {
    return this.getGreenpanSendRequestPage();
  }

  getGreenpanRequestSuccessPage() {
    if (!this.greenpanRequestSuccess) {
      this.greenpanRequestSuccess = new requestSuccessPage(this.page);
    }
    return this.greenpanRequestSuccess;
  }

  getB2BHomePage() {
    if (!this.b2bHome) this.b2bHome = new B2BHomePage(this.page);
    return this.b2bHome;
  }

  getB2BCreateBusinessClientPage() {
    if (!this.b2bCreateBusinessClient) {
      this.b2bCreateBusinessClient = new createBusinessClientPage(this.page);
    }
    return this.b2bCreateBusinessClient;
  }

  getB2BBranchFormPage() {
    if (!this.b2bBranchForm) this.b2bBranchForm = new branchFormPage(this.page);
    return this.b2bBranchForm;
  }

  getB2BBranchConfirmationPage() {
    if (!this.b2bBranchConfirmation) {
      this.b2bBranchConfirmation = new branchConfirmationPage(this.page);
    }
    return this.b2bBranchConfirmation;
  }

  getB2BRequestMaterialsPage() {
    if (!this.b2bRequestMaterials) {
      this.b2bRequestMaterials = new requestMaterialsPage(this.page);
    }
    return this.b2bRequestMaterials;
  }

  getB2BRequestDetailsPage() {
    if (!this.b2bRequestDetails) {
      this.b2bRequestDetails = new b2bRequestDetailsPage(this.page);
    }
    return this.b2bRequestDetails;
  }

  getB2XHomePage() {
    if (!this.b2xHome) this.b2xHome = new B2XHomePage(this.page);
    return this.b2xHome;
  }

  getB2XFormPage() {
    if (!this.b2xForm) this.b2xForm = new formPage(this.page);
    return this.b2xForm;
  }

  getB2XCollectablePage() {
    if (!this.b2xCollectable) this.b2xCollectable = new collectablePage(this.page);
    return this.b2xCollectable;
  }

  getB2XRequestDetailsPage() {
    if (!this.b2xRequestDetails) this.b2xRequestDetails = new b2xRequestDetailsPage(this.page);
    return this.b2xRequestDetails;
  }

  getB2XTraderRegistrationSuccessPage() {
    if (!this.b2xTraderRegistrationSuccess) {
      this.b2xTraderRegistrationSuccess = new traderRegistrationSuccessPage(this.page);
    }
    return this.b2xTraderRegistrationSuccess;
  }
}

export default PoManager;
