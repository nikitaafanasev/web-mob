import { LitElement, html, nothing } from 'lit';
import { customElement, query, state } from 'lit/decorators.js';
import { consume } from '@lit/context';
import { Router, routerContext } from '../../../router.js';

import sharedStyle from '../../shared.css?inline';
import componentStyle from './bill.css?inline';
import { emit } from '../../../event.js';
import { Order, OrderService, orderServiceContext } from '../../../services/order-service.js';
import { MenuItem, MenuItemType } from '../../../services/menu-item.service.js';
import { TaskService, TaskType, taskServiceContext } from '../../../services/task.service.js';
import { HttpError } from '../../../http-client.js';
import { Bill } from '../../../models/bill.js';
import { StepperItems } from '../../widgets/stepper/steppers.js';
import { BillService, billServiceContext } from '../../../services/bill.service.js';

export const BILL_TITLE = 'Bill';

@customElement('app-bill')
class BillComponent extends LitElement {
  static styles = [sharedStyle, componentStyle];

  @consume({ context: routerContext, subscribe: true })
  router!: Router;

  @consume({ context: orderServiceContext })
  orderService!: OrderService;

  @consume({ context: taskServiceContext })
  taskService!: TaskService;

  @consume({ context: billServiceContext })
  billService!: BillService;

  @state()
  bill?: Partial<Bill>;

  @state()
  stepperItems: StepperItems = [{ label: 'Review' }, { label: 'Tip', optional: true }, { label: 'Pay' }];

  @state()
  activeStep = 0;

  @query('ion-radio-group')
  radioGroup!: HTMLIonRadioGroupElement;

  @query('#customInput')
  customInput!: HTMLIonInputElement;

  connectedCallback() {
    super.connectedCallback();
    emit(this, 'app-page-title-changed', { title: BILL_TITLE });
    this.fetchData();
  }

