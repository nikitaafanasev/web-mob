import { LitElement, html, nothing } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { consume } from '@lit/context';
import { Router, routerContext } from '../../../router.js';

import sharedStyle from '../../shared.css?inline';
import componentStyle from './shopping-cart.css?inline';
import { emit } from '../../../event.js';
import { ShoppingCart, ShoppingCartItem, shoppingCartContext } from '../../../models/shopping-cart.js';
import { CreateOrder, Order, OrderItem, OrderService, orderServiceContext } from '../../../services/order-service.js';
import { MenuItemService, menuItemServiceContext } from '../../../services/menu-item.service.js';
import { HttpError } from '../../../http-client.js';

export const SHOPPING_CART_TITLE = 'Shopping Cart';
@customElement('app-shopping-cart')
class ShoppingCartComponent extends LitElement {
  static styles = [sharedStyle, componentStyle];

  @consume({ context: routerContext, subscribe: true })
  router!: Router;

  @consume({ context: menuItemServiceContext, subscribe: true })
  menuItemService!: MenuItemService;

  @consume({ context: shoppingCartContext, subscribe: true })
  @state()
  shoppingCart!: ShoppingCart;

  @consume({ context: orderServiceContext, subscribe: true })
  orderService!: OrderService;

  connectedCallback() {
    super.connectedCallback();
    emit(this, 'app-page-title-changed', { title: SHOPPING_CART_TITLE });
  }

  async firstUpdated() {}

  render() {
    const totalQuantity = this.shoppingCart.reduce((acc, item) => acc + item.quantity, 0);
    return this.shoppingCart.length === 0
      ? html`<div class="responsive">
          <ion-card class="padding">
            <ion-card-header>
              <ion-card-title>Your shopping cart is empty!</ion-card-title>
            </ion-card-header>
            <ion-card-content>
              It seems like you haven't got anything in your shopping cart. You can place an order if you add something
              to your shopping cart. Please use the <a href="food-menu"> menu</a>.</ion-card-content
            >
          </ion-card>
        </div>`
      : html`
          <div class="responsive">
            <ion-list>
              <ion-item-divider>Your selection</ion-item-divider>
              ${this.renderShoppingCartItems()}
              <ion-item-divider>Order Summary</ion-item-divider>
              <ion-item>
                <ion-label>Total Price</ion-label>
                <p slot="end" color="success"><b>$ ${this.getTotalPrice()}</b></p>
              </ion-item>
              <ion-item>
                <ion-label> Quantity</ion-label>
                <p slot="end" color="success">${totalQuantity} ${this.getPieceLabel(totalQuantity)}</p>
              </ion-item>
            </ion-list>
            <div class="centered">
              <ion-button @click=${this.order}
                ><ion-icon name="bag-handle-outline"></ion-icon><span>Binding Order</span></ion-button
              >
            </div>
          </div>
        `;
  }

  renderShoppingCartItems() {
    return html`
      ${this.shoppingCart.map(
        shoppingCartItem => html`
          <ion-item-sliding>
            <ion-item>
              <ion-img slot="start" src="${this.menuItemService.getImageUrl(shoppingCartItem.menuItem)}"></ion-img>
              <ion-label>
                <h2>${shoppingCartItem.menuItem.name}</h2>
                <p>${shoppingCartItem.menuItem.description}</p>
                <p>
                  <b>$ ${shoppingCartItem.menuItem.price}</b>
                  ${shoppingCartItem.quantity === 1 ? '' : 'per unit'}
                </p>
                ${shoppingCartItem.instructions ? html`<p>Instructions: ${shoppingCartItem.instructions}</p>` : nothing}
              </ion-label>
              <ion-badge slot="end"
                >${shoppingCartItem.quantity} ${this.getPieceLabel(shoppingCartItem.quantity)}</ion-badge
              >
            </ion-item>
            <ion-item-options side="end">
              <ion-item-option color="danger" @click=${() => this.deleteShoppingCartItem(shoppingCartItem)}
                >Delete</ion-item-option
              >
            </ion-item-options>
          </ion-item-sliding>
        `
      )}
    `;
  }

  getTotalPrice() {
    const price = this.shoppingCart.reduce((acc, item) => acc + item.menuItem.price * item.quantity, 0);
    return price.toFixed(2);
  }

  deleteShoppingCartItem(shoppingCartItem: ShoppingCartItem) {
    const shoppingCart = this.shoppingCart.filter(item => item.menuItem.id !== shoppingCartItem.menuItem.id);
    emit(this, 'app-shopping-cart-changed', { shoppingCart });
  }

  getPieceLabel(n: number) {
    return n === 1 ? 'Pc' : 'Pcs';
  }

  async order() {
    const order: CreateOrder = {
      orderItems: this.shoppingCart,
      price: this.shoppingCart.reduce((acc, item) => acc + item.menuItem.price * item.quantity, 0),
      quantity: this.shoppingCart.reduce((acc, item) => acc + item.quantity, 0)
    };
    try {
      await this.orderService.create(order);
      emit(this, 'app-shopping-cart-changed', { shoppingCart: [] });
      emit(this, 'app-open-toast', {
        message: 'Order created successfully. We will deliver your order soon.',
        mode: 'success'
      });
    } catch (err) {
      emit(this, 'app-open-toast', {
        message: 'Order could not be created. Please try again later. ' + (err as HttpError).message,
        mode: 'danger'
      });
    }
  }
}
