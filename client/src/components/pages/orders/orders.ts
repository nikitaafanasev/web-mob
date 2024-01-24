import { LitElement, html, nothing } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { consume } from '@lit/context';
import { Router, routerContext } from '../../../router.js';

import sharedStyle from '../../shared.css?inline';
import componentStyle from './orders.css?inline';
import { emit } from '../../../event.js';
import { Order, OrderService, orderServiceContext } from '../../../services/order-service.js';
import { Task, TaskService, TaskType, taskServiceContext } from '../../../services/task.service.js';
import {
  MenuItem,
  MenuItemType,
  MenuItemService,
  menuItemServiceContext
} from '../../../services/menu-item.service.js';
import { HttpError } from '../../../http-client.js';
import { Bill } from '../../../models/bill.js';
import { BillService, billServiceContext } from '../../../services/bill.service.js';
import { StringService, stringServiceContext } from '../../../services/string.service.js';
import { ShoppingCart, ShoppingCartItem, shoppingCartContext } from '../../../models/shopping-cart.js';

export const ORDERS_TITLE = 'Orders';
@customElement('app-orders')
class OrdersComponent extends LitElement {
  static styles = [sharedStyle, componentStyle];

  @consume({ context: routerContext, subscribe: true })
  router!: Router;

  @consume({ context: menuItemServiceContext, subscribe: true })
  menuItemService!: MenuItemService;

  @consume({ context: orderServiceContext })
  orderService!: OrderService;

  @consume({ context: shoppingCartContext, subscribe: true })
  @state()
  shoppingCart!: ShoppingCart;

  @consume({ context: taskServiceContext })
  taskService!: TaskService;

  @consume({ context: billServiceContext })
  billService!: BillService;

  @state()
  id!: string;

  @state()
  bill?: Partial<Bill>;

  @state()
  orders: Order[] = [];

  // @state()
  //   shoppingCart!: ShoppingCart;

  @state()
  activeStep = 0;

  @property({ type: String })
  status: Task['status'] = 'open';

  @query('#customInput')
  customInput!: HTMLIonInputElement;

  connectedCallback() {
    super.connectedCallback();
    emit(this, 'app-page-title-changed', { title: ORDERS_TITLE });
    this.fetchData();
  }

  emitEvents() {
    emit(this, 'app-back-button-changed', { visible: true });
  }

  async fetchData(status?: Task['status']) {
    this.status = status ?? this.status;
    //this.tasks = await this.taskService.findAll(status ?? this.status);
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
    this.emitEvents();
  }

  transformOrderItemToMenuItem(orders: Order[], type: MenuItemType) {
    return orders.flatMap(order =>
      order.orderItems
        .filter(orderItem => orderItem.menuItem.type === type)
        .flatMap(orderItem => Array.from({ length: orderItem.quantity }, () => orderItem.menuItem))
    );
  }

  async firstUpdated() {}

  render() {
    if (this.bill?.total && this.activeStep === 0) {
      return html`
        <div class="responsive">
          <ion-card class="padding">
            <ion-card-header>
              <ion-card-title>No orders yet!</ion-card-title>
            </ion-card-header>
            <ion-card-content>
              It looks like you haven't placed any orders yet. You can start placing orders by adding items to your
              cart. Please use the <a href="food-menu"> menu</a>.
            </ion-card-content>
          </ion-card>
        </div>
      `;
    }
    const totalQuantity = this.orders.reduce((acc, order) => acc + order.quantity, 0);
    return html`
      <div class="orders-container">
        <ion-header>
          <ion-toolbar>
            <h2>My Orders</h2>
          </ion-toolbar>
        </ion-header>
        <ion-content> ${this.orders.map(order => html``)} </ion-content>
        ${this.bill ? html`<p>Order Number: ${this.bill.id?.slice(0, 6)}</p>` : html`<p></p>`}
        <div class="menu-items">
          <!-- ${this.renderOrderItems('food', 'Food')} ${this.renderOrderItems('drink', 'Drinks')} -->
          ${this.shoppingCart.map(
            shoppingCartItem => html`
        <ion-card key='index'>
          <ion-item-sliding>
            <ion-item lines="none">
              <ion-avatar slot="start">
              <form class="padding-y">
              <ion-img slot="start" src="${this.menuItemService.getImageUrl(shoppingCartItem.menuItem)}"></ion-img>
              </form>
          </ion-avatar>
              <ion-label>
                <ion-card-title>${shoppingCartItem.menuItem.name}</ion-card-title>
                <p>${shoppingCartItem.menuItem.description}</p>
                <p>
                  <b>$ ${shoppingCartItem.menuItem.price}</b>
                  ${shoppingCartItem.quantity === 1 ? '' : 'per unit'}
                </p>
                ${shoppingCartItem.instructions ? html`<p>Instructions: ${shoppingCartItem.instructions}</p>` : nothing}
              </ion-label>
              <ion-chip> ${
                this.status === 'open' ? 'ordered' : this.status === 'claimed' ? 'Cooking' : 'Done'
              }</ion-chip>
              </ion-card>
            </ion-item>
            <ion-item-options side="end">
            </ion-item-options>
          </ion-item-sliding>
        `
          )}
        </div>
        ${this.bill ? html`<p>Total: ${this.bill.total}€</p>` : html`<p>Loading...</p>`}
      </div>
      <div class="button-container padding"></div>
    `;
  }

  renderOrderItems(type: MenuItemType, heading: string) {
    const items = this.transformOrderItemToMenuItem(this.orders, type);
    return html`
      <div class="order-category">
        <h3>${heading}</h3>
        <ion-list>
          ${items.map((item: MenuItem) => html` <ion-item> ${item.name} - ${item.price}€ </ion-item>`)}
        </ion-list>
      </div>
    `;
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

  renderBackButton() {
    return html`
      <ion-button fill="outline" @click=${this.goBack}>
        <ion-icon name="arrow-back-outline"></ion-icon>
        <span>Back</span>
      </ion-button>
    `;
  }

  goBack() {
    window.history.back();
  }
}
