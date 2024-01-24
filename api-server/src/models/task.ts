import { Entity } from './entity.js';
import { OrderItem } from './order.js';

export interface Task extends Entity {
  simpleId: string;
  title: string;
  description: string;
  type: TaskType;
  status: 'open' | 'claimed' | 'done';
  order?: OrderItem[];
  claimerId?: string;
  data?: any;
  guestId: string;
}

export enum TaskType {
  FOOD_ORDERED = 'food-ordered',
  DRINK_ORDERED = 'drink-ordered',
  FOOD_PREPARED = 'food-prepared',
  DRINK_PREPARED = 'drink-prepared',
  PAYMENT_REQUESTED_CASH = 'payment-requested',
  PAYMENT_REQUESTED_CARD = 'payment-requested-card',
  TALK_REQUESTED = 'talk-requested'
}
