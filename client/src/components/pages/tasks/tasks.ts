import { LitElement, html, nothing } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { consume } from '@lit/context';
import { Router, routerContext } from '../../../router.js';

import sharedStyle from '../../shared.css?inline';
import componentStyle from './tasks.css?inline';
import { emit } from '../../../event.js';
import { Task, TaskService, TaskType, taskServiceContext } from '../../../services/task.service.js';
import { StringService, stringServiceContext } from '../../../services/string.service.js';
import { User } from '../../../models/user.js';
import { UserService, userServiceContext } from '../../../services/user.service.js';

export const TASKS_TITLE = 'Tasks';
@customElement('app-tasks')
class TasksComponent extends LitElement {
  static styles = [sharedStyle, componentStyle];

  @consume({ context: routerContext, subscribe: true })
  router!: Router;

  @consume({ context: taskServiceContext })
  taskService!: TaskService;

  @consume({ context: stringServiceContext })
  stringService!: StringService;

  @consume({ context: userServiceContext })
  userService!: UserService;

  @state()
  tasks: Task[] = [];

  @state()
  role!: 'waiter' | 'barkeeper' | 'cook';

  @property({ type: String })
  status: Task['status'] = 'open';

  @state()
  users: User[] = [];

  connectedCallback() {
    super.connectedCallback();
    emit(this, 'app-page-title-changed', { title: TASKS_TITLE });
  }

  async firstUpdated() {
    this.fetchData();
  }

  async fetchData(status?: Task['status']) {
    this.status = status ?? this.status;
    this.tasks = await this.taskService.findAll(status ?? this.status);
    for (const task of this.tasks) {
      if (task.guestId) {
        try {
          const user = await this.userService.findOne(task.guestId);
          if (user) {
            this.users = [...this.users, user];
          }
        } catch (error) {
          console.error(error);
        }
      }
    }
  }

  async updateTaskStatus(task: Task) {
    await this.taskService.update(task.id);
    await this.fetchData();
  }

  render() {
    return html` <ion-segment value="${this.status}">
        <ion-segment-button value="open" layout="icon-start" @click=${() => this.fetchData('open')}>
          <ion-label>Open</ion-label>
          <ion-icon name="${this.status === 'open' ? 'list-circle' : 'list-circle-outline'}"></ion-icon>
        </ion-segment-button>
        <ion-segment-button value="claimed" layout="icon-start" @click=${() => this.fetchData('claimed')}>
          <ion-label>Claimed</ion-label>
          <ion-icon name="${this.status === 'claimed' ? 'document-attach' : 'document-attach-outline'}"></ion-icon>
        </ion-segment-button>
        <ion-segment-button value="done" layout="icon-start" @click=${() => this.fetchData('done')}>
          <ion-label>Done</ion-label>
          <ion-icon
            name="${this.status === 'done' ? 'bag-check' : 'bag-check-outline'}"
          ></ion-icon> </ion-segment-button
      ></ion-segment>
      <div class="responsive">${this.tasks.length === 0 ? this.renderNoItemsNotification() : this.renderTasks()}</div>`;
  }

  renderNoItemsNotification() {
    return html`<ion-card class="padding">
      <ion-card-header>
        <ion-card-title>No ${this.status} tasks available!</ion-card-title>
      </ion-card-header>
      <ion-card-content>
        It seems like there are no ${this.status} tasks available. Please check again later.
      </ion-card-content>
    </ion-card>`;
  }

  renderTasks() {
    return html`<ion-list> ${this.tasks.map(task => this.renderTask(task))} </ion-list>`;
  }

  renderTask(task: Task) {
    return html`<ion-item-divider>
        <ion-icon name="${this.getTaskIconName(task)}" slot="start"></ion-icon
        ><span>${task.title} #${task.simpleId} by table ${this.getTableNumber(task)}</span></ion-item-divider
      >
      <ion-item-sliding>
        <ion-item>
          ${this.decideRenderTask(task)}
          <ion-note slot="end">${this.stringService.date(task.createdAt)} </ion-note>
        </ion-item>
        <ion-item-options>
          ${task.status === 'open'
            ? html`<ion-item-option class="success-bg" @click=${() => this.updateTaskStatus(task)}
                >Claim</ion-item-option
              >`
            : nothing}
          ${task.status === 'claimed'
            ? html`<ion-item-option class="success-bg" @click=${() => this.updateTaskStatus(task)}
                >Mark as Done</ion-item-option
              >`
            : nothing}
        </ion-item-options>
      </ion-item-sliding>`;
  }

