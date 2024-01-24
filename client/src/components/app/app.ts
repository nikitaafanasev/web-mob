import { LitElement, html, nothing } from 'lit';
import { customElement, query, state } from 'lit/decorators.js';
import { provide } from '@lit/context';
import { Router, routerContext } from '../../router.js';
import { TaskService, taskServiceContext } from '../../services/task.service.js';
import { httpClient } from '../../http-client.js';
import sharedStyle from '../shared.css?inline';
import componentStyle from './app.css?inline';
import { FOOD_MENU_TITLE } from '../pages/menu/menu.js';
import { HOME_TITLE } from '../pages/home/home.js';
import { SIGN_IN_TITLE } from '../pages/sign-in/sign-in.js';
import { SIGN_UP_TITLE } from '../pages/sign-up/sign-up.js';
import { SHOPPING_CART_TITLE } from '../pages/shopping-cart/shopping-cart.js';
import { MenuItemService, menuItemServiceContext } from '../../services/menu-item.service.js';
import { ShoppingCart, shoppingCartContext } from '../../models/shopping-cart.js';
import { AppModal } from '../../modal.js';
import { emit } from '../../event.js';
import { OrderService, orderServiceContext } from '../../services/order-service.js';
import { User, UserRole, userContext } from '../../models/user.js';
import { StringService, stringServiceContext } from '../../services/string.service.js';
import { UserService, userServiceContext } from '../../services/user.service.js';
import { ShoppingCartService, shoppingCartServiceContext } from '../../services/shopping-cart.service.js';
import { SETTINGS_TITLE } from '../pages/settings/settings.js';
import { TASKS_TITLE } from '../pages/tasks/tasks.js';
import { RESERVATION_TITLE } from '../pages/reservation/reservation.js';
import { BILL_TITLE } from '../pages/bill/bill.js';
import { BillService, billServiceContext } from '../../services/bill.service.js';
import { Share } from '@capacitor/share';

const TOAST_DURATION = 5000; // ms

export const APP_TITLE = 'Restaurant App';

@customElement('app-root')
class AppComponent extends LitElement {
  static styles = [sharedStyle, componentStyle];

  tabButtonMap: { [key: string]: TabButton } = {
    home: { href: 'home', icon: 'home', label: HOME_TITLE },
    signIn: { href: 'sign-in', icon: 'log-in', label: SIGN_IN_TITLE },
    signUp: { href: 'sign-up', icon: 'log-in', label: SIGN_UP_TITLE },
    menu: { href: 'menu', icon: 'fast-food', label: FOOD_MENU_TITLE },
    shoppingCart: {
      href: 'shopping-cart',
      icon: 'cart',
      label: SHOPPING_CART_TITLE,
      notificationCount: () => {
        return this.shoppingCart.reduce((acc, item) => acc + item.quantity, 0);
      }
    },
    bill: { href: 'bill', icon: 'receipt', label: BILL_TITLE },
    reservation: { href: 'reservation', icon: 'calendar-number', label: RESERVATION_TITLE },
    tasks: { href: 'tasks', icon: 'reader', label: TASKS_TITLE },
    settings: { href: 'settings', icon: 'settings', label: SETTINGS_TITLE }
  };

  @provide({ context: routerContext })
  @state()
  router = new Router(
    this,
    [
      { path: '/', render: () => html`<app-home></app-home>` },
      { path: '/home', render: () => html`<app-home></app-home>` },
      { path: '/sign-in', render: () => html`<app-sign-in></app-sign-in>` },
      { path: '/sign-up', render: () => html`<app-sign-up></app-sign-up>` },
      { path: '/menu', render: () => html`<app-menu></app-menu>` },
      { path: '/menu/:id', render: params => html`<app-menu-item .id=${params.id}></app-menu-item>` },
      { path: '/menu/:id/edit', render: params => html`<app-menu-item-edit .id=${params.id}></app-menu-item-edit>` },
      { path: '/shopping-cart', render: () => html`<app-shopping-cart></app-shopping-cart>` },
      { path: '/bill', render: () => html`<app-bill></app-bill>` },
      { path: '/reservation', render: () => html`<app-reservation></app-reservation>` },
      { path: '/tasks', render: () => html`<app-tasks></app-tasks>` },
      { path: '/settings', render: () => html`<app-settings></app-settings>` },
      { path: '/orders', render: () => html`<app-orders></app-orders>` },
      { path: '/profile/edit', render: () => html`<app-profile-edit></app-profile-edit>` },
      { path: '/reservation/edit', render: () => html`<app-reservation-edit></app-reservation-edit>` }
    ],
    { fallback: { render: () => html`<div>Page not found!</div>` } }
  );

