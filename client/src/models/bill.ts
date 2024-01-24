import { MenuItem } from '../services/menu-item.service.js';
import { Entity } from './entity.js';

export interface Bill extends Entity {
  food: MenuItem[];
  drinks: MenuItem[];
  total: number;
  taxes: number;
  tip: number;
  payerId: string;
  paid: boolean;
}