  updated() {
    if (this.activeStep === 1) {
      this.customInput?.addEventListener('ionInput', () => {
        this.addTipAbsolute(Number(this.customInput.value));
      });
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
  }

  async fetchData() {
    const orders = await this.orderService.findAll();
    const food = this.transformOrderItemToMenuItem(orders, 'food');
    const drinks = this.transformOrderItemToMenuItem(orders, 'drink');
    const menuItems = [...food, ...drinks];
    const total = Number(menuItems.reduce((acc, menuItem) => acc + menuItem.price, 0).toFixed(2));
    const taxes = Number((total * 0.19).toFixed(2));
    try {
      const bill = await this.billService.findOne();
      if (bill) {
        this.bill = bill;
      }
      bill.paid ? (this.activeStep = 2) : (this.activeStep = 0);
    } catch (err) {
      this.bill = { food, drinks, total, taxes, tip: 0 };
    }
  }

  transformOrderItemToMenuItem(orders: Order[], type: MenuItemType) {
    return orders.flatMap(order =>
      order.orderItems
        .filter(orderItem => orderItem.menuItem.type === type)
        .flatMap(orderItem => Array.from({ length: orderItem.quantity }, () => orderItem.menuItem))
    );
  }

  render() {
    return html`${this.renderStepper()} ${this.renderBill()} ${this.renderTips()} ${this.renderPaymentMethods()}`;
  }

  renderStepper() {
    return this.bill?.total ?? 0
      ? html`<app-stepper .items=${this.stepperItems} .activeStep=${this.activeStep}></app-stepper>`
      : nothing;
  }

  renderBill() {
    return (this.bill?.total && this.activeStep === 0) ?? 0
      ? html`
          <div class="responsive">
            <ion-list>
              <ion-item-divider>Food</ion-item-divider>
              ${this.renderMenuItems(this.bill?.food || [])}
              ${this.bill?.food?.length === 0 ? html`<ion-item>No Food selected yet</ion-item>` : nothing}
              <ion-item-divider>Drinks</ion-item-divider>
              ${this.renderMenuItems(this.bill?.drinks || [])}
              ${this.bill?.drinks?.length === 0 ? html`<ion-item>No Drinks selected yet</ion-item>` : nothing}
              <ion-item-divider>Total</ion-item-divider>
              <ion-item>
                <ion-label>Total Price</ion-label>
                <ion-note slot="end" color="success"><b>$ ${this.formatCurrency(this.bill?.total)}</b></ion-note>
              </ion-item>
              <ion-item>
                <ion-label>Included Duty Fee</ion-label>
                <ion-note slot="end" color="success">$ ${this.formatCurrency(this.bill?.taxes)}</ion-note>
              </ion-item>
            </ion-list>

            <div class="button-container padding">
              <ion-button fill="outline" @click=${this.complain}
                ><ion-icon name="alert-circle-outline"></ion-icon><span></span>Complain</ion-button
              >
              ${this.renderNextButton()}
            </div>
          </div>
        `
      : !this.bill?.total
        ? html`<div class="responsive">
        <ion-card>
          <ion-card-header>
            <ion-card-title>Bill</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <p>You have not ordered anything yet. You can buy something right <a href="/menu">here</a></p>
          </ion-card-content>
      </div>`
        : nothing;
  }

  renderTips() {
    return this.bill?.total && this.activeStep === 1
      ? html`
          <div class="responsive">
            <ion-list>
              <ion-item-divider>Tip</ion-item-divider>
              <ion-radio-group value="0">
                <ion-item>
                  <ion-label>Add no tip</ion-label>
                  <ion-radio slot="start" value="0" selected="true" @click=${() => this.addTipRelative(0)}></ion-radio>
                </ion-item>
                <ion-item>
                  <ion-label>5%</ion-label>
                  <ion-radio slot="start" value="5" @click=${() => this.addTipRelative(5)}></ion-radio>
                </ion-item>
                <ion-item>
                  <ion-label>10%</ion-label>
                  <ion-radio slot="start" value="10" @click=${() => this.addTipRelative(10)}></ion-radio>
                </ion-item>
                <ion-item>
                  <ion-label>15%</ion-label>
                  <ion-radio slot="start" value="15" @click=${() => this.addTipRelative(15)}></ion-radio>
                </ion-item>
                <ion-item id="customInputItem"  @click=${this.handleClickCustom}>
                  <!-- do not delete next line -->
                  
                  <ion-radio slot="start" value="custom"></ion-radio>
                  <div class="flex">
                  <ion-label>Custom</ion-label>
                  <ion-input id="customInput" label="" type="number" placeholder="Enter Tip in $" pattern="^\d*(\.\d{0,2})?$" step="0.01"
                  }></ion-input>
                  </div>
                </ion-item>
              </ion-radio-group>
              <ion-item-divider>Total</ion-item-divider>
              <ion-item>
                <ion-label>Total Price</ion-label>
                <ion-note slot="end" color="success"><b>$ ${this.formatCurrency(
                  this.calculateTotalWithTips()
                )}</b></ion-note>
              </ion-item>
              ${
                this.bill?.tip !== 0
                  ? html`<ion-item>
                      <ion-label>Included Tip</ion-label>
                      <ion-note slot="end" color="success">$ ${this.formatCurrency(this.bill?.tip)}</ion-note>
                    </ion-item>`
                  : nothing
              }
              <ion-item>
                <ion-label>Included Duty Fee</ion-label>
                <ion-note slot="end" color="success">$ ${this.formatCurrency(this.bill?.taxes)}</ion-note>
            </ion-list>
            <div class="button-container padding">${this.renderBackButton()}${this.renderNextButton()}</div>
          </div>
        `
      : nothing;
  }

  renderPaymentMethods() {
    return this.bill?.total && this.activeStep === 2
      ? html`<div class="responsive padding">
          <div class="payment-buttons">
            <ion-button @click=${this.payCash} disabled=${this.bill.paid ? 'true' : 'false'}
              ><ion-icon name="cash"></ion-icon><span></span>Pay in Cash</ion-button
            >
            <ion-button @click=${this.payCard} disabled=${this.bill.paid ? 'true' : 'false'}
              ><ion-icon name="card-outline"></ion-icon><span></span>Pay with Credit Card</ion-button
            >
            <ion-button @click=${this.showPaymentError} disabled=${this.bill.paid ? 'true' : 'false'}
              ><ion-icon name="logo-paypal"></ion-icon><span></span>Pay with PayPal</ion-button
            >
            <ion-button @click=${this.showPaymentError} disabled=${this.bill.paid ? 'true' : 'false'}
              ><ion-icon name="logo-apple"></ion-icon><span></span>Pay with Apple Pay</ion-button
            >
            <ion-button @click=${this.showPaymentError} disabled=${this.bill.paid ? 'true' : 'false'}
              ><ion-icon name="logo-google"></ion-icon><span></span>Pay with Google Pay</ion-button
            >
            ${!this.bill.paid ? this.renderBackButton() : nothing}
          </div>
        </div>`
      : nothing;
  }

  renderNextButton(label?: string) {
    return html`<ion-button @click=${this.next}
                ></ion-icon><span>${label ?? 'Next'}</span><ion-icon name="arrow-forward-outline"></ion-button
              >`;
  }

  renderBackButton() {
    return html`<ion-button fill="outline" @click=${this.back}
      ><ion-icon name="arrow-back-outline"></ion-icon><span></span>Back</ion-button
    >`;
  }

  renderMenuItems(menuItems: MenuItem[]) {
    return html`
      ${menuItems.map(menuItem => {
        return html`
          <ion-item>
            <ion-label>${menuItem.name}</ion-label>
            <ion-note slot="end">$ ${menuItem.price}</ion-note>
          </ion-item>
        `;
      })}
    `;
  }

  async complain() {
    try {
      await this.taskService.create(TaskType.TALK_REQUESTED);
      emit(this, 'app-open-toast', { message: 'Waiter is coming to you!', mode: 'success' });
    } catch (err) {
      emit(this, 'app-open-toast', { message: (err as HttpError).message, mode: 'danger' });
    }
  }

  addTipRelative(percent: number) {
    if (percent === 0) {
      this.bill!.tip = 0;
    }
    const tip = Number(((this.bill?.total || 0) * (percent / 100)).toFixed(2));
    this.bill = { ...this.bill, tip };
  }

  addTipAbsolute(amount: number) {
    const tip = Number((amount || 0).toFixed(2));
    this.bill = { ...this.bill!, tip };
  }

  calculateTotalWithTips() {
    const total = Number(((this.bill?.total || 0) + (this.bill?.tip || 0)).toFixed(2));

    return total;
  }

  back() {
    if (this.activeStep > 0) {
      this.activeStep--;
    }
  }

  next() {
    if (this.activeStep < this.stepperItems.length - 1) {
      this.activeStep++;
    }
  }

  formatCurrency(price?: number) {
    if (!price) {
      return '';
    }
    const splitted = price.toString().split('.');
    if (splitted.length === 1) {
      return `${splitted[0]}.00`;
    }
    const integer = splitted[0];
    const decimal = splitted[1];
    return `${integer}.${decimal ? decimal.padEnd(2, '0') : '00'}`;
  }

  async payCash() {
    try {
      await this.taskService.create(TaskType.PAYMENT_REQUESTED_CASH, { total: this.calculateTotalWithTips() });
      await this.billService.create(this.bill!);
      emit(this, 'app-open-toast', { message: 'Waiter will come soon to you! Please wait a moment.', mode: 'success' });
      this.bill! = { ...this.bill!, paid: true };
    } catch (err) {
      emit(this, 'app-open-toast', { message: (err as HttpError).message, mode: 'danger' });
    }
  }

  async payCard() {
    try {
      await this.taskService.create(TaskType.PAYMENT_REQUESTED_CARD, { total: this.calculateTotalWithTips() });
      await this.billService.create(this.bill!);
      emit(this, 'app-open-toast', { message: 'Waiter will come soon to you! Please wait a moment.', mode: 'success' });
      this.bill! = { ...this.bill!, paid: true };
    } catch (err) {
      emit(this, 'app-open-toast', { message: (err as HttpError).message, mode: 'danger' });
    }
  }

  showPaymentError() {
    emit(this, 'app-open-toast', { message: `Currently we don't offer this payment method`, mode: 'danger' });
  }

  handleClickCustom() {
    this.radioGroup.value = 'custom';
    const value = this.customInput.value;
    if (value) {
      this.addTipAbsolute(Number(value));
    } else {
      this.addTipAbsolute(0);
    }
  }
}
