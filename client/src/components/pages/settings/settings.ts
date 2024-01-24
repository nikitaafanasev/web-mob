import { LitElement, html, nothing } from 'lit';
import { customElement, query, state } from 'lit/decorators.js';
import { consume } from '@lit/context';
import { Router, routerContext } from '../../../router.js';

import sharedStyle from '../../shared.css?inline';
import componentStyle from './settings.css?inline';
import { emit } from '../../../event.js';
import { UserService, userServiceContext } from '../../../services/user.service.js';
import { TaskService, TaskType, taskServiceContext } from '../../../services/task.service.js';
import { HttpError } from '../../../http-client.js';
import { User, UserRole, userContext } from '../../../models/user.js';

export const SETTINGS_TITLE = 'Settings';
@customElement('app-settings')
class SignInComponent extends LitElement {
  static styles = [sharedStyle, componentStyle];

  @consume({ context: routerContext, subscribe: true })
  router!: Router;

  @consume({ context: userServiceContext })
  userService!: UserService;

  @consume({ context: userContext, subscribe: true })
  user?: User;

  @consume({ context: taskServiceContext })
  taskService!: TaskService;

  connectedCallback() {
    super.connectedCallback();
    emit(this, 'app-page-title-changed', { title: SETTINGS_TITLE });
  }

  render() {
    return html`<div class="responsive">
      <ion-list>
        ${this.user?.role === UserRole.GUEST
          ? html` <ion-item @click=${this.postWaiterRequest}
              ><ion-icon name="chatbubbles-outline"></ion-icon><span>Talk with waiter</span></ion-item
            >`
          : nothing}
        <ion-item> <ion-icon name="heart-outline"></ion-icon><span>My Favorites</span> </ion-item>
        <ion-item @click=${() => this.router.goto('/orders')}
          ><ion-icon name="clipboard-outline"></ion-icon><span>My Orders</span></ion-item
        >
        <ion-item @click=${() => this.router.goto('/reservation/edit')}
          ><ion-icon name="document-outline"></ion-icon><span>My Reservation</span></ion-item
        >
        <ion-item @click=${() => this.router.goto('/profile/edit')}
          ><ion-icon name="person-circle-outline"></ion-icon><span>Edit Profile</span></ion-item
        >
        <ion-item><ion-icon name="lock-closed-outline"></ion-icon><span>Change Password</span></ion-item>
        <ion-item @click=${this.signOut}><ion-icon name="exit-outline"></ion-icon><span>Sign out</span></ion-item>
      </ion-list>
    </div>`;
  }

  signOut() {
    try {
      this.userService.signOut();
      emit(this, 'app-user-changed', { user: undefined });
      emit(this, 'app-open-toast', { message: 'Signed out successfully', mode: 'success' });
    } catch (error) {
      emit(this, 'app-user-changed', { user: undefined });
    }
    this.router.goto('/');
  }

  async postWaiterRequest() {
    try {
      await this.taskService.create(TaskType.TALK_REQUESTED);
      emit(this, 'app-open-toast', {
        message: 'The waiter was notificated and will come soon to you',
        mode: 'success'
      });
    } catch (error) {
      emit(this, 'app-open-toast', { message: (error as HttpError).message, mode: 'danger' });
    }
  }
}
