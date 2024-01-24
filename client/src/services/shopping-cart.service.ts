import { consume, createContext } from '@lit/context';
import { LitElement } from 'lit';
import { emit } from '../event.js';
import { ShoppingCart, ShoppingCartItem } from '../models/shopping-cart.js';

export const shoppingCartServiceContext = createContext<ShoppingCartService>('shopping-cart-service');

export class ShoppingCartService {
  add(context: LitElement, shoppingCart: ShoppingCart, shoppingCartItem: ShoppingCartItem) {
    const existingItem = shoppingCart.find(item => item.menuItem.id === shoppingCartItem.menuItem.id);
    if (existingItem) {
      existingItem.quantity += shoppingCartItem.quantity;
      existingItem.instructions = shoppingCartItem.instructions;
      emit(context, 'app-shopping-cart-changed', { shoppingCart: [...shoppingCart] });
    } else {
      emit(context, 'app-shopping-cart-changed', { shoppingCart: [...shoppingCart, shoppingCartItem] });
    }
    emit(context, 'app-open-toast', {
      message: `${shoppingCartItem.menuItem.name} successfully added to shopping cart.`,
      mode: 'success'
    });
  }
}
