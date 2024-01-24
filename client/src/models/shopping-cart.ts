import { createContext } from '@lit/context';
import { MenuItem } from '../services/menu-item.service.js';

export const shoppingCartContext = createContext<ShoppingCart>('shopping-cart');

export type ShoppingCart = ShoppingCartItem[];

export interface ShoppingCartItem {
  menuItem: MenuItem;
  quantity: number;
  instructions: string;
}
