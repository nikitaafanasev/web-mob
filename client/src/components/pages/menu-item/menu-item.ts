import { LitElement, TemplateResult, html, nothing } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { consume } from '@lit/context';
import { Router, routerContext } from '../../../router.js';
import sharedStyle from '../../shared.css?inline';
import componentStyle from './menu-item.css?inline';
import { emit } from '../../../event.js';
import {
  MenuItem,
  MenuItemService,
  NOT_RATED_LABEL,
  menuItemServiceContext
} from '../../../services/menu-item.service.js';
import { HttpError, httpClient } from '../../../http-client.js';
import { FOOD_MENU_TITLE } from '../menu/menu.js';
import { AppModal } from '../../../modal.js';
import { ShoppingCart, ShoppingCartItem, shoppingCartContext } from '../../../models/shopping-cart.js';
import { StringService, stringServiceContext } from '../../../services/string.service.js';
import { UserService, userServiceContext } from '../../../services/user.service.js';
import { User, userContext } from '../../../models/user.js';
import { ShoppingCartService, shoppingCartServiceContext } from '../../../services/shopping-cart.service.js';
import { AppActionSheet } from '../../../action-sheet.js';

const FORM_DEFAULT_VALUES = {
  quantity: 1,
  instructions: ''
};

export const FOOD_MENU_ITEM_TITLE = FOOD_MENU_TITLE;
@customElement('app-menu-item')
class MenuItemComponent extends LitElement {
  static styles = [sharedStyle, componentStyle];

  @consume({ context: routerContext, subscribe: true })
  router!: Router;

  @consume({ context: menuItemServiceContext, subscribe: true })
  menuItemService!: MenuItemService;

  @consume({ context: stringServiceContext, subscribe: true })
  stringService!: StringService;

  @consume({ context: shoppingCartContext, subscribe: true })
  shoppingCart!: ShoppingCart;

  @consume({ context: userServiceContext, subscribe: true })
  userService!: UserService;

  @consume({ context: shoppingCartServiceContext, subscribe: true })
  shoppingCartService!: ShoppingCartService;

  @consume({ context: userContext, subscribe: true })
  user?: User;

  @state()
  quantityValue = 1;

  @query('#imagePreview')
  imagePreview!: HTMLImageElement;

  @query('#uploadForm')
  formElement!: HTMLFormElement;

  @query('ion-textarea[name="content"]')
  commentElement!: HTMLIonTextareaElement;

  @property()
  id!: string;

  @state()
  menuItem?: MenuItem;

  @state()
  userMap: Map<string, User> = new Map();

  @state()
  myRating = 0;

  @state()
  averageRatingLabel = '';

  @query('ion-accordion-group')
  accordionGroupElement!: HTMLIonAccordionGroupElement;

  @query('#titleImage')
  titleImageElement!: HTMLIonImgElement;

  @state()
  isFavorite = false;

  emitEvents() {
    emit(this, 'app-page-title-changed', { title: this.menuItem?.name || FOOD_MENU_ITEM_TITLE });
    emit(this, 'app-back-button-changed', { visible: true });
  }

  connectedCallback() {
    super.connectedCallback();
    this.emitEvents();
    this.addEventListener('app-modal-closed', (event: Event) => {
      const data = (event as CustomEvent).detail.data;
      const shoppingCartItem: ShoppingCartItem = { ...data, quantity: Number(data.quantity), menuItem: this.menuItem! };
      this.shoppingCartService.add(this, this.shoppingCart, shoppingCartItem);
      this.router.back();
    });
    this.isFavorite = sessionStorage.getItem(`fav/${this.id}/${this.user?.id}`) === 'true';
  }

  async fetchData() {
    try {
      this.menuItem = await this.menuItemService.findOne(this.id);
      this.userMap = await this.userService.findMany(this.menuItem.comments.map(comment => comment.creatorId));
      this.averageRatingLabel = this.menuItemService.getAverageRatingLabel(this.menuItem);
      this.myRating = this.menuItem.ratings?.find(r => r.creatorId === this.user?.id)?.value || 0;
    } catch (err) {
      emit(this, 'app-open-toast', { message: (err as HttpError).message, mode: 'danger' });
      this.router.back();
    }
    this.emitEvents();
  }

  async firstUpdated() {
    this.accordionGroupElement.value = 'first';
    this.fetchData();
  }

