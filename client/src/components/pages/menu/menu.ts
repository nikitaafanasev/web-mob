import { LitElement, html, nothing } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { consume } from '@lit/context';
import { Router, routerContext } from '../../../router.js';
import sharedStyle from '../../shared.css?inline';
import componentStyle from './menu.css?inline';
import { emit } from '../../../event.js';
import { MenuItem, MenuItemService, menuItemServiceContext } from '../../../services/menu-item.service.js';
import { HttpError } from '../../../http-client.js';
import { ShoppingCart, ShoppingCartItem, shoppingCartContext } from '../../../models/shopping-cart.js';
import { User, UserRole, userContext } from '../../../models/user.js';
import { ShoppingCartService, shoppingCartServiceContext } from '../../../services/shopping-cart.service.js';

export const FOOD_MENU_TITLE = 'Menu';
@customElement('app-menu')
class MenuComponent extends LitElement {
  static styles = [sharedStyle, componentStyle];

  @consume({ context: routerContext, subscribe: true })
  router!: Router;

  @consume({ context: menuItemServiceContext })
  menuItemService!: MenuItemService;

  @consume({ context: shoppingCartServiceContext })
  shoppingCartService!: ShoppingCartService;

  @consume({ context: shoppingCartContext, subscribe: true })
  shoppingCart!: ShoppingCart;

  @consume({
    context: userContext,
    subscribe: true
  })
  user?: User;

  @query('ion-searchbar')
  searchbarElement!: HTMLIonSearchbarElement;

  @state()
  menu: Record<string, MenuItem[]> = {}; // category -> menu items

  @state()
  displayedMenu = this.menu;

  @property({ type: String })
  type: MenuItem['type'] = 'food';

  @state()
  ratingMap: Map<string, string> = new Map();

  connectedCallback() {
    super.connectedCallback();
    emit(this, 'app-page-title-changed', { title: FOOD_MENU_TITLE });
  }

  async firstUpdated() {
    this.searchbarElement.addEventListener('ionChange', event => {
      const value = (event.target as HTMLIonSearchbarElement).value;
      this.displayedMenu = this.menu;
      this.displayedMenu = Object.keys(this.menu).reduce(
        (acc, category) => {
          const filteredMenuItems = this.menu[category].filter(menuItem =>
            menuItem.name.toLowerCase().includes(value!.toLowerCase())
          );
          if (filteredMenuItems.length > 0) {
            acc[category] = filteredMenuItems;
          }
          return acc;
        },
        {} as Record<string, MenuItem[]>
      );
    });
    try {
      const menuItems = await this.menuItemService.findAll(this.type);
      // to map
      menuItems.forEach(menuItem => {
        this.ratingMap.set(menuItem.id, this.menuItemService.getAverageRatingLabel(menuItem));
      });
      // Group by categories
      //@ts-ignore
      this.menu = menuItems.reduce((acc, menuItem) => {
        for (const category of menuItem.categories) {
          //@ts-ignore
          if (!acc[category]) {
            //@ts-ignore
            acc[category] = [];
          }
          //@ts-ignore
          acc[category].push(menuItem);
        }
        return acc;
      }, {});
      this.displayedMenu = this.menu;
    } catch (err) {
      emit(this, 'app-open-toast', { message: (err as HttpError).message, mode: 'danger' });
    }
  }

  render() {
    return html`
      ${this.renderTabs()}
      <div class="responsive">
        <div class="searchbar-container">
          <ion-searchbar></ion-searchbar>
          <ion-icon id="filterIcon" name="options-outline" size="large"></ion-icon>
        </div>
        ${this.renderCategories()}
      </div>
    `;
  }

  renderTabs() {
    return html`<ion-segment value="${this.type}">
      <ion-segment-button
        value="food"
        layout="icon-start"
        @click=${async () => {
          this.type = 'food';
          this.searchbarElement.value = '';
          this.firstUpdated();
        }}
      >
        <ion-label>Food</ion-label>
        <ion-icon name="${this.type === 'food' ? 'restaurant' : 'restaurant-outline'}"></ion-icon>
      </ion-segment-button>
      <ion-segment-button
        value="drink"
        layout="icon-start"
        @click=${async () => {
          this.type = 'drink';
          this.searchbarElement.value = '';
          this.firstUpdated();
        }}
      >
        <ion-label>Drinks</ion-label>
        <ion-icon name="${this.type === 'drink' ? 'wine' : 'wine-outline'}"></ion-icon> </ion-segment-button
    ></ion-segment>`;
  }

  renderCategories() {
    return html`
      <ion-list> ${Object.keys(this.displayedMenu).map(category => this.renderCategory(category))}</ion-list>
    `;
  }

  renderCategory(category: string) {
    return html`
      <ion-item-group>
        <ion-item-divider>${this.menuItemService.mapCategoryLabel(category)}</ion-item-divider>
        ${this.displayedMenu[category].map(menuItem => this.renderMenuItem(menuItem))}
      </ion-item-group>
    `;
  }

  renderMenuItem(menuItem: MenuItem) {
    return html`
      <ion-item-sliding>
        <ion-item @click=${() => this.router.goto('/menu/' + menuItem.id)}>
          <ion-img src="${this.menuItemService.getImageUrl(menuItem)}" alt="menu item"></ion-img>
          <ion-label>
            <div class="item-header">
              <span class="item-title">${menuItem.name}</span>
              <div class="rating">
                <ion-icon name="star" color="warning"></ion-icon>
                <span class="rating-value">${this.ratingMap.get(menuItem.id)}</span>
              </div>
            </div>
            <div class="item-description">${menuItem.description}</div>
          </ion-label>
          <ion-note slot="end">$ ${menuItem.price}</ion-note>
        </ion-item>
        <ion-item-options>
          ${this.user?.role === UserRole.GUEST
            ? html` <ion-item-option class="success-bg" @click=${() => this.addToShoppingCart(menuItem)}
                >Add to Shopping Cart</ion-item-option
              >`
            : nothing}
          ${this.user?.role !== undefined && this.user?.role !== 'guest'
            ? html`<ion-item-option class="danger-bg">Delete</ion-item-option>`
            : nothing}
        </ion-item-options>
      </ion-item-sliding>
    `;
  }

  addToShoppingCart(menuItem: MenuItem) {
    const shoppingCartItem: ShoppingCartItem = { menuItem, quantity: 1, instructions: '' };
    this.shoppingCartService.add(this, this.shoppingCart, shoppingCartItem);
  }
}
