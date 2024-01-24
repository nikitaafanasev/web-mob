import { createContext } from '@lit/context';
import { httpClient } from '../http-client.js';
import { Entity } from '../models/entity.js';
import { OrderItem } from './order-service.js';

export const taskServiceContext = createContext<TaskService>('task-service');

export class TaskService {
  async findAll(status: Task['status']) {
    const response = await httpClient.api.get('/tasks?status=' + status);
    return (await response.json()).results as Promise<Task[]>;
  }

  // Backend updates the status
  async update(id: string) {
    await httpClient.api.post('/tasks/' + id + '/next', {});
  }

  async create(taskType: TaskType, data?: any) {
    const response = await httpClient.api.post('/tasks', { type: taskType, data });
    return (await response.json()) as Promise<Task>;
  }
}

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
