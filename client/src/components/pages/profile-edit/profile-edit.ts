import { LitElement, html } from 'lit';
import { customElement, query, state } from 'lit/decorators.js';
import { consume } from '@lit/context';
import { Router, routerContext } from '../../../router.js';

import sharedStyle from '../../shared.css?inline';
import componentStyle from './profile-edit.css?inline';
import { emit } from '../../../event.js';
import { User, userContext } from '../../../models/user.js';
import { UserService, userServiceContext } from '../../../services/user.service.js';
import { HttpError, httpClient } from '../../../http-client.js';

export const PROFILE_EDIT_TITLE = 'Edit Profile';
@customElement('app-profile-edit')
class ProfileEditComponent extends LitElement {
  static styles = [sharedStyle, componentStyle];

  @consume({ context: routerContext, subscribe: true })
  router!: Router;

  @consume({ context: userServiceContext })
  userService!: UserService;

  @consume({ context: userContext, subscribe: true })
  user?: User;

  @query('#imagePreview')
  imagePreview!: HTMLImageElement;

  @query('form')
  form!: HTMLFormElement;

  @query('ion-avatar')
  avatar!: HTMLIonAvatarElement;

  @query('#image')
  imageInput!: HTMLInputElement;

  connectedCallback() {
    super.connectedCallback();
    emit(this, 'app-page-title-changed', { title: PROFILE_EDIT_TITLE });
    emit(this, 'app-back-button-changed', { visible: true });
  }

  async firstUpdated() {
    this.user = await this.userService.findOne(this.user!.id);
    emit(this, 'app-user-changed', { user: this.user });
    if (this.user?.avatarUrl) {
      this.imagePreview.src = this.avatarUrl()!;
    }
    this.form.firstname.value = this.user?.name.first;
    this.form.lastname.value = this.user?.name.last;
    this.form.email.value = this.user?.email;
  }

  render() {
    return html`
      <div class="responsive padding centered">
        <ion-avatar @click=${() => this.imageInput.click()}>
          <img id="imagePreview" src="blank-profile-picture.png" />
        </ion-avatar>
        <form class="padding-y">
          <input id="image" name="image" type="file" accept="image/*" @change=${this.previewImage} />
          <ion-list>
            <ion-item>
              <ion-input label="Firstname" name="firstname" placeholder="John"> </ion-input>
            </ion-item>
            <ion-item>
              <ion-input label="Lastname" name="lastname" type="lastname" placeholder="Doe"> </ion-input>
            </ion-item>
            <ion-item>
              <ion-input label="Email" name="email" type="email" placeholder="mail@mailprovider.org"> </ion-input>
            </ion-item>
          </ion-list>
          <div class="centered padding">
            <ion-button @click=${this.submit}
              ><ion-icon name="save-outline"></ion-icon><span>Save Changes</span></ion-button
            >
          </div>
        </form>
      </div>
    `;
  }

  avatarUrl() {
    if (this.user?.avatarUrl) {
      return `${this.user?.avatarUrl}#${new Date().getTime()}`;
    }
  }

  previewImage(event: Event) {
    const target: HTMLInputElement = event.target as HTMLInputElement;
    if (target.files?.length) {
      this.imagePreview.src = URL.createObjectURL(target.files![0]);
    }
  }

  async submit() {
    const data = new FormData(this.form);
    try {
      await httpClient.api.patch('users', data);
      await httpClient.api.patch('users', {
        name: { first: this.form.firstname.value, last: this.form.lastname.value }
      });
      const user = await (await httpClient.api.get('/users/' + this.user?.id)).json();
      emit(this, 'app-user-updated', user);
      if (user.avatarUrl) {
        await fetch(user.avatarUrl, { cache: 'no-cache', credentials: 'include' });
      }
      emit(this, 'app-open-toast', { message: 'Profile updated successfully', mode: 'success' });
      this.router.back();
    } catch (e) {
      emit(this, 'app-open-toast', { message: (e as HttpError).message, mode: 'danger' });
    }
  }
}
