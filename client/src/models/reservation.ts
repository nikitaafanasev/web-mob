import { createContext } from '@lit/context';
import { Entity } from './entity.js';

export const reservationContext = createContext<Reservation | undefined>('reservation');

export interface Reservation extends Entity {
  time: number;
  phone: number;
  name: {
    first: string;
    last: string;
  };
}