  decideRenderTask(task: Task) {
    switch (task.type) {
      case TaskType.FOOD_ORDERED:
      case TaskType.DRINK_ORDERED:
      case TaskType.FOOD_PREPARED:
      case TaskType.DRINK_PREPARED:
        return this.renderFoodOrDrinkTask(task);
      case TaskType.PAYMENT_REQUESTED_CASH:
      case TaskType.PAYMENT_REQUESTED_CARD:
        return this.renderPaymentTask(task);
      case TaskType.TALK_REQUESTED:
        return this.renderTalkTask(task);
      default:
        return nothing;
    }
  }

  renderFoodOrDrinkTask(task: Task) {
    return html`<ol>
      ${task.order?.map(orderItem => {
        return html`<li>
          <span>${orderItem.quantity} ${orderItem.quantity === 1 ? 'Pc' : 'Pcs'} of ${orderItem.menuItem.name}</span>
          <br />
          <span class="instructions">${orderItem.instructions}</span>
        </li>`;
      })}
    </ol>`;
  }

  renderPaymentTask(task: Task) {
    switch (task.type) {
      case TaskType.PAYMENT_REQUESTED_CASH:
        return html`<div>
          ${this.getCustomerName(task)} wants to pay $${this.formatCurrency(task.data?.total)} in cash.
        </div>`;
      case TaskType.PAYMENT_REQUESTED_CARD:
        return html`<div>
          ${this.getCustomerName(task)} wants to pay $${this.formatCurrency(task.data?.total)} with card.
        </div>`;
      default:
        return nothing;
    }
  }

  renderTalkTask(task: Task) {
    return html`<div>A customer wants to talk.</div>`;
  }

  renderTabs() {
    return html`
      <ion-segment value="${'food'}">
        <ion-segment-button value="food" layout="icon-start">
          <ion-label>Food</ion-label>
          <ion-icon name="restaurant"></ion-icon>
        </ion-segment-button>
        <ion-segment-button value="drink" layout="icon-start">
          <ion-label>Drinks</ion-label>
          <ion-icon name="wine"></ion-icon> </ion-segment-button
      ></ion-segment>
    `;
  }

  getCustomerName(task: Task) {
    const user = this.users.find(user => user.id === task.guestId);
    if (!user) {
      return 'The customer';
    }
    return user.name.first;
  }

  getTableNumber(task: Task) {
    const user = this.users.find(user => user.id === task.guestId);
    if (!user) {
      return 1;
    }
    return user.table;
  }

  getTaskIconName(task: Task) {
    let result: string;
    switch (task.type) {
      case TaskType.FOOD_ORDERED:
        result = 'restaurant';
        break;
      case TaskType.DRINK_ORDERED:
        result = 'wine';
        break;
      case TaskType.FOOD_PREPARED:
        result = 'restaurant';
        break;
      case TaskType.DRINK_PREPARED:
        result = 'wine';
        break;
      case TaskType.PAYMENT_REQUESTED_CASH:
        result = 'cash';
        break;
      case TaskType.PAYMENT_REQUESTED_CARD:
        result = 'card';
        break;
      case TaskType.TALK_REQUESTED:
        result = 'chatbubbles';
        break;
      default:
        result = 'settings';
    }
    return result + '-outline';
  }

  formatCurrency(price?: number) {
    if (!price) {
      return '';
    }
    const splitted = price.toString().split('.');
    if (splitted.length === 1) {
      return `${splitted[0]}.00`;
    }
    const integer = splitted[0];
    const decimal = splitted[1];
    return `${integer}.${decimal ? decimal.padEnd(2, '0') : '00'}`;
  }
}