  @state()
  tabButtons: TabButton[] = [];

  @provide({ context: taskServiceContext })
  @state()
  taskService = new TaskService();

  @provide({ context: menuItemServiceContext })
  @state()
  menuItemService = new MenuItemService();

  @provide({ context: orderServiceContext })
  @state()
  orderService = new OrderService();

  @provide({ context: stringServiceContext })
  @state()
  stringService = new StringService();

  @provide({ context: userServiceContext })
  @state()
  userService = new UserService();

  @provide({ context: billServiceContext })
  @state()
  billService = new BillService();

  @provide({ context: shoppingCartServiceContext })
  @state()
  shoppingCartService: ShoppingCartService = new ShoppingCartService();

  @provide({ context: shoppingCartContext })
  @state()
  shoppingCart: ShoppingCart = [];

  @provide({ context: userContext })
  @state()
  user?: User;

  @query('ion-toast')
  toast!: HTMLIonToastElement;

  @query('ion-modal')
  modal!: HTMLIonModalElement;

  @state()
  modalContent?: AppModal;

  @state()
  title = APP_TITLE;

  @state()
  isBackButtonVisible = false;

  @query('ion-modal form')
  modalForm?: HTMLFormElement;

  @query('ion-action-sheet')
  actionSheet!: HTMLIonActionSheetElement;

  constructor() {
    super();
    httpClient.init({
      baseURL: `http://stud-vm-0826:3000`,
      apiPath: 'api',
      filesPath: 'files'
    });
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('app-open-toast', (event: Event) => {
      const detail = (event as CustomEvent).detail;
      switch (detail.mode) {
        case 'danger':
          this.toast.color = 'danger';
          this.toast.icon = 'alert-circle-outline';
          break;
        case 'success':
          this.toast.color = 'success';
          this.toast.icon = 'checkmark-circle-outline';
          break;
        case 'warning':
          this.toast.color = 'warning';
          this.toast.icon = 'warning-outline';
          break;
      }
      if (this.toast.isOpen) {
        this.toast.isOpen = false;
      }
      this.toast.isOpen = true;
      this.toast.message = (event as CustomEvent).detail.message;
    });

    this.addEventListener('app-page-title-changed', (event: Event) => {
      this.title = (event as CustomEvent).detail.title;
      this.isBackButtonVisible = false;
    });

    this.shoppingCart = JSON.parse(sessionStorage.getItem(shoppingCartContext.toString()) ?? '[]');
    this.addEventListener('app-shopping-cart-changed', (event: Event) => {
      this.shoppingCart = (event as CustomEvent).detail.shoppingCart;
      sessionStorage.setItem(shoppingCartContext.toString(), JSON.stringify(this.shoppingCart));
    });

    this.addEventListener('app-modal-opened', (event: Event) => {
      this.modalContent = (event as CustomEvent).detail.modal;
      this.modal.isOpen = true;
    });

    this.addEventListener('app-back-button-changed', (event: Event) => {
      setTimeout(() => (this.isBackButtonVisible = (event as CustomEvent).detail.visible), 0);
    });

    this.addEventListener('app-action-sheet-opened', (event: Event) => {
      this.actionSheet.header = (event as CustomEvent).detail.header;
      this.actionSheet.buttons = (event as CustomEvent).detail.buttons;
      this.actionSheet.isOpen = true;
    });

    this.addEventListener('app-action-sheet-closed', () => {
      this.actionSheet.isOpen = false;
    });

    try {
      const item = sessionStorage.getItem(userContext.toString());
      if (item) {
        this.user = JSON.parse(item);
      }
    } catch (err) {
      this.user = undefined;
    }

    this.user = JSON.parse(sessionStorage.getItem(userContext.toString()) ?? 'null');
    this.assignTabButtons();
    this.addEventListener('app-user-changed', (event: Event) => {
      this.user = (event as CustomEvent).detail.user;
      console.log(this.user);
      this.assignTabButtons();
      if (this.user) {
        this.user = (event as CustomEvent).detail.user;
        sessionStorage.setItem(userContext.toString(), JSON.stringify(this.user));
      } else {
        sessionStorage.removeItem(userContext.toString());
      }
    });
  }

  async firstUpdated() {
    await Share.share({
      url: 'http://localhost:8080'
    });
  }

  createRenderRoot() {
    return this;
  }

