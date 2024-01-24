import { Entity } from './entity.js';
import { MenuItem } from './menu-item.js';

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
