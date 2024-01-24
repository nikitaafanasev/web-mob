import { LitElement, html } from 'lit';
import { customElement, query, state } from 'lit/decorators.js';
import { consume } from '@lit/context';
import { Router, routerContext } from '../../../router.js';

import sharedStyle from '../../shared.css?inline';
import componentStyle from './sign-in.css?inline';
import { HttpError, httpClient } from '../../../http-client.js';
import { emit } from '../../../event.js';
import { UserService, userServiceContext } from '../../../services/user.service.js';

export const SIGN_IN_TITLE = 'Sign In';
@customElement('app-sign-in')
class SignInComponent extends LitElement {
  static styles = [sharedStyle, componentStyle];

  @consume({ context: routerContext, subscribe: true })
  router!: Router;

  @consume({ context: userServiceContext, subscribe: true })
  userService!: UserService;

  @query('form')
  formElement!: HTMLFormElement;

  connectedCallback() {
    super.connectedCallback();
    emit(this, 'app-page-title-changed', { title: SIGN_IN_TITLE });
  }

  render() {
    return html`
      <div class="padding responsive">
        <div class="centered">
          <ion-img src="logo.jpg"></ion-img>
        </div>
        <form>
          <ion-list>
            <ion-item>
              <ion-input
                name="email"
                label-placement="floating"
                label="Email"
                type="email"
                placeholder="mail@mailprovider.org"
                name="email"
              >
              </ion-input>
            </ion-item>
            <ion-item>
              <ion-input
                type="password"
                label-placement="floating"
                label="Password"
                name="password"
                placeholder="*****"
              ></ion-input>
            </ion-item>
          </ion-list>
          <div class="centered">
            <ion-button class="padding-y" @click=${this.submit}
              ><ion-icon name="log-in-outline"></ion-icon><span>Sign In</span></ion-button
            >
            <div class="medium-color">
              <ion-text>Don't have an account? Sign up <a href="/sign-up">here</a></ion-text>
            </div>
          </div>
        </form>
      </div>
    `;
  }

  async submit(event: Event) {
    event.preventDefault();
    const body = {
      email: this.formElement.email.value,
      password: this.formElement.password.value
    };
    try {
      const user = await this.userService.signIn(body);
      emit(this, 'app-user-changed', { user });
      this.router.goto('/menu');
      emit(this, 'app-open-toast', { message: 'You have been successfully signed in.', mode: 'success' });
    } catch (err) {
      const message = (err as HttpError).message ?? 'An unknown error occurred.';
      emit(this, 'app-open-toast', { message, mode: 'danger' });
    }
  }
}
