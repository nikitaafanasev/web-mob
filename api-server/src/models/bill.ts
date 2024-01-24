import { Entity } from './entity.js';
import { MenuItem } from './menu-item.js';

export interface Bill extends Entity {
  food: MenuItem[];
  drinks: MenuItem[];
  total: number;
  taxes: number;
  tip: number;
  payerId: string;
  paid: boolean;
}
