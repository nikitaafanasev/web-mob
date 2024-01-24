import { LitElement, html } from 'lit';
import { customElement, query, state } from 'lit/decorators.js';
import { consume } from '@lit/context';
import { Router, routerContext } from '../../../router.js';

import sharedStyle from '../../shared.css?inline';
import componentStyle from './sign-up.css?inline';
import { HttpError, httpClient } from '../../../http-client.js';
import { emit } from '../../../event.js';
import { UserService, userServiceContext } from '../../../services/user.service.js';

export const SIGN_UP_TITLE = 'Sign Up';
@customElement('app-sign-up')
class SignUpComponent extends LitElement {
  static styles = [sharedStyle, componentStyle];

  @consume({ context: routerContext, subscribe: true })
  router!: Router;

  @consume({ context: userServiceContext, subscribe: true })
  userService!: UserService;

  @query('form')
  formElement!: HTMLFormElement;

  connectedCallback() {
    super.connectedCallback();
    emit(this, 'app-page-title-changed', { title: SIGN_UP_TITLE });
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
              <ion-input label-placement="floating" label="Firstname" name="firstname" placeholder="John"> </ion-input>
            </ion-item>
            <ion-item>
              <ion-input label-placement="floating" label="Lastname" name="lastname" type="lastname" placeholder="Doe">
              </ion-input>
            </ion-item>
            <ion-item>
              <ion-input
                label-placement="floating"
                label="Email"
                name="email"
                type="email"
                placeholder="mail@mailprovider.org"
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
            <ion-item>
              <ion-input
                type="password"
                label-placement="floating"
                label="Password check"
                name="passwordCheck"
                placeholder="*****"
              ></ion-input>
            </ion-item>
          </ion-list>
        </form>
        <div class="centered">
          <ion-button class="padding-y centered" expand="block" @click=${this.submit}
            ><ion-icon name="log-in-outline"></ion-icon><span>Sign Up</span></ion-button
          >
        </div>
        <ion-row class="centered medium-color"
          ><div class>Already have an account? Sign in <a href="/sign-in">here</a></div>
          <ion-row> </ion-row
        ></ion-row>
      </div>
    `;
  }

  async submit(event: Event) {
    event.preventDefault();
    const body = {
      email: this.formElement.email.value,
      password: this.formElement.password.value,
      name: {
        first: this.formElement.firstname.value,
        last: this.formElement.lastname.value
      },
      passwordCheck: this.formElement.passwordCheck.value
    };
    try {
      this.userService;
      const user = await this.userService.signUp(body);
      console.log(user);
      emit(this, 'app-user-changed', { user: user });
      emit(this, 'app-open-toast', { message: 'You have been successfully signed up.', mode: 'success' });
      this.router.goto('/menu');
    } catch (err) {
      const message = (err as HttpError).message ?? 'An unknown error occurred.';
      emit(this, 'app-open-toast', { message, mode: 'danger' });
    }
  }
}