  render() {
    return html`
      <ion-app>
        <ion-toast
          color="danger"
          expand="block"
          swipe-gesture="vertical"
          duration="${TOAST_DURATION}"
          position="top"
        ></ion-toast>
        <ion-action-sheet header="Actions"></ion-action-sheet>
        <ion-tabs>
          <ion-header slot="top" transluscent="true">
            <ion-toolbar>
              ${
                this.isBackButtonVisible
                  ? html`<ion-buttons slot="start">
                      <ion-back-button default-href="#" @click=${() => this.router.back()}></ion-back-button>
                    </ion-buttons>`
                  : nothing
              }
              <ion-title>${this.title}</ion-title>
            </ion-toolbar>
          </ion-header>
          <ion-content>${this.router.outlet()}</main> </ion-content>
          ${this.renderModal()}
          <ion-tab-bar slot="bottom"> ${this.tabButtons.map(button => this.renderTabButton(button))} </ion-tab-bar>
        </ion-tabs>
      </ion-app>
    `;
  }

  assignTabButtons() {
    switch (this.user?.role) {
      case UserRole.ADMIN:
        this.tabButtons = [
          this.tabButtonMap.menu,
          this.tabButtonMap.shoppingCart,
          this.tabButtonMap.tasks,
          this.tabButtonMap.settings
        ];
        break;
      case UserRole.BARKEEPER:
        this.tabButtons = [this.tabButtonMap.menu, this.tabButtonMap.tasks, this.tabButtonMap.settings];
        break;
      case UserRole.CHEF:
        this.tabButtons = [this.tabButtonMap.menu, this.tabButtonMap.tasks, this.tabButtonMap.settings];
        break;
      case UserRole.WAITER:
        this.tabButtons = [this.tabButtonMap.menu, this.tabButtonMap.tasks, this.tabButtonMap.settings];
        break;
      case UserRole.GUEST:
        this.tabButtons = [
          this.tabButtonMap.menu,
          this.tabButtonMap.shoppingCart,
          this.tabButtonMap.bill,
          this.tabButtonMap.reservation,
          this.tabButtonMap.settings
        ];
        break;
      default:
        this.tabButtons = [this.tabButtonMap.home, this.tabButtonMap.signIn];
        break;
    }
  }

  renderTabButton(options: TabButton) {
    const selected = this.title === options.label;
    return html`<ion-tab-button href=${options.href} @click=${() => (this.title = options.label)}>
      ${options.icon
        ? html`
            <ion-icon
              color=${selected ? 'primary' : nothing}
              name="${selected ? options.icon : options.icon + '-outline'}"
            ></ion-icon>
            ${this.renderNotificationCountBadge(options)}
          `
        : nothing}
      <ion-label color=${selected ? 'primary' : nothing}>${options.label}</ion-label></ion-tab-button
    > `;
  }

  renderNotificationCountBadge(options: TabButton) {
    const notificationCount = options.notificationCount?.();
    return notificationCount ? html`<ion-badge color="success">${notificationCount}</ion-badge>` : nothing;
  }

  renderModal() {
    return html` <ion-modal>
      <ion-header>
        <ion-toolbar>
          <ion-title>${this.modalContent?.header.title}</ion-title>
          <ion-buttons slot="start">
            <ion-button @click=${this.closeModal}>${this.modalContent?.header.buttons.left}</ion-button>
          </ion-buttons>
          <ion-buttons slot="end">
            <ion-button @click=${this.submitModal}>${this.modalContent?.header.buttons.right}</ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding"> ${this.modalContent?.content} </ion-content>
    </ion-modal>`;
  }

  closeModal() {
    this.modal.isOpen = false;
  }

  submitModal() {
    this.closeModal();
    const formData = this.modalForm?.querySelectorAll('*[name]');
    // @ts-ignore
    const data = Array.from(formData ?? []).reduce((acc, { name, value }) => ({ ...acc, [name]: value }), {});
    // set all values to default
    formData?.forEach(element => {
      const elementName = (element as unknown as { name: string }).name;
      (element as unknown as { value: unknown }).value = this.modalContent?.formDefaultValues?.[elementName];
    });
    this.modalForm?.reset();
    emit(this.modalContent?.context!, 'app-modal-closed', { data });
  }

  async changeTab(options: TabButton) {
    this.title = options.label;
    this.router.goto(options.href);
  }
}

export type TabButton = {
  href: string;
  icon: string;
  label: string;
  notificationCount?: () => number;
};
