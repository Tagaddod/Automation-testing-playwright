import { Page } from '@playwright/test';
import { GreenpanHomePage } from '../pages/greenpan/GreenpanHomePage';
import { addressPage} from '../pages/greenpan/addressPage';
import {sendRequestPage} from '../pages/greenpan/sendRequestPage';
import {sendB2BRequestPage} from '../pages/b2b/sendB2BRequestPage';
import { NewClientForm } from '../pages/b2b/NewClientForm';
import { requestDetails } from '../pages/b2b/requestDetails';
import { B2BHomePage } from '../pages/b2b/B2BHomePage';
import { B2XHomePage } from '../pages/B2X/B2XHomePage';
import { formPage } from '../pages/B2X/formPage';
import { collectablePage } from '../pages/B2X/collectablePage';
import { requestDetailsPage } from '../pages/B2X/requestDetailsPage';
import { traderRegistrationSuccessPage } from '../pages/B2X/traderRegistrationSuccessPage';

export class PoManager {
  private page: Page;
  private greenpanHome?: GreenpanHomePage;
  private addressPage?: addressPage;
  private sendRequest?: sendRequestPage;
  private sendB2BRequest?: sendB2BRequestPage;
  private newClientForm?: NewClientForm;
  private requestDetails?: requestDetails;
  private b2bHome?: B2BHomePage;
  private b2xHome?: B2XHomePage;
  private b2xForm?: formPage;
  private b2xCollectable?: collectablePage;
  private b2xRequestDetails?: requestDetailsPage;
  private b2xTraderRegistrationSuccess?: traderRegistrationSuccessPage;


  constructor(page: Page, greenpanHome?: GreenpanHomePage) {
    this.page = page;
    this.greenpanHome = greenpanHome;
  }

  getGreenpanHome() {
    if (!this.greenpanHome) this.greenpanHome = new GreenpanHomePage(this.page);
    return this.greenpanHome;
  }

  getAddressPage() {
    if (!this.addressPage) this.addressPage = new addressPage(this.page);
    return this.addressPage;
  }

  getSendRequestPage(){
    if (!this.sendRequest) this.sendRequest = new sendRequestPage(this.page);
    return this.sendRequest;
  }
  getSendB2BRequestPage(){
    if (!this.sendB2BRequest) this.sendB2BRequest = new sendB2BRequestPage(this.page);
    return this.sendB2BRequest;
  }
  getNewClientForm(){
    if (!this.newClientForm) this.newClientForm = new NewClientForm(this.page);
    return this.newClientForm;
  }
 getB2BHomePage(){
    if (!this.b2bHome) this.b2bHome = new B2BHomePage(this.page);
    return this.b2bHome;
  }
  getRequestDetails(){
    if (!this.requestDetails) this.requestDetails = new requestDetails(this.page);
    return this.requestDetails;
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
    if (!this.b2xRequestDetails) this.b2xRequestDetails = new requestDetailsPage(this.page);
    return this.b2xRequestDetails;
  }

  getB2XTraderRegistrationSuccessPage() {
    if (!this.b2xTraderRegistrationSuccess) {
      this.b2xTraderRegistrationSuccess = new traderRegistrationSuccessPage(this.page);
    }
    return this.b2xTraderRegistrationSuccess;
  }

  /**
   * @see {@link NewClientForm.completeB2BCreateNewBranchFlow}
   */
  async completeB2BCreateNewBranchFlow(data: {
    branchName: string;
    phone: string;
    address: string;
  }) {
    return this.getNewClientForm().completeB2BCreateNewBranchFlow(data);
  }

}

export default PoManager;
