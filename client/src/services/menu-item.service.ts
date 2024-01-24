import { createContext } from '@lit/context';
import { httpClient } from '../http-client.js';
import { Entity } from '../models/entity.js';

export const menuItemServiceContext = createContext<MenuItemService>('menu-item-service');

export const NOT_RATED_LABEL = 'N/A';

export class MenuItemService {
  async createComment(menuItemId: string, data: Pick<MenuItemComment, 'content'>) {
    const response = httpClient.api.post(`/menu-items/${menuItemId}/comments`, data);
    const json = await (await response).json();
    const result = json as MenuItemComment;
    return result;
  }

  async createRating(menuItemId: string, data: Pick<MenuItemRating, 'value'>) {
    const response = await httpClient.api.post(`/menu-items/${menuItemId}/ratings`, data);
    const json = await response.json();
    const result = json as MenuItemRating;
    return result;
  }
  async findAll(type: MenuItem['type']) {
    const response = await httpClient.api.get('/menu-items?type=' + type);
    const json = await response.json();
    const results = json.results as MenuItem[];
    return results;
  }

  async findOne(id: string) {
    const response = await httpClient.api.get(`/menu-items/${id}`);
    const json = await response.json();
    const result = json as MenuItem;
    return result;
  }

  async remove(id: string) {
    await httpClient.api.delete(`/menu-items/${id}`);
  }

  calculateAverageRating(menuItem: MenuItem) {
    const ratings = menuItem.ratings;
    if (!ratings || ratings.length === 0) {
      return 0;
    }
    const sum = ratings.reduce((acc, rating) => acc + rating.value, 0);
    const rating = sum / ratings.length;
    return rating;
  }

  getAverageRatingLabel(menuItem?: MenuItem) {
    try {
      const rating = this.calculateAverageRating(menuItem!);
      return rating !== 0 ? rating.toFixed(1) : NOT_RATED_LABEL;
    } catch (err) {
      return NOT_RATED_LABEL;
    }
  }

  getImageUrl(menuItem?: MenuItem) {
    const url = menuItem?.imageUrl;
    return url ? url + '#' + Date.now() : 'placeholder.jpg';
  }

  mapCategoryLabel(category: string) {
    const label = menuItemCatgoryLabelMapper[category as MenuItemCategory];
    if (!label) {
      return category;
    }
    return label;
  }
}

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

export interface MenuItemComment extends Entity {
  menuItemId: string;
  content: string;
  creatorId: string;
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

const menuItemCatgoryLabelMapper: Record<MenuItemCategory, string> = {
  [MenuItemCategory.APPETIZER]: 'Appetizer',
  [MenuItemCategory.ENTREE]: 'Entree',
  [MenuItemCategory.DESSERT]: 'Dessert',
  [MenuItemCategory.VEGAN]: 'Vegan',
  [MenuItemCategory.VEGETARIAN]: 'Vegetarian',
  [MenuItemCategory.SEAFOOD]: 'Seafood',
  [MenuItemCategory.PASTA]: 'Pasta',
  [MenuItemCategory.MEAT]: 'Meat',
  [MenuItemCategory.ALCHOLIC]: 'Alcoholic',
  [MenuItemCategory.NON_ALCHOLIC]: 'Non-Alcoholic'
};

export interface MenuItemRating extends Entity {
  menuItemId: string;
  value: number;
  creatorId: string;
}
