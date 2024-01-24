import { Entity } from './entity.js';

// could be food or drink
export interface MenuItem extends Entity {
  name: string;
  description: string;
  price: number;
  type: MenuItemType;
  categories: MenuItemCategory[];
  imageUrl?: string;
  comments: MenuItemComment[];
  ratings: MenuItemRating[];
}

export type MenuItemType = 'food' | 'drink';

export enum MenuItemCategory {
  APPETIZER = 'appetizer',
  ENTREE = 'entree',
  DESSERT = 'dessert',
  VEGAN = 'vegan',
  VEGETARIAN = 'vegetarian',
  SEAFOOD = 'seafood',
  PASTA = 'pasta',
  MEAT = 'meat',
  ALCHOLIC = 'alcoholic',
  NON_ALCHOLIC = 'non-alcoholic'
}

export interface MenuItemComment extends Entity {
  menuItemId: string;
  content: string;
  creatorId: string;
}

export interface MenuItemRating extends Entity {
  menuItemId: string;
  value: number;
  creatorId: string;
}
