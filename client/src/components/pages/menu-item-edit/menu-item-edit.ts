import { LitElement, html, nothing } from 'lit';
import { customElement, query, state } from 'lit/decorators.js';
import { consume } from '@lit/context';
import { Router, routerContext } from '../../../router.js';

import sharedStyle from '../../shared.css?inline';
import componentStyle from './menu-item-edit.css?inline';
import { emit } from '../../../event.js';
import {
  MenuItem,
  MenuItemService,
  NOT_RATED_LABEL,
  menuItemServiceContext
} from '../../../services/menu-item.service.js';
import { HttpError, httpClient } from '../../../http-client.js';
import { FOOD_MENU_TITLE } from '../menu/menu.js';
import { ShoppingCart, ShoppingCartItem, shoppingCartContext } from '../../../models/shopping-cart.js';
import { StringService, stringServiceContext } from '../../../services/string.service.js';
import { UserService, userServiceContext } from '../../../services/user.service.js';
import { User, userContext } from '../../../models/user.js';

export const MENU_ITEM_EDIT_TITLE = 'Edit';
export const FOOD_MENU_ITEM_TITLE = FOOD_MENU_TITLE;
@customElement('app-menu-item-edit')
class MenuItemEditComponent extends LitElement {
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

  @consume({ context: userContext, subscribe: true })
  user?: User;

  @state()
  quantityValue = 1;

  @query('#imagePreview')
  imagePreview!: HTMLImageElement;

  @query('form')
  formElement!: HTMLFormElement;

  @query('ion-textarea[name="content"]')
  commentElement!: HTMLIonTextareaElement;

  @state()
  menuItem?: MenuItem;

  @state()
  userMap: Map<string, User> = new Map();

  @state()
  myRating = 0;

  @state()
  averageRatingLabel = '';

  @query('ion-item-group')
  itemGroupElement!: HTMLIonItemGroupElement;

  @query('#titleImage')
  titleImageElement!: HTMLIonImgElement;

  @query('#image')
  imageInput!: HTMLInputElement;

  emitEvents() {
    emit(this, 'app-page-title-changed', { title: this.menuItem?.name || FOOD_MENU_ITEM_TITLE });
    emit(this, 'app-back-button-changed', { visible: true });
  }

  connectedCallback() {
    super.connectedCallback();
    emit(this, 'app-page-title-changed', { title: MENU_ITEM_EDIT_TITLE });
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
    this.fetchData();
  }

  render() {
    return html` <div class="responsive">
      <div class="img-container">
        <!-- do not use ion-image, because it will sometimes cause an error -->
        <img id="titleImage" src="${this.menuItemService.getImageUrl(this.menuItem)}" @click=${() =>
          this.imageInput.click()} />
        <div class="img-content-container centered space-between">
          <div class="centered padding-x">
            <ion-icon name="star"></ion-icon><span>${this.menuItemService.getAverageRatingLabel(this.menuItem)}</span>
          </div>
            <form class="padding-y">
          <input id="image" name="image" type="file" accept="image/*" @change=${this.previewImage} />
          <ion-icon name="cloud-upload-outline" size="large" slot="end" @click=${() =>
            this.imageInput.click()}></ion-icon>
          </div>
        </form>

          </div>
        </div>
      </div>

      <ion-list>
  <ion-item-group>

      <ion-item>
    
       <ion-input label="Description" label-placement="stacked" placeholder="${
         this.menuItem?.description || 'Enter text'
       }"></ion-input>
      </ion-item>


      <ion-item>
       <ion-input label="Allergens and Additives" label-placement="stacked" placeholder="contains 1, 3, 5, 6, 8, 13, 17, A, AWE, C and G"></ion-input>
      </ion-item>
      <ion-item>
       <ion-input label="Price" label-placement="stacked" placeholder="${
         this.menuItem?.price || 'Enter text'
       }"></ion-input>
      </ion-item>
      </ion-item>
      <ion-list>
</ion-list>

<ion-list>
  <ion-item>
    <ion-select placeholder="Select Category">
      <div slot="label">Category <ion-text color="danger">(Required)</ion-text></div>
      <ion-select-option value="dessert">Dessert</ion-select-option>
      <ion-select-option value="entree">Entree</ion-select-option>
      <ion-select-option value="vegetarian">Vegetarian</ion-select-option>
    </ion-select>
  </ion-item>
</ion-list>

      <ion-item>
        <ion-toggle .checked=${this.menuItem !== undefined}>
          <div>Publish</div>
        </ion-toggle>
      </ion-item>

      </ion-item-group>
</ion-list>
      </div>`;
  }

  async uploadImage() {
    const data = new FormData(this.formElement);
    try {
      const menuItem = await httpClient.api.patch('menu-items/' + this.menuItem?.id, data);
      emit(this, 'app-open-toast', { message: 'Menu item successfully updated.', mode: 'success' });
    } catch (err) {
      emit(this, 'app-open-toast', { message: (err as HttpError).message, mode: 'danger' });
    }
  }

  renderStars(from: number, to: number) {
    const numbers = Array.from({ length: to - from + 1 }, (_, i) => i + from);
    return numbers.map(
      n =>
        html`<div>
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
              value=""
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
              value=""
              name="instructions"
            ></ion-textarea>
          </ion-item>
        </ion-list>
      </form>`;
  }

  async previewImage(event: Event) {
    const target: HTMLInputElement = event.target as HTMLInputElement;
    if (target.files?.length) {
      this.titleImageElement.src = URL.createObjectURL(target.files![0]);
      await this.uploadImage();
    }
  }
}