  render() {
    return html` <div class="responsive">
      <div class="img-container">
        <!-- do not use ion-image, because it will sometimes cause an error -->
        <img id="titleImage" src="${this.menuItemService.getImageUrl(this.menuItem)}" />
        <div class="img-content-container centered space-between">
          <div class="action-button-wrapper">
            <div class="centered padding-left">
              <ion-icon name="cash-outline"></ion-icon><span>$ ${this.menuItem?.price}</span>
            </div>
            <div class="centered padding-x">
              <ion-icon name="star"></ion-icon><span>${this.menuItemService.getAverageRatingLabel(this.menuItem)}</span>
            </div>
          </div>
          <div class="action-button-wrapper">
            ${this.user?.role === 'guest'
              ? html` <div class="centered padding-x">
                  <ion-icon
                    name="heart${this.isFavorite ? '' : '-outline'}"
                    size="large"
                    @click=${this.addToFavorites}
                  ></ion-icon>
                </div>`
              : nothing}
            ${this.user?.role === 'guest'
              ? html` <div class="centered padding-right">
                  <ion-icon @click=${this.openShareActionSheet} name="share-outline" size="large"></ion-icon>
                </div>`
              : nothing}
            ${!this.user || this.user?.role === 'guest'
              ? nothing
              : html`
                  <div class="centered padding-right">
                    <ion-icon name="ellipsis-horizontal-circle" size="large" @click=${this.openActionSheet}></ion-icon>
                  </div>
                `}
          </div>
        </div>
        <ion-accordion-group>
          <ion-accordion value="first">
            <ion-item slot="header">
              <ion-label>Description</ion-label>
            </ion-item>
            <div class="padding accordion-element" slot="content">${this.menuItem?.description}</div>
          </ion-accordion>
          <ion-accordion value="second">
            <ion-item slot="header">
              <ion-label>Allergens and Additives</ion-label>
            </ion-item>
            <div class="padding accordion-element" slot="content">contains 1, 3, 5, 6, 8, 13, 17, A, AWE, C and G</div>
          </ion-accordion>
          <ion-accordion value="third">
            <ion-item slot="header">
              <ion-label>Comments (${this.menuItem?.comments.length})</ion-label>
            </ion-item>
            <div slot="content">
              <ion-list>
                <ion-item-divider>Your Comment</ion-item-divider>
                <form>
                  <ion-item>
                    <ion-textarea
                      name="content"
                      label="Content"
                      auto-grow="true"
                      placeholder="Enter text here"
                    ></ion-textarea>
                  </ion-item>
                  <div class="centered padding">
                    <ion-button size="medium" @click=${this.submitComment}><span>Publish</span></ion-button>
                  </div>
                </form>
                ${this.renderComments()}
              </ion-list>
            </div>
          </ion-accordion>
          <ion-accordion value="fourth">
            <ion-item slot="header">
              <ion-label>Rating</ion-label>
            </ion-item>
            <div class="padding" slot="content">
              <div class="stars-container centered">${this.renderStars(1, 5)}</div>
              <div class="average-info centered">
                ${this.menuItemService.getAverageRatingLabel(this.menuItem) !== NOT_RATED_LABEL
                  ? 'average value is ' + this.menuItemService.getAverageRatingLabel(this.menuItem)
                  : this.menuItem?.name + " hasn't been rated yet. Be the first to rate it!"}
              </div>
            </div>
          </ion-accordion>
        </ion-accordion-group>
        <div class="centered padding">
          <ion-button class="centered" @click=${this.openModal}
            ><ion-icon name="cart-outline"></ion-icon><span>Add to Shopping Cart</span></ion-button
          >
        </div>
      </div>
    </div>`;
  }

  renderStars(from: number, to: number) {
    const numbers = Array.from({ length: to - from + 1 }, (_, i) => i + from);
    return numbers.map(
      n =>
        html`<div @click=${() => this.postRating(n)}>
          <ion-icon name="${n <= this.myRating ? 'star' : 'star-outline'}" size="large"></ion-icon>
        </div>`
    );
  }

  renderComments() {
    return this.menuItem?.comments.length
      ? html`
          <ion-item-divider>Other Comments</ion-item-divider>
          ${this.menuItem?.comments.map(
            comment => html`
              <ion-item>
                <ion-avatar slot="start">
                  <ion-img
                    src=${this.userMap.get(comment.creatorId)?.avatarUrl || 'blank-profile-picture.png'}
                  ></ion-img>
                </ion-avatar>
                <ion-label>
                  <h3>${this.userMap.get(comment.creatorId)?.name.first}</h3>
                  <p>${comment.content}</p>
                </ion-label>
                <ion-note slot="end">${this.stringService.date(comment.createdAt)}</ion-note>
              </ion-item>
            `
          )}
        `
      : nothing;
  }

  renderForm() {
    return html` <style>
        ion-range {
          margin-bottom: 1rem;
        }
      </style>
      <form>
        <ion-list>
          <ion-item>
            <ion-label>Quantity</ion-label>
            <ion-range
              aria-label="Custom range"
              min="1"
              max="5"
              value="${FORM_DEFAULT_VALUES.quantity}"
              pin="true"
              ticks="true"
              snaps="true"
              name="quantity"
            ></ion-range>
          </ion-item>
          <ion-item>
            <ion-textarea
              label="Special Requests"
              label-placement="floating"
              placeholder="Enter text"
              auto-grow="true"
              value="${FORM_DEFAULT_VALUES.instructions}"
              name="instructions"
            ></ion-textarea>
          </ion-item>
        </ion-list>
      </form>`;
  }

