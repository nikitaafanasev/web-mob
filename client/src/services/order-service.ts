import { createContext } from '@lit/context';
import { httpClient } from '../http-client.js';
import { MenuItem } from './menu-item.service.js';
import { Entity } from '../models/entity.js';

export const orderServiceContext = createContext<OrderService>('order-service');

export class OrderService {
  async findAll() {
    const response = await httpClient.api.get('/orders');
    return (await response.json()).results as Promise<Order[]>;
  }

  async create(order: CreateOrder) {
    const response = await httpClient.api.post('/orders', order);
  }
}

export type CreateOrder = Omit<Order, keyof Entity | 'creatorId'>;

export interface Order extends Entity {
  orderItems: OrderItem[];
  price: number;
  quantity: number;
  creatorId: string;
}

export interface OrderItem {
  menuItem: MenuItem;
  quantity: number;
  instructions: string;
}