  async postRating(n: number) {
    try {
      await this.menuItemService.createRating(this.menuItem!.id, { value: n });
      emit(this, 'app-open-toast', { message: 'Rating successfully added.', mode: 'success' });
    } catch (err) {
      emit(this, 'app-open-toast', { message: (err as HttpError).message, mode: 'danger' });
    }
    this.myRating = n;
    this.closeAccordion();
    await this.fetchData();
  }

  openModal() {
    const modal: AppModal = {
      header: {
        buttons: {
          left: 'Cancel',
          right: 'Add'
        },
        title: this.menuItem!.name
      },
      content: this.renderForm(),
      formDefaultValues: FORM_DEFAULT_VALUES,
      context: this
    };
    emit(this, 'app-modal-opened', { modal: { ...modal } });
  }

  previewImage(event: Event) {
    const target: HTMLInputElement = event.target as HTMLInputElement;
    if (target.files?.length) {
      this.imagePreview.src = URL.createObjectURL(target.files![0]);
    }
  }

  async uploadImage(event: Event) {
    const data = new FormData(this.formElement);
    try {
      await httpClient.api.patch('menu-items/' + this.menuItem?.id, data);
      emit(this, 'app-open-toast', { message: 'Menu item successfully updated.', mode: 'success' });
    } catch (err) {
      emit(this, 'app-open-toast', { message: (err as HttpError).message, mode: 'danger' });
    }
    await this.fetchData();
  }

  async submitComment(event: Event) {
    event.preventDefault();
    const data = {
      content: this.commentElement.value || ''
    };
    try {
      await this.menuItemService.createComment(this.menuItem!.id, data);
      emit(this, 'app-open-toast', { message: 'Comment successfully added.', mode: 'success' });
    } catch (err) {
      emit(this, 'app-open-toast', { message: (err as HttpError).message, mode: 'danger' });
    }
    await this.fetchData();
  }

  async closeAccordion() {
    this.accordionGroupElement.value = [];
  }

  openShareActionSheet() {
    const actionSheet: AppActionSheet = {
      header: 'Share',
      buttons: [
        {
          text: 'Whatsapp',
          data: {
            action: 'share'
          },
          handler: () => {
            this.closeActionSheet();
          }
        },
        {
          text: 'Facebook',
          data: {
            action: 'share'
          },
          handler: () => {
            this.closeActionSheet();
          }
        },
        {
          text: 'Twitter',
          data: {
            action: 'share'
          },
          handler: () => {
            this.closeActionSheet();
          }
        },
        {
          text: 'Instagram',
          data: {
            action: 'share'
          },
          handler: () => {
            this.closeActionSheet();
          }
        },
        {
          text: 'LinkedIn',
          data: {
            action: 'share'
          },
          handler: () => {
            this.closeActionSheet();
          }
        },
        {
          text: 'Pinterest',
          data: {
            action: 'share'
          },
          handler: () => {
            this.closeActionSheet();
          }
        },
        {
          text: 'Reddit',
          data: {
            action: 'share'
          },
          handler: () => {
            this.closeActionSheet();
          }
        },
        {
          text: 'Tumblr',
          data: {
            action: 'share'
          },
          handler: () => {
            this.closeActionSheet();
          }
        },
        {
          text: 'Email',
          data: {
            action: 'share'
          },
          handler: () => {
            this.closeActionSheet();
          }
        },
        {
          text: 'Cancel',
          role: 'cancel',
          data: {
            action: 'cancel'
          },
          handler: () => {
            this.closeActionSheet();
          }
        }
      ]
    };
    emit(this, 'app-action-sheet-opened', actionSheet);
  }

  openActionSheet() {
    const actionSheet: AppActionSheet = {
      header: 'Select Action',
      buttons: [
        {
          text: 'Edit',
          data: {
            action: 'edit'
          },
          handler: () => {
            this.closeActionSheet();
            this.router.goto('/menu/' + this.menuItem?.id + '/edit');
          }
        },
        {
          text: 'Remove',
          data: {
            action: 'remove'
          },
          handler: () => {
            this.closeActionSheet();
            this.removeMenuItem();
          }
        },
        {
          text: 'Cancel',
          role: 'cancel',
          data: {
            action: 'cancel'
          },
          handler: () => {
            this.closeActionSheet();
          }
        }
      ]
    };
    emit(this, 'app-action-sheet-opened', actionSheet);
  }

  removeMenuItem() {
    this.menuItemService.remove(this.menuItem!.id);
    emit(this, 'app-open-toast', { message: 'Menu item successfully removed.', mode: 'success' });
    this.router.back();
  }

  closeActionSheet() {
    emit(this, 'app-action-sheet-closed');
  }

  addToFavorites() {
    if (this.isFavorite) {
      this.isFavorite = false;
      sessionStorage.setItem(`fav/${this.id}/${this.user?.id}`, 'false');
      emit(this, 'app-open-toast', { message: 'Menu item successfully removed from favorites.', mode: 'success' });
      return;
    }
    this.isFavorite = true;
    sessionStorage.setItem(`fav/${this.id}/${this.user?.id}`, 'true');
    emit(this, 'app-open-toast', { message: 'Menu item successfully added to favorites.', mode: 'success' });
  }
}
